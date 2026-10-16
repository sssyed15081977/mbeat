import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// "#volunteer" on the masjid page. It marks whichever volunteer block the
// viewer sees: the offer for non-volunteers, the request list for volunteers.
// The Prayer Times tab, the invite link and "requests waiting →" all link here.
export const VOLUNTEER_ANCHOR = 'volunteer'

// React Router doesn't scroll to hashes, and these blocks appear only after
// their data loads, so scroll once the block is on the page (AC15).
export function useScrollToVolunteerAnchor(visible) {
  const location = useLocation()

  useEffect(() => {
    if (visible && location.hash === `#${VOLUNTEER_ANCHOR}`) {
      document.getElementById(VOLUNTEER_ANCHOR)?.scrollIntoView({ block: 'center' })
    }
  }, [visible, location.hash])
}
