import type { RouteConfig } from '@react-router/dev/routes';
import { index, prefix, route } from '@react-router/dev/routes';

export default [
  ...prefix(':lang?', [index('routes/home.tsx')]),
  route('robots.txt', 'routes/robots.txt.ts'),
  route('sitemap.xml', 'routes/sitemap.xml.ts'),
  // route('locales/:locale/translation.json', 'routes/locales.$locale.translation.tsx'),
  route('*', 'routes/$.tsx'),
] satisfies RouteConfig;
