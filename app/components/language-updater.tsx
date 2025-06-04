import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { getLanguage } from '~/locales';

export function LanguageUpdater() {
  const location = useLocation();
  const locale = getLanguage(location.pathname);

  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [i18n, locale]);

  return null;
}
