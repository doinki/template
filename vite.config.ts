import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import devServer, { defaultOptions } from '@hono/vite-dev-server';
import { reactRouter } from '@react-router/dev/vite';
import { sentryReactRouter } from '@sentry/react-router';
import tailwindcss from '@tailwindcss/vite';
import esbuild from 'esbuild';
import { extension } from 'esbuild-plugin-extension';
import { globSync } from 'glob';
import { reactRouterDevTools } from 'react-router-devtools';
import type { ConfigEnv } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import { envOnlyMacros } from 'vite-env-only';
import { removeSourcemap } from 'vite-plugin-remove-sourcemap';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(async (config) => {
  const env = loadEnv(config.mode, process.cwd(), '');

  const define = {
    'import.meta.env.SENTRY_DSN': String(JSON.stringify(env.SENTRY_DSN)),
  };

  if (config.isSsrBuild && config.command === 'build') {
    await build(config, { define, env });
  }

  return {
    build: {
      sourcemap: true,
      // https://tailwindcss.com/docs/compatibility#browser-support
      target: config.isSsrBuild ? 'node22' : ['chrome111', 'safari16.4', 'firefox128'],
    },
    define,
    plugins: [
      tsconfigPaths(),
      tailwindcss(),
      reactRouterDevTools(),
      reactRouter(),
      env.NODE_ENV === 'production' &&
        !!env.SENTRY_AUTH_TOKEN &&
        sentryReactRouter(
          {
            authToken: env.SENTRY_AUTH_TOKEN,
            org: env.SENTRY_ORG,
            project: env.SENTRY_PROJECT,
            release: { name: env.SENTRY_RELEASE },
            telemetry: false,
          },
          config,
        ),
      envOnlyMacros(),
      devServer({
        entry: 'server/index.ts',
        exclude: [...defaultOptions.exclude, /^\/app\//],
        injectClientScript: false,
      }),
      removeSourcemap(['build/**/*.?(m)js', 'build/**/*.map']),
    ].filter(Boolean),
    test: {
      globals: true,
    },
  } as const;
});

async function build(
  { mode }: ConfigEnv,
  { define, env }: { define: Record<string, string>; env: Record<string, string> },
) {
  const outdir = join(import.meta.dirname, 'server-build');
  if (existsSync(outdir)) {
    rmSync(outdir, { force: true, recursive: true });
  }

  const entryPoints = globSync('server/**/*.?(c|m)@(j|t)s', {
    cwd: import.meta.dirname,
  });

  await esbuild
    .build({
      bundle: true,
      define: {
        'import.meta.env.DEV': JSON.stringify(env.NODE_ENV !== 'production'),
        'import.meta.env.MODE': JSON.stringify(mode),
        'import.meta.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
        'import.meta.env.PROD': JSON.stringify(env.NODE_ENV === 'production'),
        ...define,
      },
      entryPoints,
      format: 'esm',
      logLevel: 'info',
      minifySyntax: true,
      outdir,
      packages: 'external',
      platform: 'node',
      plugins: [extension()],
      target: 'node22',
      treeShaking: true,
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
