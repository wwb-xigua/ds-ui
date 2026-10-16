# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

Nothing yet.

## 0.1.0

Initial open-source release.

### Components

- `STable` — data table with column filtering (text, number, single/multi choice, tree, date
  range), sorting, server-side pagination, and a column show/hide panel
- `SForm` — schema-driven form layout with responsive grid, validation, and submit/reset
- `SModal`, `SDrawer`, `SMessage` — imperative overlays exposed through `useModal`, `useDrawer`,
  and `useMessage`
- `SCard`, `SContainer`, `SIcon`

### Fixes

Defects carried over from the pre-release code base, corrected before publishing:

- **`toolbarConfig.custom` rendered an empty table.** Column visibility was resolved
  inconsistently: the column panel treats a missing `show` as visible (`show != false`),
  while the table filtered with a truthy check, so every column without an explicit `show`
  was dropped. Enabling the column panel left the table with zero columns.
- **Height calculation could throw.** `computeTableHeight` called `table.$el.querySelector(...)`
  without checking that `$el` exists. The ref can be mid-update and a fragment-rooted
  component has no single root element, which threw
  `Cannot read properties of undefined (reading 'querySelector')` and aborted rendering.
- **Viewport measurement was not defensive.** `getViewportOffset` assumed `document`,
  `window.parent`, and a live element, so it failed under SSR and inside embedded frames.
  It now returns a zeroed result rather than throwing.
- **`useTable` used `eval` for field lookups.** `tableDataFiled`, `itemCountFiled`, and
  `extraField` were resolved with `eval("res?." + field)`, which breaks any
  Content-Security-Policy that disallows `unsafe-eval`. `STable` already used bracket
  access; `useTable` now does too.
- **`SForm.setFieldsValue` used `new Function`** for nested `a.b.c` field paths, with the same
  CSP problem. Replaced with `getByPath` / `setByPath`, which traverse own properties only.
  The nested-path branch also ran once per top-level key instead of once per field.
- **Global component registration was broken.** The preset registered *every* barrel export as
  a global component, so plain functions (`useForm`, `useTable`, `getColumnDisplayTitle`, ...)
  were registered under names like `SuseForm`. Registration now uses an explicit list, and
  a component without a name is skipped with a warning instead of registering as
  `Sundefined`.
- **`SMessage` was not globally registered.** It carried no component name, so it registered
  as `Sundefined` and was unusable through global install.
- **The CommonJS build could not be loaded at all.** `main` and `exports.require` pointed at
  `dist/pkg.umd.cjs` while the build emits `dist/pkg.cjs`, so `require('pkg')` threw
  `MODULE_NOT_FOUND`. Separately, `lodash-es` is a pure-ESM package, so requiring it from the
  CJS bundle threw `ERR_REQUIRE_ESM`. Five lodash helpers were replaced with local equivalents
  and the dependency dropped.
- **Deep `naive-ui/lib/*` type imports** were replaced with the package root. Those paths are
  not part of Naive UI's public API and break on upgrade.
- **Types were unusable without `as any`.** `STableProps` intersected Naive UI's `TableProps`,
  whose `columns` type conflicted with the component's own, so even the bundled playground had
  to cast. `columns` and `data` now accept a plain value or a `ref`, and `getTableTotal` is
  typed as a number.

### Build

- Naive UI and the other runtime dependencies are externalized instead of being inlined,
  cutting the bundle from 578 KB to ~231 KB and letting the host application's
  `NConfigProvider` theme, dark mode, and locale reach `ds-ui` components.
- Declared `sideEffects: false` so bundlers can drop unused components.
- The development playground moved to `playground/`, so its types are no longer published.
- Added `npm run verify:build`, which fails the build if a declared entry point is missing, a
  dependency gets re-inlined, the CJS bundle requires something unresolvable, or `eval` /
  `new Function` reappears. Wired into CI on both GitLab and GitHub Actions.
- Added VitePress documentation with live, runnable examples for every component.

### Known limitations

- `STable`'s adaptive height assumes the table is the main content of a page. When embedding
  it in documentation or other scrolling containers, pass `fixedHeight` or `maxHeight`.
- Imperative `register`-based props are applied during setup, so the first server-rendered
  HTML does not include table rows. Fine for SPAs; wrap such demos in `<ClientOnly>` when
  building a statically generated site.
