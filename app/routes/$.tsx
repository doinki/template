export function loader() {
  throw new Response('Not found', { status: 404 });
}

export function action() {
  throw new Response('Not found', { status: 404 });
}

export default function NotFound() {
  return <ErrorBoundary />;
}

export function ErrorBoundary() {
  return <h1>404</h1>;
}
