import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { ProfileCompletion } from './features/auth/ProfileCompletion'
import { TabLayout } from './components/layout/TabLayout'
import LoginPage from './pages/LoginPage'
import PrayerTimesPage from './pages/PrayerTimesPage'
import FeedPage from './pages/FeedPage'
import NewDeathAnnouncementPage from './pages/NewDeathAnnouncementPage'
import PostDetailPage from './pages/PostDetailPage'
import EditPostPage from './pages/EditPostPage'
import IslamicGuidePage from './pages/IslamicGuidePage'
import NewMasjidPage from './pages/NewMasjidPage'
import MasjidDetailPage from './pages/MasjidDetailPage'
import UpdateMasjidTimesPage from './pages/UpdateMasjidTimesPage'
import NewMasjidNoticePage from './pages/NewMasjidNoticePage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/prayer-times" element={<Navigate to="/" replace />} />

          {/* Tab pages: shown with the bottom nav. */}
          <Route element={<TabLayout />}>
            {/* Open to guests (AC24). */}
            <Route path="/" element={<PrayerTimesPage />} />
            <Route element={<ProtectedRoute />}>
              <Route
                path="/feed"
                element={
                  <ProfileCompletion>
                    <FeedPage />
                  </ProfileCompletion>
                }
              />
            </Route>
          </Route>

          {/* Open to guests (AC24). /masjid/new below still wins: React
              Router prefers the exact path over :id. */}
          <Route path="/masjid/:id" element={<MasjidDetailPage />} />

          {/* Open to guests, so shared WhatsApp links work without sign-in
              (masjid-notices.md AC15). /post/new below still wins over :id. */}
          <Route path="/post/:id" element={<PostDetailPage />} />

          <Route element={<ProtectedRoute />}>
            <Route
              path="/post/new"
              element={
                <ProfileCompletion>
                  <NewDeathAnnouncementPage />
                </ProfileCompletion>
              }
            />
            <Route
              path="/post/:id/edit"
              element={
                <ProfileCompletion>
                  <EditPostPage />
                </ProfileCompletion>
              }
            />
            <Route
              path="/guide/:slug"
              element={
                <ProfileCompletion>
                  <IslamicGuidePage />
                </ProfileCompletion>
              }
            />
            <Route
              path="/masjid/new"
              element={
                <ProfileCompletion>
                  <NewMasjidPage />
                </ProfileCompletion>
              }
            />
            <Route
              path="/masjid/:id/update"
              element={
                <ProfileCompletion>
                  <UpdateMasjidTimesPage />
                </ProfileCompletion>
              }
            />
            <Route
              path="/masjid/:id/notice/new"
              element={
                <ProfileCompletion>
                  <NewMasjidNoticePage />
                </ProfileCompletion>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App