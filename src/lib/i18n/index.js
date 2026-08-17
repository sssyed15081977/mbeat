import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ta from './locales/ta.json'

export const LANGUAGE_STORAGE_KEY = 'mbeat_language'
export const SUPPORTED_LANGUAGES = ['en', 'ta']
export const DEFAULT_LANGUAGE = 'en'

function getStoredLanguage() {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  return SUPPORTED_LANGUAGES.includes(stored) ? stored : DEFAULT_LANGUAGE
}

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ta: { translation: ta },
  },
  lng: getStoredLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
})

export function setLanguage(language) {
  if (!SUPPORTED_LANGUAGES.includes(language)) return
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  i18next.changeLanguage(language)
}

export default i18next
