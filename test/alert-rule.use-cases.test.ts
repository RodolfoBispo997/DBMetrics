import assert from "node:assert/strict";
import test from "node:test";
import { AlertRule } from "../src/alerts/domain/entities/alert-rule";
import { AlertMetric } from "../src/alerts/domain/enums/alert-metric.enum";
import { AlertOperator } from "../src/alerts/domain/enums/alert-operator.enum";
import { NotificationChannel } from "../src/alerts/domain/enums/notification-channel.enum";
import { AlertRuleNotFoundError } from "../src/alerts/domain/errors/alert-rule-not-found-error";
import { AlertExecutionNotFoundError } from "../src/alerts/domain/errors/alert-execution-not-found-error";
import { DatabaseConnection } from "../src/database-connection/domain/entities/database-connection";
import { DatabaseProvider } from "../src/database-connection/domain/enums/database-provider.enum";
import { DatabaseConnectionNotFoundError } from "../src/database-connection/domain/errors/database-connection-not-found-error";
import { CreateAlertRuleUseCase } from "../src/alerts/application/use-cases/create-alert-rule/create-alert-rule.use-case";
import { GetAlertRuleUseCase } from "../src/alerts/application/use-cases/get-alert-rule/get-alert-rule.use-case";
import { ListAlertRulesUseCase } from "../src/alerts/application/use-cases/list-alert-rules/list-alert-rules.use-case";
import { UpdateAlertRuleUseCase } from "../src/alerts/application/use-cases/update-alert-rule/update-alert-rule.use-case";
import { EnableAlertRuleUseCase } from "../src/alerts/application/use-cases/enable-alert-rule/enable-alert-rule.use-case";
import { DisableAlertRuleUseCase } from "../src/alerts/application/use-cases/disable-alert-rule/disable-alert-rule.use-case";
import { DeleteAlertRuleUseCase } from "../src/alerts/application/use-cases/delete-alert-rule/delete-alert-rule.use-case";
import { GetAlertExecutionUseCase } from "../src/alerts/application/use-cases/get-alert-execution/get-alert-execution.use-case";
import { ListAlertExecutionsUseCase } from "../src/alerts/application/use-cases/list-alert-executions/list-alert-executions.use-case";
import { InvalidDatabaseConnectionIdError } from "../src/database-metric/domain/errors/invalid-database-connection-id-error";

const owner = "00000000-0000-4000-8000-000000000001";
const other = "00000000-0000-4000-8000-000000000002";
const connectionId = "00000000-0000-4000-8000-000000000003";
const connection = (userId = owner) =>
  DatabaseConnection.restore({
    id: connectionId,
    name: "Primary",
    provider: DatabaseProvider.POSTGRESQL,
    host: "localhost",
    port: 5432,
    database: "metrics",
    username: "user",
    password: "secret",
    userId,
  });
const makeRule = () =>
  AlertRule.create({
    metric: AlertMetric.DATABASE_SIZE,
    operator: AlertOperator.GREATER_THAN,
    threshold: 10,
    channel: NotificationChannel.WHATSAPP,
    destination: "5511999999999",
    cooldownMinutes: 45,
    databaseConnectionId: connectionId,
  });
const connRepo = (value: DatabaseConnection | null = connection()) => ({
  save: async () => undefined,
  findById: async () => value,
  findManyByUserId: async () => [],
  findAll: async () => [],
  update: async () => undefined,
  delete: async () => undefined,
});

test("CreateAlertRuleUseCase saves an owned rule and preserves its requested cooldown", async () => {
  let saved: AlertRule | undefined;
  const useCase = new CreateAlertRuleUseCase(
    {
      save: async (rule) => {
        saved = rule;
      },
      findById: async () => null,
      findManyByConnectionId: async () => [],
      update: async () => undefined,
      delete: async () => undefined,
    },
    connRepo(),
  );
  const rule = await useCase.execute({
    userId: owner,
    connectionId,
    metric: AlertMetric.DATABASE_SIZE,
    operator: AlertOperator.GREATER_THAN,
    threshold: 10,
    channel: NotificationChannel.WHATSAPP,
    destination: "5511999999999",
    cooldownMinutes: 45,
  });
  assert.equal(saved, rule);
  assert.equal(rule.cooldownMinutes, 45);
});

