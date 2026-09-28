// Where to send the user after they sign in (AC25). Google sign-in leaves the
// app and reloads it, so router state doesn't survive the trip; the path is
// kept in sessionStorage (same tab only) and used once by AuthProvider.
const KEY = 'mbeat.returnTo'

export function rememberReturnTo(path) {
  try {
    sessionStorage.setItem(KEY, path)
  } catch {
    // Storage blocked: the user just lands on the default page instead.
  }
}

export function peekReturnTo() {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function takeReturnTo() {
  const path = peekReturnTo()
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // Nothing to clean up.
  }
  return path
}
