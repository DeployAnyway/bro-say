import { URL } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  broMessage,
  messageCategories,
  messagePresets,
  renderBro,
} from "../src/index.js";
test("message catalog is original, independent, seeded and preserves caller content", () => {
  const all = messageCategories().flatMap(messagePresets);
  assert.equal(all.length, 48);
  assert.equal(new Set(all).size, 48);
  for (const category of messageCategories()) {
    assert.equal(
      broMessage(category, { seed: "demo" }),
      broMessage(category, { seed: "demo" }),
    );
    assert.ok(messagePresets(category).includes(broMessage(category)));
  }
  const copy = messagePresets("husky");
  copy.pop();
  assert.equal(messagePresets("husky").length, 6);
  assert.match(
    renderBro({ text: "My exact message", mood: "dallas" }).rendered,
    /My exact message/,
  );
  for (const category of ["unknown", "constructor", 1, null])
    assert.throws(() => messagePresets(category), RangeError);
  for (const seed of [NaN, Infinity, {}, null, true])
    assert.throws(() => broMessage("focus", { seed }), TypeError);
  assert.throws(() => broMessage("focus", null), TypeError);
  assert.throws(() => broMessage("focus", []), TypeError);
  assert.equal(
    broMessage(" FOCUS ", { seed: 42 }),
    broMessage("focus", { seed: 42 }),
  );
});
test("CLI presets agree with API and listing does not consume stdin", () => {
  const run = (args) =>
    spawnSync(process.execPath, ["bin/cli.js", ...args], {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
    });
  const output = run(["--preset", "husky", "--seed", "demo", "--json"]);
  assert.equal(output.status, 0);
  assert.equal(
    JSON.parse(output.stdout).text,
    broMessage("husky", { seed: "demo" }),
  );
  assert.deepEqual(
    run(["--list-presets"]).stdout.trim().split("\n"),
    messageCategories(),
  );
  assert.equal(run(["--preset", "husky", "manual"]).status, 2);
  assert.equal(run(["--preset", "missing"]).status, 2);
});
