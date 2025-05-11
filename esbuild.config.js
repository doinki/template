// @ts-check

import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import esbuild from 'esbuild';

const PRODUCTION = '"production"';
const TRUE = 'true';
const FALSE = 'false';

const outdir = join(import.meta.dirname, 'server-build');

if (existsSync(outdir)) {
  rmSync(outdir, { force: true, recursive: true });
}

esbuild
  .build({
    define: {
      'import.meta.env.DEV': FALSE,
      'import.meta.env.MODE': PRODUCTION,
      'import.meta.env.PROD': TRUE,
      'process.env.NODE_ENV': PRODUCTION,
    },
    entryPoints: ['server/index.ts'],
    format: 'esm',
    logLevel: 'info',
    minifySyntax: true,
    outdir,
    platform: 'node',
    target: 'node22',
    treeShaking: true,
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
