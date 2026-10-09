import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { renderBuildSummary } from "@deployanyway/bro-say";
// A real syntax check. Replace this command with your build; preserve its exit status.
const file =
  process.argv[2] ?? fileURLToPath(new URL("../src/index.js", import.meta.url));
const started = performance.now();
const build = spawnSync(process.execPath, ["--check", file], {
  encoding: "utf8",
});
const failures =
  build.status === 0
    ? []
    : [
        (
          build.error?.message ||
          build.stderr.trim() ||
          "Command ended without a successful result"
        ).slice(0, 2000),
      ];
console.log(
  renderBuildSummary({
    label: "Node syntax check",
    exitCode: build.status,
    durationMs: Math.round(performance.now() - started),
    ...(process.env.GITHUB_SHA ? { commit: process.env.GITHUB_SHA } : {}),
    failures,
  }).rendered,
);
process.exitCode = build.status ?? 1;
