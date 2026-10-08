import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
test(
  "both executables close quietly when a pipeline reader stops early",
  { timeout: 10000 },
  async (t) => {
    for (const bin of ["cli.js", "think.js"]) {
      const child = spawn(process.execPath, ["bin/" + bin, "--no-wrap"], {
        cwd: new URL("..", import.meta.url),
        stdio: ["pipe", "pipe", "pipe"],
      });
      t.after(() => {
        if (child.exitCode === null) child.kill();
      });
      let stderr = "",
        received = false;
      child.stderr.on("data", (data) => {
        stderr += data;
      });
      child.stdout.once("data", () => {
        received = true;
        child.stdout.destroy();
      });
      const closed = once(child, "close");
      child.stdin.end("x".repeat(100000));
      const [code, signal] = await closed;
      assert.equal(received, true);
      assert.equal(signal, null);
      assert.equal(code, 0, stderr);
      assert.equal(stderr, "");
    }
  },
);
