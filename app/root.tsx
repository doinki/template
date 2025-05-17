import './tailwind.css';

import * as Sentry from '@sentry/react-router';
import { useTranslation } from 'react-i18next';
import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import type { Route } from './+types/root';
import { LanguageUpdater } from './components/language-updater';
import { defaultLanguage, supportedLanguages } from './locales';
import { Progress } from './ui/progress';

export function loader({ params, request }: Route.LoaderArgs) {
  let lang = params.lang as (typeof supportedLanguages)[number];

  if (params.lang === defaultLanguage) {
    return redirect(request.url.replace('/' + defaultLanguage, ''));
  }

  if (!lang) {
    lang = defaultLanguage;
  }

  if (!supportedLanguages.includes(lang)) {
    throw new Response(null, { status: 404 });
  }

  return data(
    { lang },
    {
      headers: {
        Link: `</locales/${lang}.json>; rel=preload; as=fetch; crossorigin=anonymous`,
      },
    },
  );
}

export const headers: Route.HeadersFunction = ({ loaderHeaders }) => ({
  Link: loaderHeaders.get('Link') || '',
});

export function Layout({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  return (
    <html dir={i18n.dir(i18n.language)} lang={i18n.language}>
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LanguageUpdater />
        <Progress />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404 ? 'The requested page could not be found.' : error.statusText || details;
  } else if (error && error instanceof Error) {
    if (import.meta.env.SENTRY_DSN) {
      Sentry.captureException(error);
    }

    if (import.meta.env.DEV) {
      details = error.message;
      stack = error.stack;
    }
  }

  return (
    <main>
      <h1>{message}</h1>
      <p>{details}</p>
      {!!stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
