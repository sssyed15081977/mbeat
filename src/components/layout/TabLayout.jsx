import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

// Wraps the tab pages (Prayer Times, Feed). Deeper pages use a BackButton
// instead and don't show the nav. The bottom padding keeps the last item on
// a page clear of the fixed nav.
export function TabLayout() {
  return (
    <div className="pb-[calc(4rem+env(safe-area-inset-bottom))]">
      <Outlet />
      <BottomNav />
    </div>
  )
}
