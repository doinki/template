import * as Sentry from '@sentry/react-router';
import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { HydratedRouter } from 'react-router/dom';

import { defaultLanguage, getLanguage, supportedLanguages } from './locales';

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

i18next
  .use(Backend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locales/{{lng}}.json',
    },
    initAsync: false,
    interpolation: {
      escapeValue: false,
    },
    lng: getLanguage(window.location.pathname, {
      defaultLanguage,
      supportedLanguages,
    }),
    react: {
      useSuspense: false,
    },
    supportedLngs: supportedLanguages,
  })
  .then(() => {
    startTransition(() => {
      hydrateRoot(
        document,
        <StrictMode>
          <I18nextProvider i18n={i18next}>
            <HydratedRouter />
          </I18nextProvider>
        </StrictMode>,
      );
    });
  });
