import { PassThrough } from 'node:stream';
import { styleText } from 'node:util';

import { createReadableStreamFromReadable } from '@react-router/node';
import * as Sentry from '@sentry/react-router';
import { isbot } from 'isbot';
import type { RenderToPipeableStreamOptions } from 'react-dom/server';
import { renderToPipeableStream } from 'react-dom/server';
import type {
  ActionFunctionArgs,
  AppLoadContext,
  EntryContext,
  LoaderFunctionArgs,
} from 'react-router';
import { ServerRouter } from 'react-router';

import { init } from './env.server';

init();

export const streamTimeout = 5000;

function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: AppLoadContext,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const userAgent = request.headers.get('user-agent');

    const readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode ? 'onAllReady' : 'onShellReady';

    loadContext.timing.startTime('render');

    const { abort, pipe } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        onError(error: unknown) {
          responseStatusCode = 500;

          if (shellRendered) {
            console.error(error);
          }
        },
        onShellError(error: unknown) {
          reject(error);
        },
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set('Content-Type', 'text/html');
          loadContext.timing.endTime('render');

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(import.meta.env.SENTRY_DSN ? Sentry.getMetaTagTransformer(body) : body);
        },
      },
    );

    setTimeout(abort, streamTimeout + 1000);
  });
}
export default import.meta.env.SENTRY_DSN
  ? Sentry.wrapSentryHandleRequest(handleRequest)
  : handleRequest;

export function handleError(
  error: unknown,
  { request }: LoaderFunctionArgs | ActionFunctionArgs,
): void {
  if (request.signal.aborted) {
    return;
  }

  if (error instanceof Error) {
    console.error(styleText('red', String(error.stack)));
  } else {
    console.error(error);
  }

  if (import.meta.env.SENTRY_DSN) {
    Sentry.captureException(error);
  }
}
