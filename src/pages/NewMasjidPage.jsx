import { useNavigate } from 'react-router-dom'
import { AddMasjidForm } from '../features/prayerTimes/AddMasjidForm'
import { BackButton } from '../components/ui/BackButton'

export default function NewMasjidPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen p-4 max-w-sm mx-auto space-y-4">
      <BackButton to="/" />
      <AddMasjidForm onDone={() => navigate('/')} />
    </div>
  )
}
