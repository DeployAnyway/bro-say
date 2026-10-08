# bro-say

A tiny message formatter with six workplace-safe terminal personalities.

```text
BRO...

The build failed
```

## Installation

Version 0.1.0 is not published to npm. Try from source with Node 22 or 24:

```sh
git clone https://github.com/DeployAnyway/bro-say.git
cd bro-say
git checkout feature/initial-mvp
npm ci
node bin/cli.js "The build failed"
```

After an approved release: `npm install @deployanyway/bro-say`.

## Quick start

```js
import { brosay } from "@deployanyway/bro-say";

console.log(brosay("The build failed"));
console.log(brosay("Tests passed!", { mood: "hype" }));
```

## CLI example

```sh
node bin/cli.js "Tests passed!" --mood hype
```

After publication: `npx @deployanyway/bro-say "Tests passed!" --mood hype`.

## API and options

`brosay(message, { mood = 'classic' } = {})` returns an intro, a blank line,
and your message. It trims surrounding whitespace and preserves internal
whitespace, newlines, Unicode, and punctuation. It does not log or exit.
Messages must be nonempty strings; other values throw TypeError.

Mood names are trimmed and case insensitive. Unknown names throw RangeError;
invalid options or nonstring moods throw TypeError. Missing/null mood uses classic.
No randomness, remote service, artwork, or production dependency is involved.

`moods()` returns a fresh array of the supported names.

| Mood      | Intro                                                |
| --------- | ---------------------------------------------------- |
| classic   | BRO...                                               |
| hype      | BRO! THE TERMINAL IS APPLAUDING!                     |
| chill     | Bro. One thing at a time.                            |
| panic     | BRO! DEEP BREATH. CHECK THE LOGS.                    |
| corporate | Bro, please find the following update for alignment. |
| coach     | Bro, you have got this. Take the next step.          |

## CLI reference

`bro-say <message> [--mood name]`

| Flag              | Behavior                                     |
| ----------------- | -------------------------------------------- |
| `--mood name`     | Select mood; default classic                 |
| `--list`          | List moods; cannot combine with message/mood |
| `--help`, `-h`    | Help                                         |
| `--version`, `-v` | Version                                      |

Quote messages to preserve whitespace and shell punctuation. Unquoted words
are joined with spaces. Use `--` before a dash-prefixed message:

```sh
node bin/cli.js --mood chill -- "--the-build-is-thinking"
```

CLI adds one final newline. Exit 0 means success; 2 means invalid arguments.
No stdin, ASCII art, colors, or wrapping in this intentionally tiny MVP.

## Examples and development

```sh
npm ci
node examples/basic.js
npm test
npm run lint
npm run format:check
npm pack --dry-run
```

ES modules, Node's test runner, zero production dependencies. CI runs Node 22/24;
development tooling requires Node 22.13+ or 24.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE).

## More from DeployAnyway

**Tools for developers who probably know better.**

- [error-translator](https://github.com/DeployAnyway/error-translator)
- [excuse-js](https://github.com/DeployAnyway/excuse-js)
- [doggo-log](https://github.com/DeployAnyway/doggo-log)
- [ship-it-meter](https://github.com/DeployAnyway/ship-it-meter)
- [bro-say](https://github.com/DeployAnyway/bro-say)
