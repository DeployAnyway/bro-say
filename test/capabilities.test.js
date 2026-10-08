import { URL } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { brosay } from "../src/index.js";
test("box preserves multiline messages and has aligned ASCII borders", () => {
  const message = "Build passed!\nShip carefully.";
  const output = brosay(message, { mood: "hype", box: true });
  const lines = output.split("\n");
  assert.equal(new Set(lines.map((line) => line.length)).size, 1);
  assert.equal(lines[0], lines.at(-1));
  assert.ok(output.includes("Build passed!"));
  assert.ok(output.includes("Ship carefully."));
  const cli = spawnSync(
    process.execPath,
    ["bin/cli.js", message, "--mood", "hype", "--box"],
    { cwd: new URL("..", import.meta.url), encoding: "utf8" },
  );
  assert.equal(cli.status, 0);
  assert.equal(cli.stdout.trimEnd(), output);
});
test("box validates type and bounds without restricting existing unboxed messages", () => {
  assert.throws(() => brosay("ok", { box: "yes" }), TypeError);
  assert.throws(() => brosay("x".repeat(201), { box: true }), RangeError);
  assert.throws(
    () => brosay(Array(100).fill("x").join("\n"), { box: true }),
    RangeError,
  );
  assert.ok(
    brosay("x".repeat(201), { layout: "plain" }).includes("x".repeat(201)),
  );
});