test("Alert rule management preserves ownership and avoids writes on rejected operations", async () => {
  const rule = makeRule();
  let writes = 0;
  const rules = {
    save: async () => {
      writes++;
    },
    findById: async () => rule,
    findManyByConnectionId: async () => [rule],
    update: async () => {
      writes++;
    },
    delete: async () => {
      writes++;
    },
  };
  const unauthorizedConnection = connRepo(connection(other));
  await assert.rejects(
    () =>
      new GetAlertRuleUseCase(rules, unauthorizedConnection).execute({
        alertRuleId: rule.id,
        userId: owner,
      }),
    AlertRuleNotFoundError,
  );
  await assert.rejects(
    () =>
      new UpdateAlertRuleUseCase(rules, unauthorizedConnection).execute({
        alertRuleId: rule.id,
        userId: owner,
        metric: AlertMetric.DATABASE_SIZE,
        operator: AlertOperator.GREATER_THAN,
        threshold: 11,
        channel: NotificationChannel.WHATSAPP,
        destination: "5511999999999",
        cooldownMinutes: 45,
      }),
    DatabaseConnectionNotFoundError,
  );
  await assert.rejects(
    () =>
      new DeleteAlertRuleUseCase(rules, unauthorizedConnection).execute({
        alertRuleId: rule.id,
        userId: owner,
      }),
    DatabaseConnectionNotFoundError,
  );
  assert.equal(writes, 0);
});

test("List, enable and disable manage rules only for an authorized connection", async () => {
  const rule = makeRule();
  let updates = 0;
  const rules = {
    save: async () => undefined,
    findById: async () => rule,
    findManyByConnectionId: async (id: string) => {
      assert.equal(id, connectionId);
      return [rule];
    },
    update: async () => {
      updates++;
    },
    delete: async () => undefined,
  };
  const list = new ListAlertRulesUseCase(rules, connRepo());
  assert.deepEqual(await list.execute({ connectionId, userId: owner }), [rule]);
  assert.equal(
    (
      await new DisableAlertRuleUseCase(rules, connRepo()).execute({
        alertRuleId: rule.id,
        userId: owner,
      })
    ).enabled,
    false,
  );
  assert.equal(
    (
      await new EnableAlertRuleUseCase(rules, connRepo()).execute({
        alertRuleId: rule.id,
        userId: owner,
      })
    ).enabled,
    true,
  );
  assert.equal(updates, 2);
});

test("Alert execution read and list hide executions outside the user's connection", async () => {
  const execution = { databaseConnectionId: connectionId };
  const executions = {
    save: async () => undefined,
    update: async () => undefined,
    findById: async () => execution,
    findManyByConnectionId: async (data: { skip: number; take: number }) => {
      assert.deepEqual(data, { connectionId, skip: 2, take: 2 });
      return { executions: [execution], total: 3 };
    },
    findRecent: async () => [],
  };
  const get = new GetAlertExecutionUseCase(executions as never, connRepo());
  assert.equal(
    await get.execute({ executionId: "execution", userId: owner }),
    execution,
  );
  await assert.rejects(
    () =>
      new GetAlertExecutionUseCase(
        executions as never,
        connRepo(connection(other)),
      ).execute({ executionId: "execution", userId: owner }),
    AlertExecutionNotFoundError,
  );
  const listed = await new ListAlertExecutionsUseCase(
    executions as never,
    connRepo(),
  ).execute({ connectionId, userId: owner, page: 2, pageSize: 2 });
  assert.equal(listed.totalPages, 2);
  await assert.rejects(
    () =>
      new ListAlertExecutionsUseCase(
        executions as never,
        connRepo(null),
      ).execute({ connectionId, userId: owner, page: 1, pageSize: 2 }),
    InvalidDatabaseConnectionIdError,
  );
});

