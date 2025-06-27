import { readFileSync } from 'node:fs';

import { nodeProfilingIntegration } from '@sentry/profiling-node';
import * as Sentry from '@sentry/react-router';
import sourceMapSupport from 'source-map-support';

export function init() {
  sourceMapSupport.install({
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

  Sentry.init({
    dsn: import.meta.env.SENTRY_DSN,
    enabled: import.meta.env.PROD && !!import.meta.env.SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [nodeProfilingIntegration()],
    profileLifecycle: 'trace',
    profilesSampleRate: 1.0,
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
  });
}
