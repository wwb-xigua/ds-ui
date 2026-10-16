# Contributing to ds-ui

Thanks for taking the time. This library is early-stage, and real-world feedback is the
single most useful thing you can contribute.

## What helps most

- **Report what breaks.** A minimal reproduction in an issue is worth more than a patch.
- **Share how you use it.** If you built something on top of `ds-ui`, an issue describing your
  setup often surfaces an API gap nobody else would have hit.
- **Improve the docs.** If a prop or method took you a while to figure out, say so in an issue.
  That is a documentation bug.

## Reporting a bug

Please include:

- `ds-ui`, `vue`, and `naive-ui` versions
- A minimal reproduction (`vite` + `vue` template is fine)
- What you expected vs. what happened
- Browser and OS if it is layout-related

## Setting up

```bash
git clone https://github.com/wwb-xigua/ds-ui.git
cd ds-ui
npm install
```

Requires Node 18 or newer.

```bash
npm run dev            # playground on http://localhost:5173
npm run typecheck      # vue-tsc, no emit
npm run build          # typecheck + production build
npm run format         # prettier --write
npm run format:check   # prettier --check (used by CI)
```

## Pull requests

1. Branch off `main`.
2. Keep the change focused; unrelated cleanups belong in a separate PR.
3. Make sure `npm run build` passes — it runs type checking, and CI enforces it.
4. Run `npm run format` before committing.
5. Describe the behaviour change in the PR body, and add a note to `CHANGELOG.md` under `## Unreleased`.

## Adding a component

Components live in `packages/<name>/` and follow this layout:

```
packages/<name>/
├── index.ts            # public exports
└── src/
    ├── index.vue       # component
    ├── props.ts        # prop definitions
    └── types/          # exported types
```

Then register the component in `packages/components.ts`.

Conventions:

- Name the public component `S<Name>` (e.g. `STable`).
- Give the SFC an explicit name via `<script setup lang="ts" name="Table">`. Global registration
  relies on this — a component without one is registered under `undefined`.
- Add it to `packages/preset.ts` only if it should be installed by default.
- Expose imperative methods through `@register` rather than requiring a template ref.

## Code style

Prettier handles formatting. The notable conventions are:

- `singleQuote`, no semicolon confusion — run `npm run format` and do not hand-tune.
- Avoid `eval` and `new Function`. Bracket access (`obj[key]`) is always preferred over dynamic
  property path strings.
- Keep cross-component imports out of `packages/*/src` — shared helpers belong in one place
  rather than reaching across component folders.

## Versioning

This project follows [semantic versioning](https://semver.org/).

- **patch** — bug fixes, no API change
- **minor** — new components, new optional props, backwards compatible
- **major** — breaking API changes

Breaking changes must be documented in `CHANGELOG.md` with a migration note.

Releases are cut from tags, so do not bump `version` in `package.json` by hand.