test("alert creation rejects unauthorized and invalid data without saving", async () => {
  let saves = 0;
  const rules = {
    save: async () => {
      saves++;
    },
    findById: async () => null,
    findManyByConnectionId: async () => [],
    update: async () => undefined,
    delete: async () => undefined,
  };
  const request = {
    userId: owner,
    connectionId,
    metric: AlertMetric.DATABASE_SIZE,
    operator: AlertOperator.GREATER_THAN,
    threshold: 1,
    channel: NotificationChannel.WHATSAPP,
    destination: "5511999999999",
    cooldownMinutes: 45,
  };
  await assert.rejects(
    () => new CreateAlertRuleUseCase(rules, connRepo(null)).execute(request),
    DatabaseConnectionNotFoundError,
  );
  await assert.rejects(
    () =>
      new CreateAlertRuleUseCase(rules, connRepo(connection(other))).execute(
        request,
      ),
    DatabaseConnectionNotFoundError,
  );
  await assert.rejects(() =>
    new CreateAlertRuleUseCase(rules, connRepo()).execute({
      ...request,
      threshold: -1,
    }),
  );
  assert.equal(saves, 0);
});

test("alert management authorized writes and missing resources retain their current errors", async () => {
  const rule = makeRule();
  let updates = 0;
  let deletes = 0;
  const rules = {
    save: async () => undefined,
    findById: async () => rule,
    findManyByConnectionId: async () => [],
    update: async () => {
      updates++;
    },
    delete: async () => {
      deletes++;
    },
  };
  const updated = await new UpdateAlertRuleUseCase(rules, connRepo()).execute({
    alertRuleId: rule.id,
    userId: owner,
    metric: AlertMetric.TABLES_COUNT,
    operator: AlertOperator.LESS_THAN,
    threshold: 7,
    channel: NotificationChannel.WHATSAPP,
    destination: "5511999999999",
    cooldownMinutes: 60,
  });
  assert.equal(updated.cooldownMinutes, 60);
  assert.equal(updated.threshold, 7);
  assert.equal(updates, 1);
  await new DeleteAlertRuleUseCase(rules, connRepo()).execute({
    alertRuleId: rule.id,
    userId: owner,
  });
  assert.equal(deletes, 1);
  await assert.rejects(
    () =>
      new GetAlertRuleUseCase(
        { ...rules, findById: async () => null },
        connRepo(),
      ).execute({ alertRuleId: rule.id, userId: owner }),
    AlertRuleNotFoundError,
  );
  let executionQueries = 0;
  const executions = {
    save: async () => undefined,
    update: async () => undefined,
    findById: async () => null,
    findManyByConnectionId: async () => {
      executionQueries++;
      return { executions: [], total: 0 };
    },
    findRecent: async () => [],
  };
  await assert.rejects(
    () =>
      new GetAlertExecutionUseCase(executions as never, connRepo()).execute({
        executionId: "none",
        userId: owner,
      }),
    AlertExecutionNotFoundError,
  );
  await assert.rejects(
    () =>
      new ListAlertExecutionsUseCase(
        executions as never,
        connRepo(connection(other)),
      ).execute({ connectionId, userId: owner, page: 1, pageSize: 1 }),
    InvalidDatabaseConnectionIdError,
  );
  assert.equal(executionQueries, 0);
});

test("enable and disable reject another user's rule without updating", async () => {
  const rule = makeRule();
  let updates = 0;
  const rules = {
    save: async () => undefined,
    findById: async () => rule,
    findManyByConnectionId: async () => [],
    update: async () => {
      updates++;
    },
    delete: async () => undefined,
  };
  for (const UseCase of [EnableAlertRuleUseCase, DisableAlertRuleUseCase]) {
    await assert.rejects(
      () =>
        new UseCase(rules, connRepo(connection(other))).execute({
          alertRuleId: rule.id,
          userId: owner,
        }),
      DatabaseConnectionNotFoundError,
    );
  }
  assert.equal(updates, 0);
});
