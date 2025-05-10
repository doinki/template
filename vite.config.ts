import devServer, { defaultOptions } from '@hono/vite-dev-server';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { reactRouterDevTools } from 'react-router-devtools';
import { defineConfig } from 'vite';
import { envOnlyMacros } from 'vite-env-only';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ isSsrBuild }) => {
  return {
    build: {
      sourcemap: isSsrBuild,
      // https://tailwindcss.com/docs/compatibility#browser-support
      target: isSsrBuild ? 'node22' : ['chrome111', 'safari16.4', 'firefox128'],
    },
    plugins: [
      tsconfigPaths(),
      tailwindcss(),
      reactRouterDevTools(),
      reactRouter(),
      envOnlyMacros(),
      devServer({
        entry: 'server/index.ts',
        exclude: [...defaultOptions.exclude, /^\/app\//],
        injectClientScript: false,
      }),
    ],
    test: {
      globals: true,
    },
  };
});
