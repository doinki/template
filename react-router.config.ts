import type { Config } from '@react-router/dev/config';
import { sentryOnBuildEnd } from '@sentry/react-router';

export default {
  buildEnd: async ({ buildManifest, reactRouterConfig, viteConfig }) => {
    if (process.env.NODE_ENV === 'production' && !!process.env.SENTRY_AUTH_TOKEN) {
      await sentryOnBuildEnd({ buildManifest, reactRouterConfig, viteConfig });
    }
  },
  future: {
    unstable_optimizeDeps: true,
  },
  ssr: true,
} satisfies Config;
