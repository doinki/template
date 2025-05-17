import { createHash } from 'node:crypto';

import devServer, { defaultOptions } from '@hono/vite-dev-server';
import { reactRouter } from '@react-router/dev/vite';
import { sentryReactRouter } from '@sentry/react-router';
import tailwindcss from '@tailwindcss/vite';
import { reactRouterDevTools } from 'react-router-devtools';
import { defineConfig, loadEnv } from 'vite';
import { envOnlyMacros } from 'vite-env-only';
import { removeSourcemap } from 'vite-plugin-remove-sourcemap';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig((config) => {
  const env = loadEnv(config.mode, process.cwd(), '');

  const define = {
    'import.meta.env.MSW': String(JSON.stringify(env.MSW)),
    'import.meta.env.SENTRY_DSN': String(JSON.stringify(env.SENTRY_DSN)),
  };

  return {
    build: {
      rollupOptions: {
        input: config.isSsrBuild ? 'server/index.ts' : undefined,
        output: {
          assetFileNames: (config) => {
            return `assets/${createHash('sha256')
              .update(config.names.reduce((prev, curr) => prev + curr))
              .digest('hex')
              .substring(0, 6)}-[hash:10][extname]`;
          },
          chunkFileNames: ({ name }) =>
            `assets/${createHash('sha256').update(name).digest('hex').substring(0, 6)}-[hash:10].js`,
          entryFileNames: ({ name }) =>
            `assets/${createHash('sha256').update(name).digest('hex').substring(0, 6)}-[hash:10].js`,
          manualChunks: (id) => {
            if (/\.pnpm\/(?:react|react-dom|scheduler)@/.test(id)) {
              return 'react';
            }
          },
        },
      },
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
    server: {
      port: 3000,
    },
    test: {
      globals: true,
    },
  } as const;
});
