import * as Sentry from '@sentry/react-router';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

if (import.meta.env.DEV && import.meta.env.MSW) {
  const worker = await import('~/mocks/browser').then((m) => m.worker);

  worker.start();
}

if (import.meta.env.PROD && import.meta.env.SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserProfilingIntegration(), Sentry.replayIntegration()],
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    sendDefaultPii: true,
    tracePropagationTargets: [/^\//],
    tracesSampleRate: 1.0,
  });
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
