import 'dotenv/config';

import { join } from 'node:path';

import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import type { TimingVariables } from 'hono/timing';
import { endTime, startTime, timing } from 'hono/timing';
import type { ServerBuild } from 'react-router';
import { createRequestHandler } from 'react-router-hono';
import { gracefulShutdown } from 'server.close';

import { init } from './init';

process.chdir(join(import.meta.dirname, '..'));

declare module 'react-router' {
  interface AppLoadContext {
    serverBuild: ServerBuild;
    timing: {
      endTime: (name: string, precision?: number) => void;
      startTime: (name: string, description?: string) => void;
    };
  }
}

await init();

const app = new Hono<{ Variables: TimingVariables }>();

app.use(timing());

if (import.meta.env.PROD) {
  app.use(
    serveStatic({
      onFound: (path, c) => {
        // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
        if (path.substring(0, 16) === './client/assets/') {
          c.header('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (path.endsWith('.html')) {
          c.header('Cache-Control', 'public, max-age=300');
        } else {
          c.header('Cache-Control', 'public, max-age=3600');
        }
      },
      root: 'client',
    }),
  );
}

app.get('*', async (c, next) => {
  if (c.req.path.at(-1) === '/' && c.req.path !== '/') {
    const url = new URL(c.req.url);
    url.pathname = url.pathname.substring(0, url.pathname.length - 1);

    return c.redirect(url);
  }

  return next();
});

// eslint-disable-next-line import/no-unresolved
const serverBuild: ServerBuild = await import('virtual:react-router/server-build');

app.use(
  createRequestHandler({
    build: serverBuild,
    getLoadContext: (c) => ({
      serverBuild,
      timing: {
        endTime: endTime.bind(null, c),
        startTime: startTime.bind(null, c),
      },
    }),
  }),
);

if (import.meta.env.PROD) {
  const hostname = process.env.HOST || '0.0.0.0';
  const port = Number(process.env.PORT) || 3000;

  const server = serve(
    {
      fetch: app.fetch,
      hostname,
      port,
    },
    () => {
      console.log(`Server running at http://${hostname}:${port}`);
    },
  );

  // @ts-expect-error
  server.keepAliveTimeout = 65_000;

  gracefulShutdown(server);
}

export default app;
