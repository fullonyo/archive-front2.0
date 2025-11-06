import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../locales';

export const useTranslation = () => {
  const { language, changeLanguage } = useLanguage();

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // Se a chave não existir, retorna a própria chave
        console.warn(`Translation key not found: ${key} for language ${language}`);
        return key;
      }
    }

    return value || key;
  };

  return { t, language, changeLanguage };
};
