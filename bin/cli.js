#!/usr/bin/env node
import { parseArgs } from "node:util";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { brosay, moods } from "../src/index.js";

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
      mood: { type: "string" },
      list: { type: "boolean" },
    },
  });
  if (values.help) {
    console.log(
      'Usage: bro-say <message> [--mood name]\n\nMoods: classic, hype, chill, panic, corporate, coach\nOptions:\n  --mood name    Select a mood (default classic)\n  --list         List moods\n  -h, --help     Show help\n  -v, --version  Show version\n\nExample: bro-say "Tests passed" --mood hype\nExit codes: 0 success; 2 invalid arguments.',
    );
  } else if (values.version) {
    console.log(
      JSON.parse(
        readFileSync(new URL("../package.json", import.meta.url), "utf8"),
      ).version,
    );
  } else if (values.list) {
    if (positionals.length || values.mood !== undefined)
      throw new TypeError("--list does not accept a message or mood.");
    console.log(moods().join("\n"));
  } else {
    console.log(brosay(positionals.join(" "), { mood: values.mood }));
  }
} catch (error) {
  console.error(`bro-say: ${error.message}\nRun with --help for usage.`);
  process.exitCode = 2;
}
