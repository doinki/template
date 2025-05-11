import { nodeProfilingIntegration } from '@sentry/profiling-node';
import * as Sentry from '@sentry/react-router';

export function init() {
  if (import.meta.env.SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.SENTRY_DSN,
      enabled: import.meta.env.PROD,
      environment: import.meta.env.MODE,
      integrations: [nodeProfilingIntegration()],
      profilesSampleRate: 1.0,
      sendDefaultPii: true,
      tracesSampleRate: 1.0,
    });
  }
}
