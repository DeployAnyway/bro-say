# Contributing

Welcome! Keep bro-say intentionally tiny, original, and workplace-safe.

Use Node 22.13+ or 24, create a feature branch, and run `npm ci`.
Mood intros live in `src/moods.js`. Add tests for new moods or behavior.
Avoid copying terminal artwork or jokes from other packages.

Before opening a PR:

```sh
npm run format
npm run lint
npm run format:check
npm test
npm pack --dry-run
```

Describe changes and checks. Discuss larger API changes in an issue first.
