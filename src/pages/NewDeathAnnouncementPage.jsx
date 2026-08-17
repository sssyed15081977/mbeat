import { useNavigate } from 'react-router-dom'
import { DeathAnnouncementForm } from '../features/deathAnnouncement/DeathAnnouncementForm'
import { BackButton } from '../components/ui/BackButton'

export default function NewDeathAnnouncementPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen p-4 max-w-sm mx-auto space-y-4">
      <BackButton to="/" />
      <DeathAnnouncementForm onSuccess={() => navigate('/')} />
    </div>
  )
}
