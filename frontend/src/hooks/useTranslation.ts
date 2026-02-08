import { useLanguageStore } from '@/store/languageStore';
import { translations, TranslationKey } from '@/i18n/translations';

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return { t, language };
}

