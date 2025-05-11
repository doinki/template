export async function init() {
  if (import.meta.env.PROD) {
    await import('./init.production').then((m) => {
      m.init();
    });
  } else {
    await import('./init.development').then((m) => {
      m.init();
    });
  }
}
