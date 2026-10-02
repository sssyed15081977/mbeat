import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import i18n from '../../lib/i18n'
import { AuthContext } from './AuthContextObject'
import { takeReturnTo } from './returnTo'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Back from Google sign-in: go to the page the user was on (AC25). The
  // path is used once, so later sessions aren't redirected again.
  useEffect(() => {
    if (!session) return
    const returnTo = takeReturnTo()
    if (returnTo) navigate(returnTo, { replace: true })
  }, [session, navigate])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Keeps the signed-in user's saved language preference in sync with
  // whatever the LanguageToggle sets, so it follows them across devices.
  // Reading the saved value back down happens in ProfileCompletion, which
  // already loads the profile row.
  useEffect(() => {
    function handleLanguageChanged(language) {
      if (!session?.user) return
      // Supabase queries are lazy — without .then() the request is never sent.
      supabase
        .from('profiles')
        .update({ preferred_language: language })
        .eq('id', session.user.id)
        .then(({ error }) => {
          if (error) console.error('Failed to save preferred_language', error)
        })
    }

    i18n.on('languageChanged', handleLanguageChanged)
    return () => i18n.off('languageChanged', handleLanguageChanged)
  }, [session])

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    // Come back to whichever address the app is running on (localhost in dev,
    // the live site in production). Supabase only allows addresses listed
    // under Auth → URL Configuration → Redirect URLs.
    signInWithGoogle: () =>
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      }),
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
