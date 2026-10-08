# Moving from 0.2 to the 0.3 candidate

The default `brosay()` and CLI output now includes a speech bubble and the original husky developer. Automatic wrapping is enabled. This observable output change is why we recommend **0.3.0**, rather than a patch release.

For the original six mood intros and message layout, use `brosay(text, { layout: "plain" })` or `bro-say "text" --plain`. Existing `box: true` / `--box` still selects the legacy frame. Its Unicode alignment is corrected. New personas fall back to the classic intro in legacy layouts.

The library requires Node 22.13+; CI covers the latest Node 22 and 24. ESM imports continue working. CommonJS and TypeScript declarations are new. Public catalog calls return fresh arrays; do not depend on array order for seeded selections across future versions.

Messages retain internal whitespace, after CRLF normalization and tabs expanded to four spaces. Outer whitespace is trimmed. Unsafe terminal controls are removed. Only SGR styling survives explicit color mode. Library color defaults off; the CLI enables it on interactive output, respects `NO_COLOR`, and offers `--color` / `--no-color`.

Input is bounded: 262144 UTF-16 code units for the API, 256 KiB for stdin, and 4096 rendered bubble lines. Legacy boxes retain their 200-column / 100-line bounds. `--no-wrap` can create wide output. Argument messages take precedence over stdin. Empty or invalid CLI input exits 2 and reports to stderr; success exits 0. Broken output pipes exit quietly.

0.3.0 remains a release candidate in a feature branch. npm still serves 0.2.0 until explicit release approval.
