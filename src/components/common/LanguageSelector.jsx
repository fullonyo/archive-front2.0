import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { availableLanguages } from '../../locales';

const LanguageSelector = () => {
  const { language, changeLanguage } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const currentLanguage = availableLanguages.find(lang => lang.code === language);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setShowMenu(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2.5 hover:bg-surface-float2 rounded-lg transition-colors"
        title={currentLanguage?.name}
      >
        <Globe size={18} />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-surface-float border border-white/10 rounded-xl shadow-xl overflow-hidden animate-slide-down">
          <div className="px-3 py-2 border-b border-white/5">
            <p className="text-xs font-semibold text-text-tertiary">Language / Idioma</p>
          </div>
          <div className="py-1">
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`
                  w-full px-4 py-2 text-sm text-left hover:bg-surface-float2 flex items-center gap-3 transition-colors
                  ${language === lang.code ? 'bg-theme-active/10 text-theme-active' : ''}
                `}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
