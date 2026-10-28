#!/usr/bin/env node
/**
 * Release a new version.
 *
 * Usage: node scripts/release.mjs <patch|minor|major> [--tag <dist-tag>] [--dry-run]
 *
 * The important part of this script is the verification step at the end: it
 * confirms the version actually exists in the registry. A bare
 * `pnpm version patch && npm publish` can silently fail (build error, expired
 * token, network) while leaving a local git tag behind — which makes the repo
 * claim a version was released when it was not.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const argv = process.argv.slice(2);
const bump = argv.find((a) => !a.startsWith('--'));
const dryRun = argv.includes('--dry-run');
const noBump = argv.includes('--no-bump');
const tagIndex = argv.indexOf('--tag');
const distTag = tagIndex > -1 ? argv[tagIndex + 1] : 'latest';

if (!['patch', 'minor', 'major'].includes(bump)) {
  console.error(
    'Usage: node scripts/release.mjs <patch|minor|major> [--tag <dist-tag>] [--dry-run] [--no-bump]',
  );
  process.exit(1);
}

const pkgPath = join(root, 'package.json');
const registry = process.env.npm_config_registry ?? 'https://registry.npmjs.org';

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { cwd: root, stdio: 'inherit', ...opts });

const sh = (cmd) => execFileSync('sh', ['-c', cmd], { cwd: root, encoding: 'utf8' }).trim();

console.log(`\nds-ui release  (${bump} → dist-tag "${distTag}")${dryRun ? '  [DRY RUN]' : ''}\n`);

/* ---------- 1. working tree must be clean ---------- */

const status = sh('git status --porcelain');
if (status) {
  console.error('x  Working tree is not clean. Commit or stash first:\n');
  console.error(
    status
      .split('\n')
      .map((l) => `     ${l}`)
      .join('\n'),
  );
  process.exit(1);
}
console.log('ok  working tree clean');

/* ---------- 2. current version must be published already ---------- */

const currentVersion = JSON.parse(readFileSync(pkgPath, 'utf8')).version;

const isPublished = async (version) => {
  try {
    execFileSync('npm', ['view', `${pkgName()}@${version}`, 'version'], {
      cwd: root,
      stdio: 'pipe',
    });
    return true;
  } catch {
    return false;
  }
};

function pkgName() {
  return JSON.parse(readFileSync(pkgPath, 'utf8')).name;
}

/** Does the package exist on the registry at all? */
const packageExists = () => {
  try {
    execFileSync('npm', ['view', pkgName(), 'name'], { cwd: root, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
};

const isFirstPublish = !packageExists();

if (isFirstPublish) {
  // Nothing to be consistent with yet — this is the bootstrap release that
  // claims the name. The "current version must exist" rule exists to stop a
  // tag from claiming a release that never happened, which does not apply here.
  console.log(`ok  "${pkgName()}" is not on the registry yet — this is the first publish`);
} else if (await isPublished(currentVersion)) {
  console.log(`ok  current version ${currentVersion} is on the registry`);
} else {
  console.error(
    `x  Current version ${currentVersion} is NOT published.\n` +
      `   The package exists on npm but this version does not.\n` +
      `   Fix that before cutting a new one, otherwise the tag will lie.`,
  );
  process.exit(1);
}

/* ---------- 3. build + verify ---------- */

console.log('\n... building');
run('npm', ['run', 'build']);
run('npm', ['run', 'verify:build']);

/* ---------- 4. dry run stops here ---------- */

if (dryRun) {
  console.log('\nDry run complete — build and verification passed. Nothing was published.');
  process.exit(0);
}

/* ---------- 5. bump ---------- */

/**
 * `--no-bump` publishes whatever version package.json already carries.
 *
 * Two cases need it:
 *  - the very first release, where the version was set by hand and bumping it
 *    would mean shipping 0.1.1 as the package's first version
 *  - retrying a publish that failed *after* the bump, where bumping again would
 *    leave a gap in the version history
 */
let nextVersion;

if (noBump) {
  nextVersion = JSON.parse(readFileSync(pkgPath, 'utf-8')).version;
  console.log(`\n... publishing version ${nextVersion} as-is (--no-bump)`);
} else {
  nextVersion = sh(`npm version ${bump} --no-git-tag-version --allow-same-version`)
    .split('\n')
    .pop()
    .trim();

  console.log(`\n... bumped to ${nextVersion}`);
}

/* ---------- 6. publish under the requested dist-tag ---------- */

console.log(`... publishing to ${registry} with dist-tag "${distTag}"`);

/**
 * `--provenance` generates a signed build attestation. npm only supports it when
 * publishing from a recognised CI provider (GitHub Actions, GitLab CI, CircleCI);
 * from a local machine there is no provider and npm rejects the flag with
 * `EUSAGE`. So it is added only when we are actually running in CI.
 */
const inCI = Boolean(process.env.GITHUB_ACTIONS || process.env.GITLAB_CI || process.env.CIRCLECI);

const publishArgs = ['publish', '--tag', distTag];
publishArgs.push('--access', 'public'); // required for unscoped names

if (inCI) {
  publishArgs.push('--provenance');
  console.log('    CI detected — generating provenance attestation');
} else {
  console.log('    not running in CI — skipping --provenance (npm rejects it locally)');
}

if (isFirstPublish) {
  console.log(`    first publish — claiming the name "${pkgName()}"`);
}

run('npm', publishArgs);

/* ---------- 7. VERIFY — the step that was missing before ---------- */

console.log('\n... verifying the release landed');

let attempts = 0;
let found = false;

while (attempts < 6) {
  attempts += 1;
  // npm's registry is eventually consistent; give it a moment.
  await new Promise((r) => setTimeout(r, attempts * 2000));

  if (await isPublished(nextVersion)) {
    found = true;
    break;
  }
  console.log(`    not visible yet, retrying (${attempts}/6)...`);
}

if (!found) {
  console.error(
    `\nFAILED: ${nextVersion} was not visible on ${registry} after publishing.\n` +
      `   The publish step reported success but the version is not retrievable.\n` +
      `   Investigate before tagging anything — the version may already be taken.`,
  );
  process.exit(1);
}

/* ---------- 8. confirm dist-tag points where we intended ---------- */

const tagged = execFileSync('npm', ['view', `${pkgName()}@${distTag}`, 'version'], {
  cwd: root,
  encoding: 'utf8',
}).trim();

if (tagged !== nextVersion) {
  console.error(
    `\nWARNING: dist-tag "${distTag}" points at ${tagged}, not ${nextVersion}.\n` +
      `   Fix with: npm dist-tag add ${pkgName()}@${nextVersion} ${distTag}`,
  );
} else {
  console.log(`ok  dist-tag "${distTag}" → ${nextVersion}`);
}

/* ---------- 9. only now create the git tag ---------- */

console.log(`\n... tagging v${nextVersion}`);
run('git', ['tag', `-a`, `v${nextVersion}`, '-m', `release: v${nextVersion}`]);

console.log(`\nDone. Review the tag, then push it:`);
console.log(`  git push origin main --follow-tags\n`);
