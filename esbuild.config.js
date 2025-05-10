// @ts-check

import { join } from 'node:path';

import esbuild from 'esbuild';

esbuild
  .build({
    define: {
      'import.meta.env.PROD': 'true',
      'process.env.NODE_ENV': '"production"',
    },
    entryPoints: ['server/index.ts'],
    format: 'esm',
    logLevel: 'info',
    minifySyntax: true,
    outdir: join(import.meta.dirname, 'server-build'),
    platform: 'node',
    sourcemap: true,
    target: 'node22',
    treeShaking: true,
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
