import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye as EyeIcon, EyeOff as EyeOffIcon, Loader as Loader2Icon, ShieldAlert as ShieldAlertIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignIn() {
  const { signIn, session } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (session) navigate('/', { replace: true })
  }, [session, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    const { error } = await signIn(email.trim(), password)
    setLoading(false)

    if (error) {
      if (error.toLowerCase().includes('invalid login credentials')) {
        setError('Invalid email or password. Please try again.')
      } else if (error.toLowerCase().includes('email not confirmed')) {
        setError('Please verify your email address before signing in.')
      } else if (error.toLowerCase().includes('too many')) {
        setError('Too many attempts. Please wait a moment and try again.')
      } else {
        setError('Sign in failed. Please try again.')
      }
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden relative">
      {/* Ambient blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl -z-10"
           style={{ background: 'rgba(110, 231, 183, 0.18)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl -z-10"
           style={{ background: 'rgba(20, 78, 74, 0.10)' }} />

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-3xl font-bold tracking-tight"
                style={{ color: 'oklch(0.28 0.065 178)' }}>
            Foodie<span style={{ color: 'oklch(0.55 0.14 160)' }}>.</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back — sign in to your account
          </p>
        </div>

        {/* Glass card */}
        <div className="glass-card rounded-3xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                aria-invalid={!!error}
                className="bg-white/50 border-white/70 focus-visible:border-ring focus-visible:ring-ring/30 rounded-xl h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  aria-invalid={!!error}
                  className="bg-white/50 border-white/70 focus-visible:border-ring focus-visible:ring-ring/30 rounded-xl h-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <EyeOffIcon className="size-4" />
                    : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="flex items-start gap-2.5 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                <ShieldAlertIcon className="size-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-semibold shadow-md"
              style={{ background: 'oklch(0.28 0.065 178)', color: 'white' }}
            >
              {loading
                ? <><Loader2Icon className="size-4 animate-spin" /> Signing in…</>
                : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white/70 backdrop-blur-sm px-3 text-xs text-muted-foreground uppercase tracking-widest">
                or
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary hover:underline underline-offset-4">
              Create one
            </Link>
          </p>
        </div>

        {/* Security note */}
        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          Protected by end-to-end encryption & secure session management
        </p>
      </div>
    </div>
  )
}
