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
      rollupOptions: config.isSsrBuild ? { input: 'server/index.ts' } : undefined,
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
