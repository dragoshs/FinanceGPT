import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Define the shape of the context
interface I18nContextType {
  languageCode: string;
  setLanguageCode: (code: string) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

// Create the context with a default value
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Define the provider component
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialLanguage = (): string => {
    const savedLang = localStorage.getItem('language');
    if (savedLang) return savedLang;
    // Get browser language if available
    const browserLang = navigator.language.split('-')[0];
    // Check if browser language is supported, otherwise default to 'en'
    const supportedCodes = ['en', 'zh', 'hi', 'es', 'fr', 'ar', 'bn', 'ru', 'pt', 'de', 'ro'];
    return supportedCodes.includes(browserLang) ? browserLang : 'en';
  };
  
  const [languageCode, setLanguageCode] = useState<string>(getInitialLanguage());
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await fetch(`/locales/${languageCode}.json`);
        if (!response.ok) {
            console.error(`Could not load locale file: ${languageCode}.json. Falling back to English.`);
            const fallbackResponse = await fetch(`/locales/en.json`);
            const fallbackData = await fallbackResponse.json();
            setTranslations(fallbackData);
            return;
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error('Error fetching translations:', error);
      }
    };
    fetchTranslations();
    localStorage.setItem('language', languageCode);
  }, [languageCode]);

  const t = useCallback((key: string, replacements?: { [key: string]: string | number }): string => {
    let translation = translations[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        translation = translation.replace(`{${placeholder}}`, String(value));
      });
    }
    return translation;
  }, [translations]);

  const value = { languageCode, setLanguageCode, t };

  // FIX: Replaced JSX syntax with React.createElement to be valid in a .ts file, resolving parsing errors.
  return React.createElement(I18nContext.Provider, { value }, children);
};

// Create a custom hook for easy access to the context
export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
