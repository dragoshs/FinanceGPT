import React from 'react';

interface Language {
  code: string;
  name: string;
}

interface LanguageSwitcherProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  languages: Language[];
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLanguage, onLanguageChange, languages }) => {
  return (
    <div className="flex items-center">
      <label htmlFor="language-select" className="sr-only">Select Language</label>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 dark:text-slate-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m0 14V5m0 14c-2.083 0-4-1.492-4-3.333V5m12 14c0-1.841-1.917-3.333-4-3.333-2.083 0-4 1.492-4 3.333V19m12-2.333V5m-4 14v-2.333" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <select
        id="language-select"
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="block w-full pl-2 pr-8 py-2 text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-md bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 shadow-sm transition"
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
