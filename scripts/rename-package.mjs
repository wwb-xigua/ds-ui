#!/usr/bin/env node
/**
 * Rename the published package.
 *
 * Usage: node scripts/rename-package.mjs <new-name>
 *
 * Rewrites the package name, every import site in the docs and README, the
 * npm-facing metadata, and pins the build output filenames so they do not shift
 * when the package name changes (a scoped name would otherwise produce
 * `coldboy-ds-ui.js`).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const newName = process.argv[2];

if (!newName) {
  console.error('Usage: node scripts/rename-package.mjs <new-name>');
  process.exit(1);
}
if (!/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(newName)) {
  console.error(`"${newName}" is not a valid npm package name`);
  process.exit(1);
}

const oldName = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8')).name;
if (oldName === newName) {
  console.log(`already named ${newName}`);
  process.exit(0);
}

console.log(`renaming ${oldName} -> ${newName}\n`);

/* ---------- 1. package.json ---------- */

const pkgPath = join(root, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
pkg.name = newName;

// The dist file names are pinned in vite.config.ts, so they stay `ds-ui.js`
// regardless of the package name. Keep the package.json fields in sync.
pkg.main = './dist/ds-ui.cjs';
pkg.module = './dist/ds-ui.js';
pkg.types = './dist/index.d.ts';
pkg.exports = {
  '.': {
    types: './dist/index.d.ts',
    import: './dist/ds-ui.js',
    require: './dist/ds-ui.cjs',
  },
  './style.css': './dist/style.css',
  './dist/style.css': './dist/style.css',
  './package.json': './package.json',
};
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
console.log('  package.json name + entry points updated');

/* ---------- 2. source-level imports and docs ---------- */

const targets = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf-8' })
  .split('\n')
  .filter(Boolean)
  .filter((f) => /\.(ts|vue|md|json|yml)$/.test(f))
  .filter((f) => !f.startsWith('package-lock.json'));

let touched = 0;
for (const file of targets) {
  const abs = join(root, file);
  let text;
  try {
    text = readFileSync(abs, 'utf-8');
  } catch {
    continue;
  }
  const before = text;

  // Import specifiers: from 'ds-ui' / from "ds-ui"
  text = text.replace(new RegExp(`(['"])${oldName}\\1`, 'g'), `$1${newName}$1`);
  // npm install commands
  text = text.replace(new RegExp(`npm (i|install) ${oldName}\\b`, 'g'), `npm $1 ${newName}`);
  // package.json dependency references
  text = text.replace(new RegExp(`"${oldName}"`, 'g'), `"${newName}"`);

  if (text !== before) {
    writeFileSync(abs, text, 'utf-8');
    touched += 1;
  }
}
console.log(`  ${touched} file(s) updated`);

/* ---------- 3. report what the docs now import ---------- */

console.log('\nverify the package name is consistent:');
const check = JSON.parse(readFileSync(pkgPath, 'utf-8'));
console.log(`  package.json name: ${check.name}`);
execFileSync('git', ['diff', '--stat'], { cwd: root, stdio: 'inherit' });
console.log('\nnext: npm run build && npm run verify:build, then publish');
