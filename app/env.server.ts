import { z } from 'zod';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

const schema = z.object({});

export function init() {
  const result = schema.safeParse(process.env);

  if (!result.success) {
    throw new Error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
  }
}
