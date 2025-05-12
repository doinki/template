import * as Sentry from '@sentry/react-router';

export function init() {
  if (import.meta.env.SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.SENTRY_DSN,
      enabled: import.meta.env.PROD,
      environment: import.meta.env.MODE,
      integrations: [Sentry.browserProfilingIntegration(), Sentry.replayIntegration()],
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      sendDefaultPii: true,
      tracePropagationTargets: [/^\//],
      tracesSampleRate: 1.0,
    });
  }
}
