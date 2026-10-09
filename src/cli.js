import { parseArgs } from "node:util";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import {
  renderBro,
  listCharacters,
  moods,
  listThemes,
  broMessage,
  messageCategories,
} from "./index.js";

const help = `bro-say — emotional support for your terminal. Offline. Original. DeployAnyway.

Install: npm install -g @deployanyway/bro-say
Usage: bro-say "Deploy anyway." [options]
       bro-think "Maybe not on Friday."
       npm test 2>&1 | bro-say --mood panic

  --think                  Thought bubble (or use bro-think)
  --character name         Original mascot; default husky
  --mood name              Personality; default classic
  --theme name             Border/color; default classic
  --width 8..200            Content columns; adapts to TTY width
  --no-wrap                Preserve long lines
  --color / --no-color     Force/disable ANSI; NO_COLOR always wins
  --random [--seed text]   Choose unspecified character, mood, theme
  --preset category        Original message; --seed makes selection repeatable
  --list-presets           Show message categories
  --json                   Structured result
  --plain / --box          0.2 intro/message layout or legacy frame
  --list-characters        Show 13 original characters
  --list-moods, --list      Show personalities
  --list-themes            Show themes
  -h, --help               This unusually useful help
  -v, --version            Version

Arguments take precedence over stdin. Without arguments, read piped/redirected
input (maximum 256 KiB). Empty/invalid input exits 2; successful rendering exits 0.
Characters: husky, duck, robot, coffee, laptop, server, bug, rocket, and friends.
Moods: classic, hype, chill, panic, corporate, coach, senior-dev, intern,
       dramatic, sarcastic, motivational, friday, dallas, benji, rubber-duck,
       on-call, code-review, minimalist, optimist, skeptic.
Themes: classic, minimal, neon, retro, hacker, corporate.
`;
async function readInput(stream) {
  if (stream.isTTY) throw new TypeError("Provide a message or pipe input.");
  let size = 0;
  const chunks = [];
  for await (const chunk of stream) {
    const buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    size += buffer.length;
    if (size > 262144) throw new RangeError("stdin exceeds 256 KiB.");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}
export async function runCli(argv, io = {}) {
  const stdin = io.stdin ?? process.stdin,
    stdout = io.stdout ?? process.stdout,
    stderr = io.stderr ?? process.stderr,
    env = io.env ?? process.env;
  try {
    const { values, positionals } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        help: { type: "boolean", short: "h" },
        version: { type: "boolean", short: "v" },
        character: { type: "string" },
        mood: { type: "string" },
        theme: { type: "string" },
        width: { type: "string" },
        seed: { type: "string" },
        preset: { type: "string" },
        "list-presets": { type: "boolean" },
        think: { type: "boolean" },
        random: { type: "boolean" },
        json: { type: "boolean" },
        plain: { type: "boolean" },
        box: { type: "boolean" },
        color: { type: "boolean" },
        "no-color": { type: "boolean" },
        "no-wrap": { type: "boolean" },
        list: { type: "boolean" },
        "list-characters": { type: "boolean" },
        "list-moods": { type: "boolean" },
        "list-themes": { type: "boolean" },
      },
    });
    if (values.help) {
      stdout.write(help);
      return 0;
    }
    if (values.version) {
      stdout.write(
        JSON.parse(
          readFileSync(new URL("../package.json", import.meta.url), "utf8"),
        ).version + "\n",
      );
      return 0;
    }
    const listing = [
      values.list || values["list-moods"],
      values["list-characters"],
      values["list-themes"],
      values["list-presets"],
    ];
    if (listing.some(Boolean)) {
      if (
        listing.filter(Boolean).length > 1 ||
        positionals.length ||
        Object.keys(values).some(
          (key) =>
            ![
              "list",
              "list-moods",
              "list-characters",
              "list-themes",
              "list-presets",
            ].includes(key),
        )
      )
        throw new TypeError(
          "Listing flags cannot be combined with rendering options or a message.",
        );
      stdout.write(
        (listing[0]
          ? moods()
          : listing[1]
            ? listCharacters()
            : listing[2]
              ? listThemes()
              : messageCategories()
        ).join("\n") + "\n",
      );
      return 0;
    }
    if (values.width !== undefined && !/^\d+$/.test(values.width))
      throw new TypeError("width must be an integer.");
    const width =
      values.width === undefined
        ? Math.max(8, Math.min(48, (stdout.columns ?? 52) - 4))
        : Number(values.width);
    if (values.preset !== undefined && positionals.length)
      throw new TypeError("--preset cannot be combined with a message.");
    const text =
      values.preset !== undefined
        ? broMessage(values.preset, { seed: values.seed })
        : positionals.length
          ? positionals.join(" ")
          : await readInput(stdin);
    const result = renderBro({
      text,
      character: values.character,
      mood: values.mood,
      theme: values.theme,
      width,
      seed:
        values.preset !== undefined && !values.random ? undefined : values.seed,
      random: values.random,
      mode: values.think || io.think ? "think" : "say",
      color:
        !(values["no-color"] || Object.hasOwn(env, "NO_COLOR")) &&
        (values.color ?? !!stdout.isTTY),
      wrap: !values["no-wrap"],
      layout: values.plain ? "plain" : "bubble",
      box: values.box,
    });
    stdout.write(
      (values.json ? JSON.stringify(result, null, 2) : result.rendered) + "\n",
    );
    return 0;
  } catch (error) {
    stderr.write(
      "bro-say: " + error.message + "\nRun with --help for usage.\n",
    );
    return 2;
  }
}
