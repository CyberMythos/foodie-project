import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/lib/supabase'

interface Props {
  children: React.ReactNode
  requiredRole?: UserRole
}

export function ProtectedRoute({ children, requiredRole }: Props) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    )
  }

  if (!session) return <Navigate to="/signin" replace />

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
