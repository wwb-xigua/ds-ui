#!/usr/bin/env node
/**
 * Post-build verification.
 *
 * Guards against two failure modes that are invisible until a consumer hits them:
 *
 *  1. package.json points at an entry file the build never emits. A real
 *     instance of this shipped for 203 releases: `main` referenced
 *     `dist/pkg.umd.cjs` while Vite only ever wrote `dist/pkg.cjs`, so
 *     `require('pkg')` threw MODULE_NOT_FOUND in Jest/SSR/Node.
 *
 *  2. An externalized dependency gets inlined back into the bundle. That ships a
 *     second copy of Naive UI, which breaks `NConfigProvider` theming (it relies
 *     on provide/inject) and silently doubles the payload.
 *
 * Inlining is detected using implementation-only markers — strings that exist
 * inside a dependency's source but never in an import statement. Matching on
 * symbol names like `useElementSize` produces false positives, because those
 * names appear in our own `import { useElementSize } from '@vueuse/core'`.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const failures = [];
const notes = [];

/* ---------- 1. every declared entry point must exist ---------- */

const declared = new Map();

if (pkg.main) declared.set('main', pkg.main);
if (pkg.module) declared.set('module', pkg.module);
if (pkg.types) declared.set('types', pkg.types);

for (const [condition, value] of Object.entries(pkg.exports ?? {})) {
  if (typeof value === 'string') {
    declared.set(`exports['${condition}']`, value);
    continue;
  }
  for (const [sub, target] of Object.entries(value)) {
    if (typeof target === 'string') declared.set(`exports['${condition}'].${sub}`, target);
  }
}

if (declared.size === 0) failures.push('package.json declares no entry points');

for (const [label, target] of declared) {
  const abs = join(root, target);
  if (!existsSync(abs)) {
    failures.push(`${label} -> "${target}" does not exist`);
  } else {
    const kb = (statSync(abs).size / 1024).toFixed(1);
    notes.push(`  ok  ${label.padEnd(32)} ${target}  (${kb} KB)`);
  }
}

/* ---------- 2. externals + inlining detection ---------- */

const bundleEntry = pkg.exports?.['.']?.import ?? pkg.module;

