export const defaultLanguage = 'ko';

export const supportedLanguages = [defaultLanguage, 'en'] as const;

export function getLanguage<T extends readonly string[] = string[]>(
  path: string,
  options: {
    defaultLanguage: T[number];
    supportedLanguages: T;
  },
): T[number] {
  const locale = path.split('/')[1] as T[number];

  return options.supportedLanguages.includes(locale) ? locale : options.defaultLanguage;
}
