import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { URL } from "node:url";
import {
  brosay,
  brothink,
  renderBro,
  listCharacters,
  moods,
  listThemes,
  displayWidth,
} from "../src/index.js";
import { runCli } from "../src/cli.js";
import { safeText, wrapText } from "../src/text.js";
const require = createRequire(import.meta.url);
const bubbleLines = (result) =>
  result.split("\n").slice(
    0,
    result
      .split("\n")
      .findIndex((line) => line.startsWith("   \\") || line === "   o"),
  );
function aligned(output) {
  const widths = bubbleLines(output).map(displayWidth);
  assert.equal(new Set(widths).size, 1, JSON.stringify(widths));
}
async function cli(
  args = [],
  { input = "", env = {}, tty = false, columns = 80, think = false } = {},
) {
  let out = "",
    err = "";
  const stdin = Readable.from([input]);
  stdin.isTTY = tty;
  const status = await runCli(args, {
    stdin,
    stdout: { isTTY: tty, columns, write: (s) => (out += s) },
    stderr: { write: (s) => (err += s) },
    env,
    think,
  });
  return { out, err, status };
}

for (const character of listCharacters())
  test(`original character: ${character}`, () => {
    const r = renderBro({ text: "Deploy anyway.", character });
    assert.equal(r.character, character);
    assert.ok(r.rendered.includes("Deploy anyway."));
    aligned(r.rendered);
  });
for (const mood of moods())
  test(`persona preserves message: ${mood}`, () => {
    const r = renderBro({ text: "Build failed?!", mood, width: 60 });
    assert.ok(r.rendered.includes("Build failed?!"));
    aligned(r.rendered);
  });
for (const theme of listThemes())
  test(`theme composes with think/persona/Unicode: ${theme}`, () => {
    const result = brothink("Hello 👋\n你好\n\nCafe\u0301", {
      theme,
      mood: "friday",
      character: "robot",
      width: 24,
    });
    assert.ok(result.includes("   o\n    o"));
    aligned(result);
  });
