import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { useIsomorphicLayoutEffect } from '~/hooks/use-isomorphic-layout-effect';
import { getLanguage, supportedLanguages } from '~/locales';

export function LanguageUpdater() {
  const location = useLocation();
  const locale = getLanguage(location.pathname, {
    defaultLanguage: supportedLanguages[0],
    supportedLanguages,
  });

  const { i18n } = useTranslation();

  useIsomorphicLayoutEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [i18n, locale]);

  return null;
}
