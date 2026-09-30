import { useTranslation } from 'react-i18next'

function localized(field, lang) {
  if (!field) return null
  return field[lang] || field.en
}

function StepBlock({ step, lang }) {
  return (
    <div className="border border-gray-100 rounded-lg p-3 space-y-2">
      <p className="font-medium text-sm">{localized(step.label, lang)}</p>

      {step.arabic && (
        <p dir="rtl" lang="ar" className="text-xl leading-loose text-right">
          {step.arabic}
        </p>
      )}

      {step.transliteration && (
        <p className="text-xs text-gray-500 italic">{localized(step.transliteration, lang)}</p>
      )}

      {step.meaning && <p className="text-sm text-gray-700">{localized(step.meaning, lang)}</p>}

      {step.note && (
        <p className="text-xs text-amber-800 bg-amber-50 rounded px-2 py-1.5">
          {localized(step.note, lang)}
        </p>
      )}
    </div>
  )
}

export function ContentGuideDetail({ guide }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ta' ? 'ta' : 'en'

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">{localized(guide.title, lang)}</h1>
        {guide.intro && <p className="text-sm text-gray-600 mt-1">{localized(guide.intro, lang)}</p>}
      </div>

      {guide.reviewStatus === 'pending_review' && (
        <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">
          {t('islamicGuide.pendingReviewBanner')}
        </div>
      )}

      <div className="space-y-5">
        {guide.sections.map((section) => (
          <section key={localized(section.heading, 'en')} className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {localized(section.heading, lang)}
            </h2>
            <div className="space-y-2">
              {section.steps.map((step) => (
                <StepBlock key={localized(step.label, 'en')} step={step} lang={lang} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
