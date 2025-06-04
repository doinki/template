import { useTranslation } from 'react-i18next';
import { Links, Meta, Outlet, redirect, Scripts, ScrollRestoration } from 'react-router';

import type { Route } from './+types/root';
import { GeneralErrorBoundary } from './components/error-boundary';
import { LanguageUpdater } from './components/language-updater';
import { defaultLanguage, supportedLanguages } from './locales';
import tailwindcss from './tailwind.css?url';
import { Progress } from './ui/progress';

export const links: Route.LinksFunction = () => {
  return [{ href: tailwindcss, rel: 'stylesheet' }];
};

export const shouldRevalidate = () => {
  return false;
};

export const loader = ({ params, request }: Route.LoaderArgs) => {
  let lang = params.lang as (typeof supportedLanguages)[number];

  if (params.lang === defaultLanguage) {
    const url = new URL(request.url);
    url.pathname = url.pathname.replace(`/${defaultLanguage}`, '');

    return redirect(url.href);
  }

  if (!lang) {
    lang = defaultLanguage;
  }

  if (!supportedLanguages.includes(lang)) {
    throw new Response(null, { status: 404 });
  }

  return { lang };
};

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
        <link
          as="fetch"
          crossOrigin="anonymous"
          href={`/locales/${i18n.language}.json`}
          rel="preload"
        />
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

export function ErrorBoundary(props: Route.ErrorBoundaryProps) {
  return <GeneralErrorBoundary {...props} />;
}
