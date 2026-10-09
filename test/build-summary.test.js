import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { summarizeBuild, renderBuildSummary } from "../src/index.js";
test("summary facts preserve measured values and never invent a successful build", () => {
  const input = {
    label: "Release build",
    commit: "abc123",
    exitCode: 0,
    durationMs: 12.5,
    tests: { passed: 20, failed: 0, skipped: 2 },
  };
  const before = JSON.stringify(input),
    result = summarizeBuild(input);
  assert.equal(result.status, "passed");
  assert.match(result.text, /20 passed, 0 failed, 2 skipped/);
  assert.match(result.text, /12.5 ms/);
  assert.equal(JSON.stringify(input), before);
  assert.equal(
    summarizeBuild({ tests: { passed: 20, failed: 0 } }).status,
    "unknown",
  );
  assert.match(summarizeBuild().text, /not provided/);
  for (const data of [
    { exitCode: 1 },
    { exitCode: 0, tests: { passed: 0, failed: 1 } },
    { exitCode: 0, failures: ["Compilation failed"] },
  ])
    assert.equal(summarizeBuild(data).status, "failed");
  assert.equal(summarizeBuild({ exitCode: null }).status, "unknown");
  assert.doesNotMatch(
    summarizeBuild({ label: "Hello\u001b[31m", failures: ["line\u0007"] }).text,
    /\u001b|\u0007/,
  );
});
test("character and plain summaries agree with facts; CLI renders JSON stdin without hiding failures", () => {
  for (const exitCode of [0, 1, null]) {
    const result = renderBuildSummary({ exitCode });
    assert.match(result.rendered, new RegExp(result.status.toUpperCase()));
    assert.equal(
      renderBuildSummary({ exitCode }, { format: "plain" }).rendered,
      result.summary.text,
    );
  }
  const cli = spawnSync(
    process.execPath,
    ["bin/cli.js", "--summary", "--plain", "--json"],
    {
      input: JSON.stringify({ exitCode: 1, failures: ["Bundling failed"] }),
      encoding: "utf8",
    },
  );
  assert.equal(cli.status, 0, cli.stderr);
  assert.equal(JSON.parse(cli.stdout).status, "failed");
  const bad = spawnSync(
    process.execPath,
    ["bin/cli.js", "--summary", "hello"],
    { encoding: "utf8" },
  );
  assert.equal(bad.status, 2);
});
test("invalid facts and summary formats fail explicitly", () => {
  for (const data of [
    null,
    [],
    { label: "" },
    { commit: 2 },
    { exitCode: -1 },
    { durationMs: NaN },
    { tests: {} },
    { tests: [] },
    { tests: { passed: -1, failed: 0 } },
    { failures: [""] },
    { failures: Array(21).fill("x") },
  ])
    assert.throws(() => summarizeBuild(data), TypeError);
  assert.throws(() => renderBuildSummary({}, null), TypeError);
  assert.throws(() => renderBuildSummary({}, { format: "magic" }), RangeError);
});
