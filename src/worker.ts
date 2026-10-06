import { connect, type Channel, type ConfirmChannel, type Connection } from "amqplib";
import { Logger } from "@nestjs/common";

import { PrismaService } from "./shared/infra/database/prisma/prisma.service";
import { getEnvironmentConfig } from "./shared/config/environment.config";
import { AlertOutboxDispatcherService } from "./alerts/application/services/alert-outbox-dispatcher.service";
import { PrismaAlertOutboxRepository } from "./alerts/infra/repositories/prisma-alert-outbox.repository";
import { AlertOutboxRepository } from "./alerts/application/repositories/alert-outbox-repository";
import { AlertExecutionRepository } from "./alerts/application/repositories/alert-execution-repository";
import { PrismaAlertExecutionRepository } from "./alerts/infra/repositories/prisma-alert-execution.repository";
import { NotificationService } from "./alerts/application/services/notification.service";
import { AlertDeliveryConsumerService } from "./alerts/application/services/alert-delivery-consumer.service";
import { EvolutionService } from "./shared/integrations/evolution/evolution.service";
import { HttpEvolutionClient } from "./shared/integrations/evolution/evolution.client";
import { EvolutionNotificationService } from "./alerts/infra/notifications/evolution/evolution-notification.service";
import { AlertExecution } from "./alerts/domain/entities/alert-execution";
import { AlertExecutionStatus } from "./alerts/domain/enums/alert-execution-status.enum";
import { AlertMetric } from "./alerts/domain/enums/alert-metric.enum";
import { AlertOperator } from "./alerts/domain/enums/alert-operator.enum";
import { NotificationChannel } from "./alerts/domain/enums/notification-channel.enum";
import { DatabaseProvider } from "./database-connection/domain/enums/database-provider.enum";

const logger = new Logger("AlertWorker");
const EXCHANGE_NAME = "dbmetrics.alerts";
const DLX_NAME = "dbmetrics.alerts.dlx";
const QUEUE_NAME = "dbmetrics.alerts.queue";
const DLQ_NAME = "dbmetrics.alerts.dlq";
const DELIVERY_RETRY_QUEUE = "dbmetrics.alerts.delivery-retry";
const ROUTING_KEY = "alert.notification";

async function createQueueTopology(
  channel: Channel | ConfirmChannel,
): Promise<void> {
  await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });
  await channel.assertExchange(DLX_NAME, "topic", { durable: true });
  await channel.assertQueue(QUEUE_NAME, {
    durable: true,
    arguments: { "x-dead-letter-exchange": DLX_NAME },
  });
  await channel.assertQueue(DLQ_NAME, { durable: true });
  await channel.assertQueue(DELIVERY_RETRY_QUEUE, {
    durable: true,
    arguments: {
      "x-message-ttl": 300000,
      "x-dead-letter-exchange": EXCHANGE_NAME,
      "x-dead-letter-routing-key": ROUTING_KEY,
    },
  });
  await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, "alert.#");
  await channel.bindQueue(DLQ_NAME, DLX_NAME, "#");
}

async function publishWithConfirm(
  channel: ConfirmChannel,
  exchange: string,
  routingKey: string,
  payload: unknown,
  options: { expiration?: string } = {},
): Promise<void> {
  const success = channel.publish(
    exchange,
    routingKey,
    Buffer.from(JSON.stringify(payload)),
    { persistent: true, ...(options.expiration ? { expiration: options.expiration } : {}) },
  );
  void success;
  await channel.waitForConfirms();
}

export async function requeueForActiveDeliveryLease(
  channel: ConfirmChannel,
  payload: unknown,
  delayMs: number,
): Promise<void> {
  await publishWithConfirm(
    channel,
    "",
    DELIVERY_RETRY_QUEUE,
    payload,
    { expiration: String(Math.min(Math.max(1000, delayMs), 300000)) },
  );
}

function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message.replace(/https?:\/\/\S+/g, "[url]").slice(0, 1000);
  }

  return "Alert delivery failed";
}

function getRetryDelayMs(currentAttempt: number): number {
  const config = getEnvironmentConfig().alerts.outbox;
  const baseDelayMs = config.retryBaseDelayMs;
  const maxDelayMs = config.retryMaxDelayMs;
  const exponentialDelay = baseDelayMs * 2 ** Math.max(0, currentAttempt - 1);
  return Math.min(exponentialDelay, maxDelayMs);
}

async function startConsumer(
  channel: ConfirmChannel,
  consumer: AlertDeliveryConsumerService<any>,
): Promise<void> {
  await channel.consume(QUEUE_NAME, async (message) => {
    if (message) await consumer.handle(message, message.content);
  }, { noAck: false });
}
async function runWorker(): Promise<void> {
  const config = getEnvironmentConfig();
  const prisma = new PrismaService();
  await prisma.$connect();

  const evolutionConfig = {
    baseUrl: config.evolution.baseUrl,
    apiKey: config.evolution.apiKey,
    instance: config.evolution.instance,
  };

  const client = new HttpEvolutionClient({
    baseUrl: evolutionConfig.baseUrl,
    apiKey: evolutionConfig.apiKey,
    instance: evolutionConfig.instance,
  });

  const evolutionService = new EvolutionService(client as never, {
    baseUrl: evolutionConfig.baseUrl,
    apiKey: evolutionConfig.apiKey,
    instance: evolutionConfig.instance,
  } as never);

  const notificationService = new EvolutionNotificationService(evolutionService);

  const connection = (await connect(config.alerts.rabbitMqUrl)) as Awaited<
    ReturnType<typeof connect>
  >;
  const confirmChannel = (await connection.createConfirmChannel()) as ConfirmChannel;
  const consumerChannel = (await connection.createConfirmChannel()) as ConfirmChannel;

  await createQueueTopology(confirmChannel);
  await createQueueTopology(consumerChannel);

  const outboxRepository = new PrismaAlertOutboxRepository(prisma);
  const executionRepository = new PrismaAlertExecutionRepository(prisma);
  const dispatcher = new AlertOutboxDispatcherService(outboxRepository, {
    publish: async (event) => {
      await publishWithConfirm(confirmChannel, EXCHANGE_NAME, ROUTING_KEY, event);
    },
  }, executionRepository);

  const deliveryConsumer = new AlertDeliveryConsumerService(
    executionRepository,
    outboxRepository,
    notificationService,
    {
      ack: (message: any) => consumerChannel.ack(message),
      nackToDlq: (message: any) => consumerChannel.nack(message, false, false),
      scheduleRetry: async (message: any, retryAfterMs: number) => {
        await requeueForActiveDeliveryLease(consumerChannel, JSON.parse(message.content.toString()), retryAfterMs);
      },
    },
  );

  await startConsumer(consumerChannel, deliveryConsumer);

  logger.log("Alert worker started");

  setInterval(async () => {
    try {
      await dispatcher.dispatchPending();
    } catch (error) {
      logger.error(`Outbox dispatch failed: ${sanitizeError(error)}`);
    }
  }, config.alerts.outbox.pollIntervalMs);

  const shutdown = async () => {
    await consumerChannel.close();
    await confirmChannel.close();
    await connection.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

void runWorker().catch((error: unknown) => {
  logger.error(`Alert worker startup failed: ${sanitizeError(error)}`);
  process.exit(1);
});
