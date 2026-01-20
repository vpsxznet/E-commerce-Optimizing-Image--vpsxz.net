import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Globe, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage }) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-black text-white p-1.5 rounded-lg">
             <ShoppingBag size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight hidden sm:block">
              {t.title}
            </h1>
            <h1 className="text-lg font-bold text-slate-900 leading-tight sm:hidden">
              TikTok Shop Optimizer
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">{t.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                language === 'en'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('zh')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                language === 'zh'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              中文
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
