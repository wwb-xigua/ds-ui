#!/usr/bin/env node
/**
 * Confirm that a given version exists in the registry and that its entry
 * points resolve. Useful as a post-publish CI step.
 *
 * Usage: node scripts/verify-published.mjs [version]
 *        (defaults to the version in package.json)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const version = process.argv[2] ?? pkg.version;
const registry = process.env.npm_config_registry ?? 'https://registry.npmjs.org';

console.log(`Checking ${pkg.name}@${version} on ${registry}\n`);

let manifest;
try {
  manifest = JSON.parse(
    execFileSync('npm', ['view', `${pkg.name}@${version}`, '--json'], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 8 * 1024 * 1024,
    }),
  );
} catch {
  console.error(`x  ${pkg.name}@${version} is not published to ${registry}`);
  process.exit(1);
}

console.log(`ok  version exists (${manifest.version})`);

const problems = [];

// The entry points declared in package.json must match what was actually published.
for (const [label, target] of [
  ['main', manifest.main],
  ['module', manifest.module],
  ['types', manifest.types],
]) {
  if (!target) {
    problems.push(`published manifest is missing "${label}"`);
    continue;
  }
  const localTarget = pkg[label];
  if (localTarget && localTarget !== target) {
    problems.push(`${label} drifted: published "${target}" vs local "${localTarget}"`);
  } else {
    console.log(`ok  ${label.padEnd(8)} ${target}`);
  }
}

if (problems.length) {
  console.error('\nFAILED:\n');
  for (const p of problems) console.error(`  x  ${p}`);
  process.exit(1);
}

console.log('\nPublished manifest looks correct.');
