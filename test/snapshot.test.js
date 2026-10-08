import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { brosay } from "../src/index.js";
test("signature husky output is stable", () =>
  assert.equal(
    brosay("Deploy anyway.") + "\n",
    readFileSync(new URL("./fixtures/husky.txt", import.meta.url), "utf8"),
  ));
import { safeText } from "../src/text.js";
test("private-use Unicode survives sanitization and a giant legacy box rejects safely", () => {
  assert.equal(safeText("\uE0000\uE001"), "\uE0000\uE001");
  assert.equal(safeText("\uE0000\uE001", true), "\uE0000\uE001");
  assert.throws(
    () => brosay("x\n".repeat(100000), { box: true }),
    /Legacy box/,
  );
});
