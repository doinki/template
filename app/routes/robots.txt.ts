import type { SeoHandle } from 'react-router-seo';
import { serverOnly$ } from 'vite-env-only/macros';

import { getDomainUrl } from '~/utils/get-domain-url';

import type { Route } from './+types/robots.txt';

export const handle: SeoHandle | undefined = serverOnly$({
  seo: {
    sitemap: false,
  },
});

export function loader({ request }: Route.LoaderArgs) {
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${getDomainUrl(request)}/sitemap.xml`;

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
