import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { ProfileCompletion } from './features/auth/ProfileCompletion'
import LoginPage from './pages/LoginPage'

function FeedPlaceholder() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-green-600 font-bold text-2xl">
        You're in — mbeat feed goes here.
      </h1>
    </div>
  )
}

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
                  <FeedPlaceholder />
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