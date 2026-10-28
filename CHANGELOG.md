# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

Nothing yet.

## 0.1.1

### Added

- **`SPdfViewer`** — a PDF reader with page navigation, zoom, rotation, and fit-to-width.
  Available from the `ds-ui/viewer` subpath so that apps which never render a
  PDF do not pay for the PDF engine:

  ```ts
  import { SPdfViewer } from '@coldboy/ds-ui/viewer';
  ```

  The main entry stays at ~230 KB; the viewer entry carries pdfjs-dist and is
  only loaded on demand.

### Fixed

- **Naive UI components are now imported directly by every ds-ui component.**
  ds-ui's templates render Naive UI internals (`<n-data-table>` in `STable`,
  `<n-icon>` in `SIcon`, and 25 more). Previously the consuming application had
  to register all 27 of them globally, and a missing registration did not throw
  — the element simply rendered as an unknown tag and disappeared. Consumers no
  longer need to do that.

- **`<s-table :data="..." />` rendered an empty table.** `tableProps` is merged
  *after* the declared props, so its empty `data: []` initialiser shadowed the
  value passed in. The table now seeds `data` from the prop and keeps it in sync
  when no `api` is supplied.

### Changed

- The package now exposes a second entry point, `ds-ui/viewer`. The main
  entry's file names and the `main` / `module` / `exports` fields are unchanged,
  so this is not a breaking change for existing consumers.

## 0.1.0

Initial open-source release.

> **Package name**: published as `@coldboy/ds-ui` rather than `ds-ui`. npm's
> name-similarity policy permanently rejects the unscoped `ds-ui` because a
> different package named `ds_ui` already exists on the registry. A scope has
> its own namespace and is unaffected. Install with
> `npm i @coldboy/ds-ui`.

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
