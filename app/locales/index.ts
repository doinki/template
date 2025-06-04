export const defaultLanguage = 'ko';

export const supportedLanguages = [defaultLanguage, 'en'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export function getLanguage(path: string): SupportedLanguage {
  const locale = path.split('/')[1] as SupportedLanguage;

  return supportedLanguages.includes(locale) ? locale : defaultLanguage;
}
