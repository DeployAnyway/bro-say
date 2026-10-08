# Contributing

Welcome to DeployAnyway: tools for developers who probably know better. Use Node 22.13+ or 24, create a feature branch and run `npm ci`.

Rendering, personas, themes, text handling and CLI orchestration live in separate src modules. The browser uses the same renderer.

## Original characters

Add one JSON file to src/characters/. Use a unique lowercase slug for name and an art array with 1–20 printable ASCII lines, each at most 64 characters. Escape backslashes in JSON. Draw original artwork; do not copy cowsay assets or other artists. No terminal escapes or executable character definitions.

Run `npm run build` to regenerate the catalog. Tests automatically exercise each character; add an appropriate appearance regression test. Check narrow-width say and think modes. Include authorship/provenance in your PR. Update the declaration union, catalog expectations and help counts when adding built-in names.

## Checks

```sh
npm run build
npm run format
npm run lint
npm run format:check
npm run coverage
npm run test:types
npm run verify:package
npm audit
```

Coverage gates: 90% statements, lines and functions; 85% branches. Test behavior and failures, rather than lowering gates. Archive verification installs a temporary local tarball, fetching public dependencies if needed. It never publishes.

Describe user-visible changes, compatibility and validation. Keep humor workplace-safe and follow CODE_OF_CONDUCT.md. Use SECURITY.md for vulnerability reports. Publishing requires explicit release approval.
