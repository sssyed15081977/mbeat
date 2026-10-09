import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BackButton } from '../components/ui/BackButton'
import { Skeleton } from '../components/ui/Skeleton'
import { useMasjid } from '../features/prayerTimes/useMasjid'
import { MasjidNoticeForm } from '../features/masjidNotice/MasjidNoticeForm'

// Add notice (spec masjid-notices.md 4.3). Signed-in only (the route is
// protected). The form is shown to the masjid's volunteers; anyone else gets
// a plain message, and create_masjid_notice rejects them anyway (AC4).
export default function NewMasjidNoticePage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { masjid, loading, error, refetch, isVolunteer, volunteerLoading } = useMasjid(id)

  const detailPath = `/masjid/${id}`

  return (
    <div className="min-h-screen p-4 max-w-sm mx-auto space-y-4">
      <BackButton to={detailPath} />

      {(loading || volunteerLoading) && (
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {!loading && error && (
        <div className="mt-8 text-center space-y-3" role="alert">
          <p className="text-red-600">
            {navigator.onLine ? t('prayerTimes.loadError') : t('prayerTimes.offline')}
          </p>
          <button
            type="button"
            onClick={refetch}
            className="border rounded px-4 py-2 font-medium hover:bg-gray-50"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {!loading && !error && !masjid && (
        <div className="mt-8 text-center space-y-3">
          <p className="text-gray-500">{t('masjidDetail.notAvailable')}</p>
          <Link to="/" className="inline-block text-brand font-medium">
            {t('masjidDetail.backToList')}
          </Link>
        </div>
      )}

      {!loading && !volunteerLoading && !error && masjid && !isVolunteer && (
        <div className="mt-8 text-center space-y-3">
          <p className="text-gray-700">{t('masjidNotice.noPermission')}</p>
          <Link to={detailPath} className="inline-block text-brand font-medium">
            {masjid.name}
          </Link>
        </div>
      )}

      {!loading && !volunteerLoading && !error && masjid && isVolunteer && (
        <MasjidNoticeForm
          masjid={masjid}
          // Back to the masjid page, scrolled to its notices (AC5).
          onSuccess={() => navigate(`${detailPath}#notices`, { replace: true })}
        />
      )}
    </div>
  )
}