test("speech and thought have distinct connectors and identical text", () => {
  const say = renderBro({ text: "hello" });
  const think = renderBro({ text: "hello", think: true });
  assert.equal(say.text, think.text);
  assert.notEqual(say.rendered, think.rendered);
  assert.equal(brothink("hello"), think.rendered);
  assert.match(say.rendered, /LGTM/);
});
test("display width covers combining marks, emoji clusters, flags and CJK", () => {
  for (const [text, width] of [
    ["Hello 👋", 8],
    ["DeployAnyway 🚀", 15],
    ["こんにちは", 10],
    ["你好", 4],
    ["café", 4],
    ["cafe\u0301", 4],
    ["🐶🐶🐶", 6],
    ["👨‍👩‍👧‍👦", 2],
    ["🇺🇸", 2],
    ["👍🏽", 2],
    ["\x1b[31m红\x1b[0m", 2],
  ])
    assert.equal(displayWidth(text), width, text);
});
test("wrapping preserves clusters, blank lines, paragraphs, indentation, and long words", () => {
  for (const text of [
    "one two three four five six",
    "x".repeat(150),
    "👨‍👩‍👧‍👦".repeat(10),
    "こんにちは".repeat(7),
    "first\n\n  second\nthird",
    "a\tbc\r\nnext",
  ]) {
    const result = renderBro({ text, width: 8 });
    aligned(result.rendered);
    assert.ok(
      bubbleLines(result.rendered).every((line) => displayWidth(line) <= 12),
    );
  }
  assert.deepEqual(wrapText("a\n\nb", 8), ["a", "", "b"]);
  assert.deepEqual(wrapText("long word unchanged", 8, false), [
    "long word unchanged",
  ]);
  assert.ok(
    brosay("x".repeat(60), { width: 8, wrap: false }).includes("x".repeat(60)),
  );
});
test("safe ANSI style wrapping closes before borders and removes active terminal controls", () => {
  const text = "\x1b[31mred words and more\x1b[0m";
  const colored = brosay(text, { color: true, width: 8 });
  aligned(colored);
  assert.match(colored, /\x1b/);
  assert.doesNotMatch(brosay(text), /\x1b/);
  assert.equal(safeText("\x1b]0;bad\x07hello\x1b[2J\x1bX\x00"), "hello");
  assert.equal(safeText("a\r\nb\tc"), "a\nb    c");
});
test("seeded random is stable, explicit selections win, unseeded selections are valid", () => {
  const options = { text: "Hello", random: true, seed: 42 };
  assert.deepEqual(renderBro(options), renderBro(options));
  const pinned = renderBro({
    ...options,
    character: "husky",
    mood: "classic",
    theme: "retro",
  });
  assert.equal(pinned.character, "husky");
  assert.equal(pinned.theme, "retro");
  assert.equal(pinned.mood, "classic");
  const random = renderBro({ text: "Hello", random: true });
  assert.ok(listCharacters().includes(random.character));
  assert.ok(moods().includes(random.mood));
  assert.ok(listThemes().includes(random.theme));
});
test("custom character is validated, copied and inert data", () => {
  const custom = Object.freeze({ name: "me", art: Object.freeze(["[me]"]) });
  const r = renderBro({ text: "hello", character: custom });
  assert.equal(r.character, "me");
  assert.match(r.rendered, /\[me\]/);
  for (const c of [
    {},
    { name: "bad name", art: ["x"] },
    { name: "me", art: [] },
    { name: "me", art: Array(21).fill("x") },
    { name: "me", art: [1] },
    { name: "me", art: ["x".repeat(65)] },
    { name: "me", art: ["\x1b[31m"] },
    { name: "me", art: ["🐶"] },
  ])
    assert.throws(() => brosay("x", { character: c }), TypeError);
});
test("option validation rejects malformed values and prototype names", () => {
  for (const opts of [
    null,
    [],
    1,
    {},
    { text: 1 },
    { text: "  " },
    { text: "\x00" },
    { text: "x", width: 7 },
    { text: "x", width: 201 },
    { text: "x", width: 1.5 },
    { text: "x", seed: {} },
    { text: "x", seed: Infinity },
    { text: "x", seed: 1 },
    { text: "x", character: [] },
    { text: "x", theme: 3 },
  ])
    assert.throws(() => renderBro(opts));
  for (const field of ["mood", "theme", "character", "layout", "mode"])
    for (const value of ["__proto__", "constructor", "unknown", 1])
      assert.throws(() => renderBro({ text: "x", [field]: value }));
  for (const field of ["random", "color", "wrap", "think", "box"])
    assert.throws(() => renderBro({ text: "x", [field]: "yes" }), TypeError);
  for (const value of [null, [], 1]) {
    assert.throws(() => brosay("x", value), TypeError);
    assert.throws(() => brothink("x", value), TypeError);
  }
  assert.throws(() => brosay("x".repeat(262145)), RangeError);
  assert.throws(() => brosay(Array(4100).fill("x").join("\n")), RangeError);
});
test("legacy layout and box stay available with corrected display width", () => {
  assert.equal(brosay("hello", { layout: "plain" }), "BRO...\n\nhello");
  assert.equal(
    brosay("hello", { layout: "plain", mood: "friday" }),
    "BRO...\n\nhello",
  );
  const lines = brosay("👋 你好", { box: true }).split("\n");
  assert.equal(new Set(lines.map(displayWidth)).size, 1);
  assert.throws(() => brosay("x".repeat(201), { box: true }), RangeError);
  const a = listCharacters();
  a.pop();
  assert.equal(listCharacters().length, 13);
  const t = listThemes();
  t.pop();
  assert.equal(listThemes().length, 6);
});
test("ESM and CommonJS exports agree", () => {
  assert.equal(require("../dist/index.cjs").brosay("hello"), brosay("hello"));
});
test("CLI help, version and catalog listing never consume stdin", async () => {
  assert.match((await cli(["--help"])).out, /npm test 2>&1/);
  assert.match((await cli(["--version"])).out, /1\.0\.0/);
  for (const [flag, expected] of [
    ["--list", moods()],
    ["--list-moods", moods()],
    ["--list-characters", listCharacters()],
    ["--list-themes", listThemes()],
  ])
    assert.deepEqual((await cli([flag])).out.trim().split("\n"), expected);
});
test("CLI stdin, arguments precedence, thought entry, JSON and terminal-aware width", async () => {
  assert.equal((await cli([], { input: "hello" })).out, brosay("hello") + "\n");
  assert.equal(
    (await cli(["arg"], { input: "ignored" })).out,
    brosay("arg") + "\n",
  );
  assert.match((await cli([], { input: "hello", think: true })).out, /   o/);
  const result = await cli(
    ["hello", "--json", "--theme", "minimal", "--no-color"],
    { tty: true, columns: 24 },
  );
  assert.equal(JSON.parse(result.out).width, 20);
  assert.equal(JSON.parse(result.out).theme, "minimal");
  assert.equal(result.status, 0);
  assert.equal(result.err, "");
  const actual = spawnSync(
    process.execPath,
    ["bin/think.js", "--width", "20"],
    {
      cwd: new URL("..", import.meta.url),
      input: "Hello\n世界",
      encoding: "utf8",
    },
  );
  assert.equal(actual.status, 0);
  assert.match(actual.stdout, /   o/);
});
test("CLI color policy: non-TTY strips ANSI, explicit color works, NO_COLOR and no-color win", async () => {
  assert.doesNotMatch((await cli(["\x1b[31mred"])).out, /\x1b/);
  assert.match((await cli(["hello", "--color"])).out, /\x1b/);
  assert.match((await cli(["hello"], { tty: true })).out, /\x1b/);
  assert.doesNotMatch(
    (await cli(["hello", "--color"], { env: { NO_COLOR: "" } })).out,
    /\x1b/,
  );
  assert.doesNotMatch(
    (await cli(["hello", "--no-color"], { tty: true })).out,
    /\x1b/,
  );
});
test("CLI flags, wrapping, legacy output and reproducible random JSON", async () => {
  assert.equal((await cli(["hello", "--plain"])).out, "BRO...\n\nhello\n");
  assert.match((await cli(["hello", "--box"])).out, /\+---/);
  assert.ok(
    (await cli(["x".repeat(60), "--no-wrap"])).out.includes("x".repeat(60)),
  );
  const args = ["hello", "--random", "--seed", "42", "--json"];
  assert.deepEqual(await cli(args), await cli(args));
  assert.match((await cli(["hello", "--think"])).out, /   o/);
});
test("CLI errors are actionable with status 2 and no stdout", async () => {
  for (const args of [
    [],
    [" "],
    ["--unknown"],
    ["hello", "--width", "wat"],
    ["hello", "--width", "7"],
    ["hello", "--seed", "x"],
    ["--list", "hello"],
    ["--list", "--list-themes"],
    ["--list", "--mood", "hype"],
    ["hello", "--character", "missing"],
    ["--mood"],
  ]) {
    const r = await cli(args);
    assert.equal(r.status, 2, JSON.stringify(args));
    assert.equal(r.out, "");
    assert.match(r.err, /--help/);
  }
  assert.equal((await cli([], { tty: true })).status, 2);
  assert.equal((await cli([], { input: "x".repeat(262145) })).status, 2);
});
