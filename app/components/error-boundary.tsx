import * as Sentry from '@sentry/react-router';
import { isRouteErrorResponse } from 'react-router';

export function GeneralErrorBoundary({ error }: { error?: unknown }) {
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
