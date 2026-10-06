import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

test("production Docker image starts Node directly as PID 1", () => {
  const dockerfile = readFileSync(resolve(process.cwd(), "Dockerfile"), "utf8");
  const commands = [...dockerfile.matchAll(/^CMD\s+(.+)$/gm)];
  const productionCommand = commands.at(-1)?.[1];

  assert.ok(productionCommand, "expected a production CMD in Dockerfile");
  assert.deepEqual(JSON.parse(productionCommand), ["node", "dist/main.js"]);
});
