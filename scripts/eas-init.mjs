#!/usr/bin/env node
/**
 * Link this app to an EAS project and write its id into app.config.ts.
 * `eas init` can't edit a dynamic config itself, so this wraps it.
 *
 *   pnpm eas:init            # creates/links the project for the current slug
 *   pnpm eas:init <id>       # just writes an existing project id
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

let id = process.argv[2];

if (id && !UUID.test(id)) {
  console.error(`"${id}" is not an EAS project id (UUID).`);
  process.exit(1);
}

if (!id) {
  const res = spawnSync('eas', ['init', '--non-interactive', '--force'], {
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
  });
  if (res.error) {
    console.error('EAS CLI not found. Install it with `npm i -g eas-cli`, then `eas login`.');
    process.exit(1);
  }
  const output = `${res.stdout}\n${res.stderr}`;
  id = output.match(new RegExp(`"projectId":\\s*"(${UUID.source})"`, 'i'))?.[1];
  if (!id) {
    process.stderr.write(output);
    console.error('\nCould not find a project id. Run `eas login` first, then retry.');
    process.exit(1);
  }
}

const file = 'app.config.ts';
const before = readFileSync(file, 'utf8');
const after = before.replace(/(\n\s+easProjectId: )'.*?',/, `$1'${id}',`);
if (after === before && !before.includes(`'${id}'`)) {
  console.error(`Could not find "easProjectId" in ${file}.`);
  process.exit(1);
}
writeFileSync(file, after);
console.log(`✓ Linked EAS project ${id} (app.config.ts)`);
