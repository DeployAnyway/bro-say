# bro-say

[![npm](https://img.shields.io/npm/v/%40deployanyway%2Fbro-say)](https://www.npmjs.com/package/@deployanyway/bro-say) [![CI](https://github.com/DeployAnyway/bro-say/actions/workflows/ci.yml/badge.svg?branch=feature/flagship)](https://github.com/DeployAnyway/bro-say/actions/workflows/ci.yml)

Original terminal friends and developer personalities. Emotional support for production, without pretending to fix production.

```sh
npx @deployanyway/bro-say "Deploy anyway."
```

**Candidate notice:** npm currently serves 0.2.0. This branch prepares 0.3.0: the artwork and features below require this branch until release approval. The command above runs the published plain formatter today.

```text
+----------------+
| BRO...         |
|                |
| Deploy anyway. |
+----------------+
   \
    \
       /\___/\
      / o   o \
      |   v   |
       \_===_/
       /| <> |\
      (_|____|_)
        /    \
       [_]  [_]
      [  LGTM  ]
```

## Why?

Because production errors deserve emotional support. Your message stays yours; the mascot supplies questionable confidence.

## Install

Published package: `npm install -g @deployanyway/bro-say`. For this candidate, use Node 22.13+ or 24:

```sh
git clone --branch feature/flagship https://github.com/DeployAnyway/bro-say.git
cd bro-say
npm ci
npm run build
node bin/cli.js "Deploy anyway."
```

## 30-second demo

Run these from the candidate checkout:

```sh
node bin/cli.js "Tests failed" --character husky --mood corporate
node bin/think.js "Maybe not on Friday." --theme neon --mood friday
echo "build failed" | node bin/cli.js --mood panic
node bin/cli.js "Hello 👋 こんにちは" --width 24
node bin/cli.js "Deploy anyway" --random --seed 42 --json
```

## Say and think

```js
import { brosay, brothink } from "@deployanyway/bro-say";
console.log(brosay("Production is down"));
console.log(brothink("Read the logs first.", { character: "duck" }));
```

Speech uses slash connectors; thoughts use circles. The installed candidate provides bro-say and bro-think; --think is equivalent.

## Pipe anything into Bro

```sh
npm test 2>&1 | bro-say --mood panic
bro-say --character robot < build.log
error-translator ECONNREFUSED | bro-say --character husky
```

Arguments win over stdin; without arguments, piped or redirected input is read. No interactive message gets an actionable error. Stdin is limited to 256 KiB. Use your shell's pipefail policy to preserve upstream failures. Rendering exits 0; invalid input exits 2. Broken output pipes close quietly.

## Characters

bro, bug, coffee, developer, duck, dumpster-fire, husky, intern, laptop, robot, rocket, server, wizard.

These 13 original printable ASCII drawings live in separate JSON files. The husky developer is our signature mascot. No cowsay assets or executable character definitions.

## Moods

classic, hype, chill, panic, corporate, coach, senior-dev, intern, dramatic, sarcastic, motivational, friday.

Personas combine intros, labels and follow-up advice while preserving evidence. Corporate assigns an owner; panic asks for rollback; intern asks for a test; Friday checks on-call readiness. See generated captures below.

## Themes

classic, minimal, neon, retro, hacker, corporate. Borders and ANSI palettes are independent of personas and characters. Neon uses Unicode box borders; the others use ASCII. API color defaults off; CLI color is off on noninteractive output. --color explicitly enables it; --no-color and NO_COLOR always win.

## JavaScript API

```js
import {
  renderBro,
  listCharacters,
  moods,
  listThemes,
  displayWidth,
} from "@deployanyway/bro-say";
const result = renderBro({
  text: "Hello 👋",
  character: "husky",
  mood: "chill",
  theme: "neon",
  mode: "think",
  width: 40,
  color: false,
});
console.log(result.rendered);
// result: text, character, mood, theme, mode, width, rendered
console.log(displayWidth("Hello 👋")); // 8
```

CommonJS: `const { brosay } = require("@deployanyway/bro-say")`. Browser: use `@deployanyway/bro-say/browser` through your bundler, or serve dist/browser.js directly. No network, telemetry or shell execution at runtime.

Seeded random selects unspecified character, mood and theme; explicit choices win. Same seed/options/catalog gives the same output. Catalog order may change between versions; archive the structured result for long-term reproduction.

## TypeScript

Useful character, mood, theme and mode unions plus structured result types work in both module systems.

```ts
import { brosay, type BroOptions } from "@deployanyway/bro-say";
const options: BroOptions = { character: "husky", mood: "friday", width: 42 };
const output: string = brosay("Ship carefully.", options);
```

## CLI reference

| Option                                           | Behavior                                                |
| ------------------------------------------------ | ------------------------------------------------------- |
| --think / bro-think                              | Thought connector                                       |
| --character, --mood, --theme                     | Independent selections                                  |
| --width 8..200                                   | Content columns; API default 48; CLI adapts to terminal |
| --no-wrap                                        | Preserve long lines                                     |
| --random --seed 42                               | Repeatable choices; seed requires random                |
| --json                                           | Structured result on stdout                             |
| --color / --no-color                             | ANSI policy; NO_COLOR wins                              |
| --list-characters / --list-moods / --list-themes | Catalogs; --list aliases moods                          |
| --plain / --box                                  | Original six mood layouts                               |
| --help / --version                               | Concise help and version                                |

Use -- before messages starting with a dash. Catalog flags cannot be combined with rendering options.

## Unicode support

string-width and wrap-ansi preserve combining marks, emoji clusters, CJK, newlines, blank lines and long words. Tabs become four spaces; CRLF is normalized. Unsafe terminal controls are removed; styling closes before borders.

Fonts/emulators may disagree on emoji and ambiguous widths. Width means content columns, excluding four border columns; artwork can be wider than a narrow bubble. API input is capped at 262144 UTF-16 code units and bubble output at 4096 lines. --no-wrap allows wide output.

## Creating characters

```js
console.log(
  brosay("Hello", {
    character: { name: "custom", art: ["[o_o]", " /| "] },
  }),
);
```

Custom characters need a slug and 1–20 printable ASCII lines of at most 64 characters. No code is evaluated. [CONTRIBUTING](CONTRIBUTING.md) explains adding one data file plus tests.

## Browser demo

Run npm run build, serve the checkout with a static HTTP server, and open demo/. It uses the same renderer with live message, character, persona, theme, width, say/think and copy controls. Modern browsers need Intl.Segmenter and Unicode v-flag support. No backend or analytics.

## Capabilities

| Capability                                    | 0.3 candidate                    |
| --------------------------------------------- | -------------------------------- |
| Speech / thought / stdin                      | Yes                              |
| Original characters / personas / themes       | 13 / 12 / 6                      |
| Grapheme and display-width wrapping           | Yes, with terminal caveats above |
| Seeded random / JSON / inert custom art       | Yes                              |
| JavaScript / types / ESM / CommonJS / browser | Yes                              |
| NO_COLOR / installed archive checks           | Yes                              |

Classic terminal tools inspired the quality benchmark. We make no blanket superiority claim; originality, JavaScript ergonomics and developer personas are this project's focus.

## Contributing

[Contribution guide](CONTRIBUTING.md) · [Conduct](CODE_OF_CONDUCT.md) · [Security](SECURITY.md) · [Roadmap](ROADMAP.md) · [Migration](MIGRATION.md). CI tests Node 22/24 on Linux and Node 24 on Windows/macOS, with coverage, types and archive installation. Candidates require explicit release approval.

## DeployAnyway ecosystem

[error-translator](https://github.com/DeployAnyway/error-translator) explains errors; [excuse-js](https://github.com/DeployAnyway/excuse-js) supplies comic excuses; [doggo-log](https://github.com/DeployAnyway/doggo-log) adds personality to logs; [ship-it-meter](https://github.com/DeployAnyway/ship-it-meter) turns release evidence into a checklist. Each works independently.

**Tools for developers who probably know better.** Software nobody requested, built with questionable priorities, and shipped with absolute confidence!

## License

MIT. Bundled third-party notices accompany the browser/CommonJS builds.

## Generated terminal captures

Duck thinking

```text
+----------------------+
| BRO...               |
|                      |
| Read the logs first. |
+----------------------+
   o
    o
         __
        (o )___
        /   __/
       /___/
       [QUACK]
```

Coffee

```text
+-------------------------+
| BRO...                  |
|                         |
| Coffee is a dependency. |
+-------------------------+
   \
    \
         ~  ~
        .----.
        | CI |--.
        |    |  |
        |____|--'
        [REFILL]
```

Sarcastic robot

```text
+--------------------------------------------+
| An ambitious interpretation of 'probably   |
| fine'.                                     |
|                                            |
| EVIDENCE RECEIVED                          |
|                                            |
| The deployment succeeded somehow.          |
|                                            |
| Excellent. Now let us ask the tests for a  |
| second opinion.                            |
+--------------------------------------------+
   \
    \
        [ READY ]
        .-------.
        | o   o |
        |  ===  |
        +-------+
       /|  []   |\
        |_______|
         []   []
```

Intern

```text
+----------------------------------------------+
| I brought notes and exactly one sensible     |
| question.                                    |
|                                              |
| QUESTION FOR THE TEAM                        |
|                                              |
| Tests failed                                 |
|                                              |
| Could we add a test so future-me understands |
|  this too?                                   |
+----------------------------------------------+
   \
    \
        .----.
        |o  o|
        | ?? |
        \____/
        /|  |\
       [ NOTES ]
         |  |
        [_][_]
```
