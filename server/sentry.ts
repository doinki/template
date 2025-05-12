import { nodeProfilingIntegration } from '@sentry/profiling-node';
import * as Sentry from '@sentry/react-router';

Sentry.init({
  dsn: import.meta.env.SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [nodeProfilingIntegration()],
  profilesSampleRate: 1.0,
  sendDefaultPii: true,
  tracesSampleRate: 1.0,
});
