export async function init() {
  if (import.meta.env.DEV) {
    await import('./sourcemap');
  }

  if (import.meta.env.PROD && import.meta.env.SENTRY_DSN) {
    await import('./sentry');
  }
}
