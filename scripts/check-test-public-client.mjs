#!/usr/bin/env node
/**
 * Fails fast if assertModuleInterface() is used without getPublicClient() in the same file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'test', 'thirdweb');

const bad = [];
for (const name of fs.readdirSync(dir)) {
  if (!name.endsWith('.test.ts')) continue;
  const src = fs.readFileSync(path.join(dir, name), 'utf8');
  if (!src.includes('assertModuleInterface')) continue;
  if (!src.includes('getPublicClient')) {
    bad.push(name);
  }
}

if (bad.length > 0) {
  console.error(
    `Missing getPublicClient() in files that call assertModuleInterface:\n  ${bad.join('\n  ')}`,
  );
  process.exit(1);
}
