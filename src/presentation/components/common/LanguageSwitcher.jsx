import { Languages } from 'lucide-react';
import { useTranslation } from '../../../i18n/I18nContext';

export default function LanguageSwitcher({ className = '' }) {
  const { language, setLanguage, availableLanguages } = useTranslation();

  return (
    <div
      role="group"
      aria-label="Sélection de la langue"
      className={`inline-flex items-center gap-1 p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl text-xs font-semibold select-none ${className}`}
    >
      <Languages size={14} className="text-slate-400 ml-1 mr-0.5 shrink-0" aria-hidden="true" />
      {availableLanguages.map((lang) => {
        const isActive = language === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            aria-pressed={isActive}
            aria-label={`Changer la langue en ${lang.label}`}
            className={`px-2 py-1 rounded-lg transition-all duration-150 cursor-pointer text-[11px] font-bold ${
              isActive
                ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {lang.flag}
          </button>
        );
      })}
    </div>
  );
}
