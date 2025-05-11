/* eslint-disable import/no-unresolved */

import 'dotenv/config';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import type { TimingVariables } from 'hono/timing';
import { endTime, startTime, timing } from 'hono/timing';
import type { ServerBuild } from 'react-router';
import { createRequestHandler } from 'react-router-hono';
import { gracefulShutdown } from 'server.close';

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

if (import.meta.env.DEV) {
  (await import('source-map-support')).install({
    retrieveSourceMap(source) {
      const match = /^file:\/\/(.*)\?t=[\d.]+$/.exec(source);

      if (match) {
        return {
          map: readFileSync(`${match[1]}.map`, 'utf8'),
          url: source,
        };
      }

      return null;
    },
  });
}

const app = new Hono<{ Variables: TimingVariables }>();

app.use(timing());

if (import.meta.env.PROD) {
  app.use(
    serveStatic({
      onFound: (path, c) => {
        if (path.startsWith('./build/client/assets/')) {
          c.header('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (path.endsWith('.html')) {
          c.header('Cache-Control', 'public, max-age=300');
        } else {
          c.header('Cache-Control', 'public, max-age=3600');
        }
      },
      root: 'build/client',
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

app.use(logger());

const serverBuild: ServerBuild = await (import.meta.env.PROD
  ? // @ts-expect-error
    import('../build/server/index.js')
  : import('virtual:react-router/server-build'));

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
