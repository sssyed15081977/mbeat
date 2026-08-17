import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import i18n from '../../lib/i18n'
import { AuthContext } from './AuthContextObject'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

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
      supabase.from('profiles').update({ preferred_language: language }).eq('id', session.user.id)
    }

    i18n.on('languageChanged', handleLanguageChanged)
    return () => i18n.off('languageChanged', handleLanguageChanged)
  }, [session])

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signInWithGoogle: () => supabase.auth.signInWithOAuth({ provider: 'google' }),
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
