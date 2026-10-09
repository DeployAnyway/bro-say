import { renderBro } from "./index.js";
const clean = (value) =>
  Array.from(value)
    .filter(
      (char) => char.charCodeAt(0) >= 32 || char === "\n" || char === "\t",
    )
    .join("");
const count = (value, label) => {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new TypeError(`${label} must be a nonnegative safe integer.`);
  return value;
};
/** Summarize measured build facts without inventing a passing build. */
export function summarizeBuild(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new TypeError("Build input must be an object.");
  const result = { label: "Build", status: "unknown" };
  for (const key of ["label", "commit"])
    if (input[key] !== undefined) {
      if (
        typeof input[key] !== "string" ||
        !input[key].trim() ||
        input[key].length > 200
      )
        throw new TypeError(
          `${key} must be a nonempty string up to 200 characters.`,
        );
      result[key] = clean(input[key].trim());
    }
  if (input.exitCode !== undefined) {
    result.exitCode =
      input.exitCode === null ? null : count(input.exitCode, "exitCode");
    if (input.exitCode !== null)
      result.status = input.exitCode === 0 ? "passed" : "failed";
  }
  if (input.durationMs !== undefined) {
    if (
      typeof input.durationMs !== "number" ||
      !Number.isFinite(input.durationMs) ||
      input.durationMs < 0
    )
      throw new TypeError("durationMs must be a nonnegative finite number.");
    result.durationMs = input.durationMs;
  }
  if (input.tests !== undefined) {
    if (
      !input.tests ||
      typeof input.tests !== "object" ||
      Array.isArray(input.tests)
    )
      throw new TypeError("tests must contain measured counts.");
    result.tests = {
      passed: count(input.tests.passed, "tests.passed"),
      failed: count(input.tests.failed, "tests.failed"),
      skipped: count(input.tests.skipped ?? 0, "tests.skipped"),
    };
    if (result.tests.failed > 0) result.status = "failed";
  }
  const failures = input.failures ?? [];
  if (
    !Array.isArray(failures) ||
    failures.length > 20 ||
    !failures.every(
      (item) => typeof item === "string" && item.trim() && item.length <= 2000,
    )
  )
    throw new TypeError(
      "failures must contain up to 20 nonempty strings of at most 2000 characters.",
    );
  result.failures = failures.map(clean);
  if (failures.length) result.status = "failed";
  result.text = [
    `${result.label}: ${result.status.toUpperCase()}`,
    `Build exit: ${result.exitCode === undefined || result.exitCode === null ? "not provided" : result.exitCode}`,
    result.tests
      ? `Tests: ${result.tests.passed} passed, ${result.tests.failed} failed, ${result.tests.skipped} skipped`
      : "Tests: not provided",
    result.durationMs !== undefined
      ? `Duration: ${result.durationMs} ms`
      : "Duration: not provided",
    result.commit ? `Commit: ${result.commit}` : "Commit: not provided",
    ...(result.failures.length
      ? ["Failures:", ...result.failures.map((item) => "- " + item)]
      : []),
  ].join("\n");
  return result;
}
export function renderBuildSummary(input = {}, options = {}) {
  if (!options || typeof options !== "object" || Array.isArray(options))
    throw new TypeError("Options must be an object.");
  const { format = "character", ...broOptions } = options;
  if (!["character", "plain"].includes(format))
    throw new RangeError("Summary format must be character or plain.");
  const summary = summarizeBuild(input);
  const rendered =
    format === "plain"
      ? summary.text
      : renderBro({
          ...broOptions,
          text: summary.text,
          mood:
            broOptions.mood ??
            (summary.status === "passed"
              ? "benji"
              : summary.status === "failed"
                ? "on-call"
                : "skeptic"),
        }).rendered;
  return { status: summary.status, summary, rendered };
}
