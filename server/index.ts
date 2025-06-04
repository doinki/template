/* eslint-disable @typescript-eslint/prefer-string-starts-ends-with */
import 'dotenv/config';

import { join } from 'node:path';

import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import type { TimingVariables } from 'hono/timing';
import { endTime, startTime, timing } from 'hono/timing';
import type i18next from 'i18next';
import type { ServerBuild } from 'react-router';
import { createRequestHandler } from 'react-router-hono';
import { gracefulShutdown } from 'server.close';

import { defaultLanguage, getLanguage, supportedLanguages } from '~/locales';

import en from '../public/locales/en.json';
import ko from '../public/locales/ko.json';
import { i18n } from './i18next';
import { init } from './init';

process.chdir(join(import.meta.dirname, '..'));

declare module 'react-router' {
  interface AppLoadContext {
    i18next: typeof i18next;
    language: string;
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
        if (path.substring(0, 16) === './client/assets/') {
          c.header('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (path.substring(0, 17) === './client/locales/') {
          c.header('Cache-Control', 'public, max-age=300, must-revalidate');
        } else if (path.endsWith('.html')) {
          c.header('Cache-Control', 'public, max-age=300, must-revalidate');
        } else {
          c.header('Cache-Control', 'public, max-age=3600, must-revalidate');
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
  i18n({
    fallbackLng: defaultLanguage,
    getLanguage: (c) => getLanguage(c.req.path),
    resources: {
      en: {
        translation: en,
      },
      ko: {
        translation: ko,
      },
    },
    supportedLngs: supportedLanguages,
  }),
);

app.use(
  createRequestHandler({
    build: serverBuild,
    getLoadContext: (c) => ({
      i18next: c.get('i18next'),
      language: c.get('language'),
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
      serverOptions: {
        keepAlive: true,
        keepAliveTimeout: 65_000,
      },
    },
    () => {
      console.log(`Server running at http://${hostname}:${port}`);
    },
  );

  gracefulShutdown(server);
}

export default app;
