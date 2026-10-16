<h1 align="center">ds-ui</h1>

<p align="center">
  A Vue 3 component library for building data-heavy admin interfaces, built on Naive UI.
</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" /></a>
  <img src="https://img.shields.io/badge/vue-3.4+-42b883" alt="Vue" />
  <img src="https://img.shields.io/badge/naive--ui-2.40+-64b5cf" alt="Naive UI" />
</p>

---

## Features

- **Schema-driven forms** — describe your fields once, get a responsive, validated grid form out.
- **Filterable data tables** — column-level filtering (text / number / single & multi select / tree / date range), sorting, server-side pagination, and column show-hide built in.
- **Headless-friendly** — every component returns its instance methods via `@register`, so you drive it imperatively instead of fighting the template.
- **Fully typed** — written in TypeScript with exported prop/method types.
- **Tree-shakeable** — import individual components, or register them globally on demand.
- **Themeable** — Naive UI is externalized, so `NConfigProvider` (themes, dark mode, locale) works through `ds-ui` components just like any native Naive UI component.

## Requirements

| | |
|---|---|
| Vue | `^3.4.0` (peer dependency) |
| Naive UI | `^2.40.4` |
| Node | `>=18` (for contributing / building) |

## Installation

```bash
npm install ds-ui naive-ui vue
```

## Quick Start

### On-demand import (recommended)

```vue
<script setup lang="ts">
import { STable } from 'ds-ui';
</script>

<template>
  <s-table :columns="columns" :data="data" />
</template>
```

### Register globally

```ts
import { createApp } from 'vue';
import * as DsUI from 'ds-ui';
import { create } from 'ds-ui';

const app = createApp(App);

app.use(create({ components: [DsUI.STable, DsUI.SForm, DsUI.SModal] }));

app.mount('#app');
```

Only the components you list are registered and bundled.

### Styles

`ds-ui` extracts component styles into a single stylesheet:

```ts
import 'ds-ui/style.css';
```

## Components

| Component | Description |
|---|---|
| `STable` | Data table with built-in filtering, sorting, pagination, and column customization |
| `SForm` | Schema-driven form layout with grid, validation, and submit/reset |
| `SModal` | Imperative modal dialog (`useModal`) |
| `SDrawer` | Imperative drawer (`useDrawer`) |
| `SMessage` | Global message/notification (`useMessage`) |
| `SCard` | Card with auto-sizing and collapse behaviour |
| `SContainer` | Responsive page container |
| `SIcon` | Inline SVG icon set |

## `STable`

`STable` is built around a `@register` callback that hands you a set of imperative methods.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useSTable } from 'ds-ui';

const [register, methods] = useSTable({
  api: async (params) => {
    const res = await fetch('/api/experts', {
      method: 'POST',
      body: JSON.stringify(params),
    }).then((r) => r.json());

    return {
      records: res.list,
      total: res.total,
      current: res.current,
      size: res.size,
      pages: res.pages,
    };
  },
  columns: [
    { title: 'Name', key: 'name', filterType: 'text' },
    { title: 'Category', key: 'category', filterType: 'singleChoice' },
    { title: 'Status', key: 'status', filterType: 'multipleChoice' },
    { title: 'Score', key: 'score', filterType: 'number', sorter: true },
    { title: 'Created', key: 'createdAt', filterType: 'datePicker' },
  ],
});
</script>

<template>
  <s-table @register="register" />
</template>
```

### Column filter types

Set `filterType` on a column to enable its filter panel:

| `filterType` | UI |
|---|---|
| `text` | Free-text input |
| `number` | Numeric range / comparison |
| `singleChoice` | Single select |
| `multipleChoice` | Multi select |
| `treeMultipleChoice` | Tree multi select |
| `datePicker` | Date range |

### Instance methods

Returned by `useSTable()` or `defineExpose` on `STable`:

| Method | Description |
|---|---|
| `loadData(params?, reset?)` | Fetch data. `reset` clears filters and sorts first. |
| `refreshCurrentPage()` | Re-fetch the current page, keeping filters and pagination |
| `getTbFilterData()` | Current query payload (pagination + filters + sorts) |
| `getTbFilterDataWithoutFormAndFilters()` | Current query payload without the `form` and `filters` keys |
| `getTableTotal()` | Total row count |
| `setProps(props)` | Merge props at runtime |

## `SForm`

```vue
<script setup lang="ts">
import { useForm } from 'ds-ui';

const [register, methods] = useForm({
  schemas: [
    { field: 'name', label: 'Name', component: 'NInput', required: true },
    { field: 'status', label: 'Status', component: 'NSelect', componentProps: { options: [] } },
    { field: 'note', label: 'Note', component: 'NInput', componentProps: { type: 'textarea' } },
  ],
  showAdvancedButton: true,
});
</script>

<template>
  <s-form @register="register" />
</template>
```

## Theming

Because Naive UI is a real runtime dependency rather than being bundled, Naive UI's
`NConfigProvider` reaches every `ds-ui` component. Dark mode and custom themes work as expected:

```vue
<n-config-provider :theme="darkTheme">
  <s-table :columns="columns" :data="data" />
</n-config-provider>
```

## Contributing

Contributions and feedback are very welcome — this library is young and there is plenty of room
to shape its API.

- **Open an issue** to report a bug or request a feature. Real-world usage reports are especially valuable.
- **Submit a pull request.** Run `npm run build` before opening one; type checking is part of the build.

```bash
git clone <your-fork>
cd ds-ui
npm install
npm run dev        # playground at http://localhost:5173
npm run build      # typecheck + production build
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details, and [SECURITY.md](./SECURITY.md) for
responsible disclosure.

## License

[MIT](./LICENSE)
