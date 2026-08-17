import { useTranslation } from 'react-i18next'
import { setLanguage } from '../../lib/i18n'

const LANGUAGES = [
  { code: 'en', labelKey: 'languageToggle.english' },
  { code: 'ta', labelKey: 'languageToggle.tamil' },
]

export function LanguageToggle() {
  const { t, i18n } = useTranslation()

  return (
    <div className="flex border rounded overflow-hidden shrink-0">
      {LANGUAGES.map(({ code, labelKey }, index) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          className={`px-3 py-2 text-sm font-medium ${index > 0 ? 'border-l' : ''} ${
            i18n.language === code ? 'bg-brand text-white' : 'hover:bg-gray-50'
          }`}
        >
          {t(labelKey)}
        </button>
      ))}
    </div>
  )
}