if (bundleEntry && existsSync(join(root, bundleEntry))) {
  const code = readFileSync(join(root, bundleEntry), 'utf8');

  /**
   * Strings that appear inside a dependency's implementation but never in an
   * `import ... from '<dep>'` statement. Keep these implementation-specific.
   */
  const externals = {
    'naive-ui': ['n-base-selection', 'cssr', 'seemly', 'zindexable', 'virtualList'],
    '@vueuse/core': ['tryOnScopeDispose', 'effectScope', 'onWatcherCleanup'],
    'date-fns': ['differenceInCalendarDays', 'eachWeekOfInterval'],
  };

  for (const [dep, markers] of Object.entries(externals)) {
    const isDeclaredExternal =
      pkg.peerDependencies?.[dep] !== undefined || pkg.dependencies?.[dep] !== undefined;

    const hits = markers.filter((m) => code.includes(m));

    if (hits.length) {
      failures.push(
        `"${dep}" is inlined into the bundle (found: ${hits.join(', ')}). ` +
          `It must stay external so the host app shares a single instance — ` +
          `inlining also breaks NConfigProvider theming.`,
      );
    } else if (!isDeclaredExternal) {
      failures.push(
        `"${dep}" is externalized in the build but is not declared in ` +
          `package.json dependencies/peerDependencies — consumers would get ` +
          `an unresolvable import.`,
      );
    } else {
      notes.push(`  ok  ${dep.padEnd(32)} external (not inlined)`);
    }
  }

  /**
   * Vue is checked differently: its compiler-generated block helpers
   * (`openBlock`, `createElementBlock`, ...) are emitted inline by
   * @vitejs/plugin-vue regardless of the external setting, so marker matching
   * would false-positive. What actually matters is that it is declared as a
   * peer dependency and imported rather than bundled.
   */
  if (pkg.peerDependencies?.vue === undefined) {
    failures.push(
      `vue must be declared in peerDependencies (found in: ` +
        `${Object.keys(pkg.dependencies ?? {}).join(', ') || 'nothing'})`,
    );
  } else if (!/from\s*["']vue["']/.test(code)) {
    failures.push(`vue is not imported from the bundle — it should be a bare-specifier import`);
  } else {
    notes.push(`  ok  ${'vue'.padEnd(32)} peer dependency, imported bare`);
  }

  /* ---------- 3. no eval / new Function in shipped code ---------- */
  for (const [label, pattern] of [
    ['eval(', /\beval\s*\(/],
    ['new Function(', /new\s+Function\s*\(/],
  ]) {
    if (pattern.test(code)) {
      failures.push(
        `bundle contains ${label} — this breaks any Content-Security-Policy ` +
          `that disallows 'unsafe-eval'`,
      );
    } else {
      notes.push(`  ok  ${'no ' + label.padEnd(29)} clean`);
    }
  }

  /* ---------- 4. size backstop ---------- */
  const kb = statSync(join(root, bundleEntry)).size / 1024;
  const budget = 400;
  if (kb > budget) {
    failures.push(
      `bundle is ${kb.toFixed(0)} KB, over the ${budget} KB budget — something is ` +
        `probably being inlined again`,
    );
  } else {
    notes.push(`  ok  ${'bundle size'.padEnd(32)} ${kb.toFixed(0)} KB (budget ${budget} KB)`);
  }

  /* ---------- 5. the CJS build must only require resolvable packages ----------
   *
   * A dependency that is pure-ESM (`"type": "module"` with no CommonJS build)
   * cannot be `require()`d. If the library externalizes one, the entire CJS
   * bundle throws ERR_REQUIRE_ESM at load time — `lodash-es` did exactly this,
   * making `require('ds-ui')` fail in Jest and Node SSR. This check is the
   * automated guard against repeating it.
   */

  const cjsEntry = pkg.exports?.['.']?.require ?? pkg.main;
  if (cjsEntry && existsSync(join(root, cjsEntry))) {
    const cjs = readFileSync(join(root, cjsEntry), 'utf8');
    const required = [
      ...new Set([...cjs.matchAll(/require\(["']([^"']+)["']\)/g)].map((m) => m[1])),
    ];

    // Packages that ship a CommonJS build are safe to require.
    const ESM_ONLY = new Set(['lodash-es']);

    const unresolvable = required.filter(
      (dep) =>
        !dep.startsWith('.') &&
        !dep.startsWith('node:') &&
        ![
          'assert',
          'buffer',
          'crypto',
          'fs',
          'path',
          'util',
          'url',
          'stream',
          'events',
          'os',
        ].includes(dep) &&
        pkg.peerDependencies?.[dep] === undefined &&
        pkg.dependencies?.[dep] === undefined,
    );

    if (unresolvable.length) {
      failures.push(
        `the CommonJS build requires ${unresolvable.join(', ')}, which is not declared in ` +
          `package.json — consumers would get MODULE_NOT_FOUND`,
      );
    }

    const esmOnly = required.filter((dep) => ESM_ONLY.has(dep));
    if (esmOnly.length) {
      failures.push(
        `the CommonJS build requires ${esmOnly.join(', ')}, which is pure-ESM and cannot be ` +
          `require()d — the whole CJS bundle would throw ERR_REQUIRE_ESM`,
      );
    }

    notes.push(`  ok  ${'cjs requires'.padEnd(32)} ${required.length} package(s), all resolvable`);
  }
}

/* ---------- report ---------- */

console.log('Build verification\n');
for (const note of notes) console.log(note);
console.log('');

if (failures.length) {
  console.error('FAILED:\n');
  for (const f of failures) console.error(`  x  ${f}`);
  console.error('');
  process.exit(1);
}

console.log('All checks passed.\n');
