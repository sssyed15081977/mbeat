import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { ProfileCompletion } from './features/auth/ProfileCompletion'
import LoginPage from './pages/LoginPage'
import FeedPage from './pages/FeedPage'
import NewDeathAnnouncementPage from './pages/NewDeathAnnouncementPage'
import PostDetailPage from './pages/PostDetailPage'
import IslamicGuidePage from './pages/IslamicGuidePage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/"
              element={
                <ProfileCompletion>
                  <FeedPage />
                </ProfileCompletion>
              }
            />
            <Route
              path="/post/new"
              element={
                <ProfileCompletion>
                  <NewDeathAnnouncementPage />
                </ProfileCompletion>
              }
            />
            <Route
              path="/post/:id"
              element={
                <ProfileCompletion>
                  <PostDetailPage />
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
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App