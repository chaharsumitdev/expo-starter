#!/usr/bin/env node
/**
 * Give a new app its identity in one step.
 *
 *   pnpm rename --name "Acme Notes" --bundle-id com.acme.notes
 *   pnpm rename --name "Acme Notes" --bundle-id com.acme.notes --scheme acmenotes --slug acme-notes
 *
 * Updates app.config.ts (APP block), package.json, the localized display name and README title.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    name: { type: 'string' },
    'bundle-id': { type: 'string' },
    scheme: { type: 'string' },
    slug: { type: 'string' },
  },
});

const name = values.name?.trim();
const bundleId = values['bundle-id']?.trim();

if (!name || !bundleId) {
  console.error(
    'Usage: pnpm rename --name "My App" --bundle-id com.company.myapp [--scheme myapp] [--slug my-app]',
  );
  process.exit(1);
}
if (!/^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+$/.test(bundleId)) {
  console.error(
    `Invalid bundle id "${bundleId}". Use reverse-DNS with letters/digits only, e.g. com.acme.notes`,
  );
  process.exit(1);
}

const slug =
  values.slug ??
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const scheme = values.scheme ?? slug.replace(/-/g, '');

if (!/^[a-z][a-z0-9+.-]*$/.test(scheme)) {
  console.error(`Invalid scheme "${scheme}". Use lowercase letters, digits, "+", "." or "-".`);
  process.exit(1);
}

function edit(file, fn) {
  const before = readFileSync(file, 'utf8');
  const after = fn(before);
  if (after === before) console.warn(`  ! nothing changed in ${file}`);
  writeFileSync(file, after);
  console.log(`  ✓ ${file}`);
}

const quote = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

console.log(`Renaming to "${name}" (${bundleId}, scheme ${scheme}://, slug ${slug})`);

edit('app.config.ts', (s) =>
  s
    .replace(/(\n\s+name: )'.*?',/, `$1${quote(name)},`)
    .replace(/(\n\s+slug: )'.*?',/, `$1${quote(slug)},`)
    .replace(/(\n\s+scheme: )'.*?',/, `$1${quote(scheme)},`)
    .replace(/(\n\s+bundleId: )'.*?',/, `$1${quote(bundleId)},`)
    .replace(/(\n\s+easProjectId: )'.*?',/, `$1'',`),
);

edit('package.json', (s) => {
  const pkg = JSON.parse(s);
  pkg.name = slug;
  pkg.version = '1.0.0';
  return `${JSON.stringify(pkg, null, 2)}\n`;
});

edit('src/locales/en/native.json', (s) => {
  const json = JSON.parse(s);
  json.CFBundleDisplayName = name;
  return `${JSON.stringify(json, null, 2)}\n`;
});

edit('README.md', (s) => s.replace(/^# .*$/m, `# ${name}`));

console.log(`
Done. Next:
  1. Translate the app name in src/locales/*/native.json
  2. Replace icons/splash in assets/images
  3. Set brand colors in src/global.css
  4. pnpm eas:init             (links an EAS project, fills easProjectId)
  5. rm -rf ios android && pnpm ios`);
