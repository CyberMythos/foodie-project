import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export type UserRole = 'user' | 'moderator' | 'admin'

export interface Profile {
  id: string
  username: string
  role: UserRole
  failed_attempts: number
  is_locked: boolean
  last_login: string | null
  created_at: string
}
