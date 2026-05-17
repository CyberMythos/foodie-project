import * as React from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, type Profile } from '@/lib/supabase'

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null)
  const [user, setUser] = React.useState<User | null>(null)
  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [loading, setLoading] = React.useState(true)

  const fetchProfile = React.useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    setProfile(data ?? null)
  }, [])

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        ;(async () => {
          await fetchProfile(session.user.id)
        })()
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signIn = React.useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }, [])

  const signUp = React.useCallback(async (email: string, password: string, username: string) => {
    const trimmedUsername = username.trim()
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(trimmedUsername)) {
      return { error: 'Username must be 3–32 chars: letters, numbers, underscores only.' }
    }

    // Check username uniqueness before registering
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', trimmedUsername)
      .maybeSingle()

    if (existing) return { error: 'Username is already taken.' }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: trimmedUsername },
      },
    })

    if (error) return { error: error.message }
    return { error: null }
  }, [])

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
