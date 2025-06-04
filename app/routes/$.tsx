import { GeneralErrorBoundary } from '~/components/error-boundary';

import type { Route } from '../+types/root';

export const loader = () => {
  throw new Response('Not found', { status: 404 });
};

export const action = () => {
  throw new Response('Not found', { status: 404 });
};

export default function NotFound() {
  return <GeneralErrorBoundary />;
}

export function ErrorBoundary(props: Route.ErrorBoundaryProps) {
  return <GeneralErrorBoundary {...props} />;
}
