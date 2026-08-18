import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BackButton } from '../components/ui/BackButton'
import { ContentGuideDetail } from '../features/islamicContent/ContentGuideDetail'
import { islamicGuides } from '../features/islamicContent/guides'

export default function IslamicGuidePage() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const guide = islamicGuides[slug]

  return (
    <div className="min-h-screen p-4 max-w-sm mx-auto space-y-4">
      <BackButton to="/" />

      {guide ? (
        <ContentGuideDetail guide={guide} />
      ) : (
        <p className="text-gray-500 text-center mt-8">{t('islamicGuide.notFound')}</p>
      )}
    </div>
  )
}
