/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly SENTRY_DSN: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
