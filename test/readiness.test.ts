import assert from "node:assert/strict";
import test from "node:test";
import type { Response } from "express";
import { AppController } from "../src/app/app.controller";
import { ReadinessService } from "../src/app/readiness.service";
import { getAppReadinessTimeoutMs } from "../src/shared/config/environment.config";
import { PrismaService } from "../src/shared/infra/database/prisma/prisma.service";
import { enableGracefulShutdown } from "../src/shared/lifecycle/enable-graceful-shutdown";

test("health liveness response does not query application dependencies", () => {
	const readinessService = {
		isReady: async () => {
			assert.fail("liveness must not check readiness dependencies");
		},
	};
	const controller = new AppController(readinessService as ReadinessService);

	assert.deepEqual(controller.health(), { status: "ok" });
});

test("readiness reports ready when the primary database check succeeds", async () => {
	let query: TemplateStringsArray | undefined;
	const prisma = {
		$queryRaw: async (strings: TemplateStringsArray) => {
			query = strings;
			return [{ "?column?": 1 }];
		},
	} as unknown as PrismaService;
	const service = new ReadinessService(prisma, 2000);
	const controller = new AppController(service);
	let statusCode = 0;

	assert.deepEqual(
		await controller.ready({
			status: (status) => {
				statusCode = status;
				return {} as Response;
			},
		} as unknown as Response),
		{ status: "ready" },
	);
	assert.equal(statusCode, 200);
	assert.equal(query?.join(""), "SELECT 1");
});

test("readiness reports not ready when the primary database check fails", async () => {
	const prisma = {
		$queryRaw: async () => {
			throw new Error("private database connection detail");
		},
	} as unknown as PrismaService;
	const service = new ReadinessService(prisma, 2000);
	const controller = new AppController(service);
	let statusCode = 0;

	assert.deepEqual(
		await controller.ready({
			status: (status) => {
				statusCode = status;
				return {} as never;
			},
		} as unknown as Response),
		{ status: "not_ready" },
	);
	assert.equal(statusCode, 503);
});

test("readiness times out when the primary database does not respond", async () => {
	const prisma = {
		$queryRaw: () => new Promise<never>(() => undefined),
	} as unknown as PrismaService;
	const service = new ReadinessService(prisma, 5);
	const controller = new AppController(service);
	let statusCode = 0;

	assert.deepEqual(
		await controller.ready({
			status: (status) => {
				statusCode = status;
				return {} as Response;
			},
		} as unknown as Response),
		{ status: "not_ready" },
	);
	assert.equal(statusCode, 503);
});

test("APP_READINESS_TIMEOUT_MS defaults to two seconds and accepts only positive integers", () => {
	const previousValue = process.env.APP_READINESS_TIMEOUT_MS;

	try {
		delete process.env.APP_READINESS_TIMEOUT_MS;
		assert.equal(getAppReadinessTimeoutMs(), 2000);

		process.env.APP_READINESS_TIMEOUT_MS = "1250";
		assert.equal(getAppReadinessTimeoutMs(), 1250);

		for (const invalidValue of ["0", "-1", "1.5", "fast"]) {
			process.env.APP_READINESS_TIMEOUT_MS = invalidValue;
			assert.throws(
				() => getAppReadinessTimeoutMs(),
				/APP_READINESS_TIMEOUT_MS must be an integer greater than zero/,
			);
		}
	} finally {
		if (previousValue === undefined) {
			delete process.env.APP_READINESS_TIMEOUT_MS;
		} else {
			process.env.APP_READINESS_TIMEOUT_MS = previousValue;
		}
	}
});

test("graceful shutdown configuration enables Nest shutdown hooks", () => {
	let enabled = false;

	enableGracefulShutdown({
		enableShutdownHooks: () => {
			enabled = true;
		},
	});

	assert.equal(enabled, true);
});
