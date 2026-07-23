import assert from "node:assert/strict";
import test from "node:test";

import { AlertRule } from "../src/alerts/domain/entities/alert-rule";
import { AlertMetric } from "../src/alerts/domain/enums/alert-metric.enum";
import { AlertOperator } from "../src/alerts/domain/enums/alert-operator.enum";
import { AlertRuleState } from "../src/alerts/domain/enums/alert-rule-state.enum";
import { NotificationChannel } from "../src/alerts/domain/enums/notification-channel.enum";
import { InvalidCooldownMinutesError } from "../src/alerts/domain/errors/invalid-cooldown-minutes-error";
import { InvalidNotificationDateError } from "../src/alerts/domain/errors/invalid-notification-date-error";

function createRule(cooldownMinutes = 30): AlertRule {
  return AlertRule.create({
    metric: AlertMetric.ACTIVE_CONNECTIONS,
    operator: AlertOperator.GREATER_THAN,
    threshold: 10,
    channel: NotificationChannel.WHATSAPP,
    destination: "5511999999999",
    cooldownMinutes,
    databaseConnectionId: "550e8400-e29b-41d4-a716-446655440000",
  });
}

test("creates a NORMAL rule with an empty notification timestamp", () => {
  const rule = createRule();

  assert.equal(rule.currentState, AlertRuleState.NORMAL);
  assert.equal(rule.lastNotificationAt, undefined);
  assert.equal(rule.cooldownMinutes, 30);
});

test("validates the cooldown minute boundaries", () => {
  for (const value of [1, 30, 10080]) {
    assert.equal(createRule(value).cooldownMinutes, value);
  }

  for (const value of [0, -1, 10081, 1.5, NaN, Infinity]) {
    assert.throws(() => createRule(value), InvalidCooldownMinutesError);
  }
});

test("calculates notification eligibility using an inclusive cooldown boundary", () => {
  const rule = createRule(30);
  const sentAt = new Date("2026-07-23T10:00:00.000Z");

  assert.equal(rule.canNotify(sentAt), true);
  rule.registerSuccessfulNotification(sentAt);

  assert.equal(rule.canNotify(new Date("2026-07-23T10:29:59.999Z")), false);
  assert.equal(rule.canNotify(new Date("2026-07-23T10:30:00.000Z")), true);
  assert.equal(rule.canNotify(new Date("2026-07-23T10:30:00.001Z")), true);
});

test("marks a rule as triggered idempotently", () => {
  const rule = createRule();

  rule.markAsTriggered();
  assert.equal(rule.currentState, AlertRuleState.TRIGGERED);
  const updatedAt = rule.updatedAt;
  rule.markAsTriggered();

  assert.equal(rule.currentState, AlertRuleState.TRIGGERED);
  assert.equal(rule.updatedAt.getTime(), updatedAt.getTime());
});

test("marks a rule as normal, clears the timestamp and is idempotent", () => {
  const rule = createRule();
  rule.markAsTriggered();
  rule.registerSuccessfulNotification(new Date("2026-07-23T10:00:00.000Z"));

  rule.markAsNormal();
  assert.equal(rule.currentState, AlertRuleState.NORMAL);
  assert.equal(rule.lastNotificationAt, undefined);
  const updatedAt = rule.updatedAt;
  rule.markAsNormal();

  assert.equal(rule.updatedAt.getTime(), updatedAt.getTime());
});

test("registers a safe successful notification timestamp and rejects invalid dates", () => {
  const rule = createRule();
  const sentAt = new Date("2026-07-23T10:00:00.000Z");
  rule.registerSuccessfulNotification(sentAt);
  sentAt.setFullYear(2000);

  assert.equal(
    rule.lastNotificationAt?.toISOString(),
    "2026-07-23T10:00:00.000Z",
  );
  assert.throws(
    () => rule.registerSuccessfulNotification(new Date("invalid")),
    InvalidNotificationDateError,
  );
});

test("updates configuration and resets the operational state", () => {
  const rule = createRule();
  rule.markAsTriggered();
  rule.registerSuccessfulNotification(new Date());

  rule.update({
    metric: AlertMetric.TABLES_COUNT,
    operator: AlertOperator.LESS_THAN,
    threshold: 5,
    channel: NotificationChannel.WHATSAPP,
    destination: "5511999999999",
    cooldownMinutes: 60,
  });

  assert.equal(rule.cooldownMinutes, 60);
  assert.equal(rule.currentState, AlertRuleState.NORMAL);
  assert.equal(rule.lastNotificationAt, undefined);
});

test("disabling and enabling reset the operational state", () => {
  const rule = createRule();
  rule.markAsTriggered();
  rule.registerSuccessfulNotification(new Date());
  rule.disable();

  assert.equal(rule.enabled, false);
  assert.equal(rule.currentState, AlertRuleState.NORMAL);
  assert.equal(rule.lastNotificationAt, undefined);

  rule.markAsTriggered();
  rule.registerSuccessfulNotification(new Date());
  rule.enable();

  assert.equal(rule.enabled, true);
  assert.equal(rule.currentState, AlertRuleState.NORMAL);
  assert.equal(rule.lastNotificationAt, undefined);
});
