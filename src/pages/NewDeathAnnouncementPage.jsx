import { useNavigate } from 'react-router-dom'
import { DeathAnnouncementForm } from '../features/deathAnnouncement/DeathAnnouncementForm'

export default function NewDeathAnnouncementPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <DeathAnnouncementForm onSuccess={() => navigate('/')} />
    </div>
  )
}
