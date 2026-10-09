import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { performance } from "node:perf_hooks";

const npm = process.env.npm_execpath;
assert.ok(npm, "Run through npm run verify:package.");
function run(args, cwd = process.cwd(), input) {
  const result = spawnSync(process.execPath, args, {
    cwd,
    input,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout;
}
const temp = mkdtempSync(join(tmpdir(), "bro-say-package-"));
try {
  run([npm, "run", "build"]);
  const [pack] = JSON.parse(
    run([
      npm,
      "pack",
      "--ignore-scripts",
      "--json",
      "--pack-destination",
      temp,
    ]),
  );
  const paths = pack.files.map((file) => file.path);
  for (const required of [
    "dist/index.js",
    "dist/index.cjs",
    "dist/browser.js",
    "dist/THIRD-PARTY-LICENSES.txt",
    "index.d.ts",
    "index.d.cts",
    "bin/cli.js",
    "bin/think.js",
    "README.md",
    "LICENSE",
    "MIGRATION.md",
  ])
    assert.ok(paths.includes(required), required);
  assert.ok(
    paths.every(
      (path) =>
        !/^(test|scripts|node_modules|coverage|demo|\.github)\//.test(path),
    ),
    "Development files must stay out of archive.",
  );
  assert.ok(pack.size < 100000, "Archive budget: 100 kB compressed.");
  writeFileSync(join(temp, "package.json"), '{"type":"module","private":true}');
  run(
    [
      npm,
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      join(temp, pack.filename),
    ],
    temp,
  );
  const manifest = JSON.parse(
    readFileSync(
      join(temp, "node_modules/@deployanyway/bro-say/package.json"),
      "utf8",
    ),
  );
  assert.equal(manifest.bin["bro-say"], "./bin/cli.js");
  assert.equal(manifest.bin["bro-think"], "./bin/think.js");
  const esm = run(
    [
      "--input-type=module",
      "-e",
      'import {renderBro} from "@deployanyway/bro-say"; console.log(JSON.stringify(renderBro({text:"Hello 👋",mode:"think"})))',
    ],
    temp,
  );
  const cjs = run(
    [
      "--input-type=commonjs",
      "-e",
      'const {renderBro}=require("@deployanyway/bro-say"); console.log(JSON.stringify(renderBro({text:"Hello 👋",mode:"think"})))',
    ],
    temp,
  );
  assert.equal(esm, cjs);
  const installed = join(temp, "node_modules/@deployanyway/bro-say");
  const begin = performance.now();
  assert.ok(
    run([join(installed, "bin/cli.js"), "Deploy anyway."], temp).includes(
      "LGTM",
    ),
  );
  const startup = performance.now() - begin;
  assert.ok(
    run([join(installed, "bin/think.js")], temp, "Hello 👋").includes("   o\n"),
  );
  assert.ok(
    run(
      [npm, "exec", "--offline", "--", "bro-say", "Deploy anyway."],
      temp,
    ).includes("LGTM"),
  );
  writeFileSync(
    join(temp, "types.mts"),
    'import {renderBuildSummary, summarizeBuild, brosay, renderBro} from "@deployanyway/bro-say"; renderBuildSummary({exitCode:1},{format:"plain"}); summarizeBuild({tests:{passed:1,failed:0}}); const s:string=brosay("hello",{character:"husky"}); renderBro({text:s,mode:"think"});\n// @ts-expect-error invalid character\nbrosay("x",{character:"cow"});',
  );
  writeFileSync(
    join(temp, "types.cts"),
    'import bro=require("@deployanyway/bro-say"); const s:string=bro.brothink("hi");',
  );
  run(
    [
      resolve("node_modules/typescript/bin/tsc"),
      "--noEmit",
      "--strict",
      "--skipLibCheck",
      "--module",
      "NodeNext",
      "--target",
      "ES2022",
      "types.mts",
      "types.cts",
    ],
    temp,
  );
  assert.ok(
    pack.files.some((f) => f.path === "examples/build-buddy.mjs"),
    "Runnable example must ship",
  );
  assert.equal(
    run(
      [
        "--input-type=module",
        "-e",
        "import * as api from '@deployanyway/bro-say';const r=api.renderBuildSummary({exitCode:1,tests:{passed:2,failed:1}},{format:'plain'}); if(r.status!=='failed')throw new Error('Summary lost failure'); console.log(JSON.stringify(r));",
      ],
      temp,
    ),
    run(
      [
        "--input-type=commonjs",
        "-e",
        "const api=require('@deployanyway/bro-say');const r=api.renderBuildSummary({exitCode:1,tests:{passed:2,failed:1}},{format:'plain'}); if(r.status!=='failed')throw new Error('Summary lost failure'); console.log(JSON.stringify(r));",
      ],
      temp,
    ),
  );
  console.log(
    JSON.stringify(
      {
        version: manifest.version,
        compressedBytes: pack.size,
        unpackedBytes: pack.unpackedSize,
        files: pack.files.length,
        runtimeDependencies: Object.keys(manifest.dependencies).length,
        startupMs: Math.round(startup),
        verified: [
          "ESM",
          "CommonJS",
          "TypeScript ESM/CJS",
          "bro-say",
          "bro-think",
          "offline npm exec",
          "archive contents",
        ],
      },
      null,
      2,
    ),
  );
} finally {
  rmSync(temp, { recursive: true, force: true });
}
