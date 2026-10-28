import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import * as naive from 'naive-ui';
import { SCard, SContainer, SDrawer, SForm, SIcon, SMessage, SModal, STable } from '@coldboy/ds-ui';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register ds-ui components for the demos.
    //
    // `create()` reads each component's `name`, which the components declare via
    // `<script setup name="Table">` and is materialised by
    // `vite-plugin-vue-setup-extend`. VitePress ships its own copy of
    // @vitejs/plugin-vue and that plugin does not apply here, so the names are
    // undefined and `create()` would skip every component. Registering
    // explicitly keeps the docs independent of that build-time detail.
    const dsComponents = {
      STable,
      SForm,
      SModal,
      SDrawer,
      SMessage,
      SCard,
      SContainer,
      SIcon,
    };

    for (const [name, component] of Object.entries(dsComponents)) {
      app.component(name, component);
    }

    // Register every Naive UI component globally.
    //
    // Registering the full set rather than a hand-picked list matters: the
    // components render Naive UI internals in their own templates (`<n-data-table>`
    // in STable, `<n-icon>` in SIcon, and so on). Those tags resolve only if they
    // are registered, and a missing one silently renders as an unknown element
    // instead of raising an error.
    //
    // Registration uses the export name (`NDataTable`), not the component's own
    // `name` field — Naive UI sets that to `"DataTable"`, without the `N`, which
    // would not match `<n-data-table>`.
    for (const [exportName, component] of Object.entries(naive)) {
      if (!exportName.startsWith('N')) continue;
      if (!component || typeof component !== 'object') continue;
      // Only real components — skip composables that happen to be exported as N*.
      if (!(component as any).render && !(component as any).setup) continue;
      app.component(exportName, component as any);
    }
  },
} satisfies Theme;
