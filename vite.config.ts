import devServer, { defaultOptions } from '@hono/vite-dev-server';
import { reactRouter } from '@react-router/dev/vite';
import { sentryReactRouter } from '@sentry/react-router';
import tailwindcss from '@tailwindcss/vite';
import { reactRouterDevTools } from 'react-router-devtools';
import { defineConfig, loadEnv } from 'vite';
import { envOnlyMacros } from 'vite-env-only';
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
      },
      sourcemap: !!env.SENTRY_AUTH_TOKEN,
      // https://tailwindcss.com/docs/compatibility#browser-support
      target: config.isSsrBuild ? 'node22' : ['chrome111', 'safari16.4', 'firefox128'],
    },
    define,
    plugins: [
      tsconfigPaths(),
      tailwindcss(),
      reactRouterDevTools(),
      reactRouter(),
      sentryReactRouter(
        {
          authToken: env.SENTRY_AUTH_TOKEN,
          bundleSizeOptimizations: {
            excludeDebugStatements: true,
          },
          org: env.SENTRY_ORG,
          project: env.SENTRY_PROJECT,
          sourceMapsUploadOptions: {
            enabled: !!env.SENTRY_AUTH_TOKEN,
          },
          telemetry: false,
          unstable_sentryVitePluginOptions: {
            release: {
              setCommits: {
                auto: true,
              },
            },
          },
        },
        config,
      ),
      envOnlyMacros(),
      devServer({
        entry: 'server/index.ts',
        exclude: [...defaultOptions.exclude, /^\/app\//],
        injectClientScript: false,
      }),
    ].filter(Boolean),
    server: {
      port: 3000,
    },
    test: {
      globals: true,
    },
  } as const;
});
