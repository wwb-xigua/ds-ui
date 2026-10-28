import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueSetupExtend from 'vite-plugin-vue-setup-extend';
import svgLoader from 'vite-svg-loader';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

/**
 * Dependencies that must NOT be inlined into the bundle.
 *
 * These are resolved from the host application's node_modules so that a single
 * instance is shared. Inlining them would ship a second copy of Naive UI,
 * which breaks `NConfigProvider` theming (it relies on provide/inject) and bloats
 * the published package.
 *
 * Every entry here must also be declared in package.json `dependencies`
 * (or `peerDependencies`), otherwise the published package would contain
 * imports that cannot be resolved.
 */
const external = [
  'vue',
  'naive-ui',
  '@vueuse/core',
  'date-fns',
];

export default defineConfig({
  plugins: [
    vue(),
    VueSetupExtend(),
    svgLoader(),
    dts({
      insertTypesEntry: true,
      copyDtsFiles: false,
      // The playground is a dev harness, not part of the public API surface.
      exclude: ['playground/**'],
    }),
  ],
  build: {
    rollupOptions: {
      external,
      output: {
        globals: {
          vue: 'Vue',
        },
        exports: 'named',
      },
    },
    lib: {
      // Two entry points.
      //
      // `ds-ui` carries the general-purpose components and must stay small.
      // `ds-ui/viewer` carries the PDF reader, which pulls in pdfjs-dist
      // (~370 KB) — far too heavy to burden every consumer of the library.
      // Splitting by entry means an app that never renders a PDF never pays
      // for the PDF engine.
      entry: {
        index: resolve(__dirname, 'packages/index.ts'),
        viewer: resolve(__dirname, 'packages/viewer/index.ts'),
      },
      formats: ['es', 'cjs'],
      name: 'DsUI',
      // Pinned so the published file names stay stable regardless of the
      // package name. Without this, switching to a scoped package would
      // rename the entry files and break the `main` / `module` fields.
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'js' : 'cjs';
        return entryName === 'index' ? `ds-ui.${ext}` : `ds-ui-${entryName}.${ext}`;
      },
    },
  },
  resolve: {
    dedupe: ['vue'],
    alias: [
      {
        find: /\/#\//,
        replacement: resolve(process.cwd(), './types') + '/',
      },
    ],
  },
});
