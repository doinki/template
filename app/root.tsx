import './tailwind.css';

import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';

import { Progress } from './ui/progress';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
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
        <Progress />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
