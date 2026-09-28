import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../components/ui/LanguageToggle'

// The app's landing page (AC23). Open to guests (AC24). The masjid list comes
// in T8.
export default function PrayerTimesPage() {
  const { t } = useTranslation()

  return (
    <div className="p-4 max-w-sm mx-auto">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-brand">{t('prayerTimes.heading')}</h1>
        <LanguageToggle />
      </div>
    </div>
  )
}
