import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath, URL } from "node:url";
import { brosay, moods } from "@deployanyway/bro-say";

const expected = {
  classic: "BRO...",
  hype: "BRO! THE TERMINAL IS APPLAUDING!",
  chill: "Bro. One thing at a time.",
  panic: "BRO! DEEP BREATH. CHECK THE LOGS.",
  corporate: "Bro, please find the following update for alignment.",
  coach: "Bro, you have got this. Take the next step.",
};
const cliPath = fileURLToPath(new URL("../bin/cli.js", import.meta.url));
const cli = (...args) =>
  spawnSync(process.execPath, [cliPath, ...args], { encoding: "utf8" });
for (const [mood, intro] of Object.entries(expected)) {
  test(`${mood} formatting and normalization`, () => {
    assert.equal(
      brosay("Tests passed!", { mood }),
      `${intro}\n\nTests passed!`,
    );
    assert.equal(
      brosay("Tests passed!", { mood: ` ${mood.toUpperCase()} ` }),
      `${intro}\n\nTests passed!`,
    );
  });
}
test("default, whitespace, punctuation, multiline and Unicode", () => {
  assert.equal(brosay("  Hello  "), "BRO...\n\nHello");
  assert.equal(brosay("🐶 hello\n  world?!"), "BRO...\n\n🐶 hello\n  world?!");
  assert.equal(brosay("hello", { mood: null }), brosay("hello"));
  assert.equal(brosay("x".repeat(10000)).length, 10008);
});
test("mood list and output are deterministic and independent", () => {
  assert.deepEqual(moods(), Object.keys(expected));
  moods().pop();
  assert.equal(moods().length, 6);
  const options = Object.freeze({ mood: "chill" });
  assert.equal(brosay("same", options), brosay("same", options));
});
test("invalid messages, options, moods and prototype names", () => {
  for (const message of [undefined, null, 1, {}, [], "", " \n\t "])
    assert.throws(() => brosay(message), TypeError);
  for (const options of [null, [], 1, { mood: 1 }])
    assert.throws(() => brosay("x", options), TypeError);
  for (const mood of ["", "unknown", "__proto__", "toString", "constructor"])
    assert.throws(() => brosay("x", { mood }), RangeError);
});
test("CLI matches API for every mood", () => {
  for (const mood of moods()) {
    const result = cli("hello", "--mood", mood);
    assert.equal(result.status, 0);
    assert.equal(result.stderr, "");
    assert.equal(result.stdout, `${brosay("hello", { mood })}\n`);
  }
});
test("CLI help/version/list, words and dash-prefixed messages", () => {
  assert.ok(cli("--help").stdout.includes("Usage:"));
  assert.equal(cli("--version").stdout.trim(), "0.2.0");
  assert.deepEqual(cli("--list").stdout.trim().split(/\r?\n/), moods());
  assert.equal(cli("hello", "world").stdout, `${brosay("hello world")}\n`);
  assert.equal(
    cli("--mood", "chill", "--", "--hello").stdout,
    `${brosay("--hello", { mood: "chill" })}\n`,
  );
});
test("CLI invalid arguments exit 2 with stderr", () => {
  for (const args of [
    [],
    [" "],
    ["--wat"],
    ["--mood"],
    ["x", "--mood", "unknown"],
    ["--list", "x"],
    ["--list", "--mood", "hype"],
  ]) {
    const result = cli(...args);
    assert.equal(result.status, 2);
    assert.equal(result.stdout, "");
    assert.ok(result.stderr.includes("--help"));
  }
});
