import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check as CheckIcon, Eye as EyeIcon, EyeOff as EyeOffIcon, Loader as Loader2Icon, ShieldAlert as ShieldAlertIcon, Bone as XIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/* ── Password strength helpers ────────────────────────── */
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { score, label: 'Weak', color: 'bg-destructive' }
  if (score <= 2) return { score, label: 'Fair', color: 'bg-amber-500' }
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-400' }
  if (score <= 4) return { score, label: 'Strong', color: 'bg-emerald-500' }
  return { score, label: 'Excellent', color: 'bg-emerald-600' }
}

function Rule({ met, label }: { met: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1 text-xs transition-colors ${met ? 'text-emerald-700' : 'text-muted-foreground'}`}>
      {met
        ? <CheckIcon className="size-3 text-emerald-600 shrink-0" />
        : <XIcon className="size-3 text-muted-foreground/50 shrink-0" />}
      {label}
    </span>
  )
}

/* ── Component ──────────────────────────────────────────── */
export default function SignUp() {
  const { signUp, session } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (session) navigate('/', { replace: true })
  }, [session, navigate])

  const strength = getPasswordStrength(password)
  const usernameValid = /^[a-zA-Z0-9_]{3,32}$/.test(username)
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const passwordRules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!usernameValid) {
      setError('Username must be 3–32 characters: letters, numbers, and underscores only.')
      return
    }
    if (!emailValid) {
      setError('Please enter a valid email address.')
      return
    }
    if (strength.score < 2) {
      setError('Please choose a stronger password (at least Fair strength).')
      return
    }

    setLoading(true)
    const { error } = await signUp(email.trim(), password, username.trim())
    setLoading(false)

    if (error) {
      if (error.toLowerCase().includes('already registered') || error.toLowerCase().includes('already taken')) {
        setError('An account with this email or username already exists.')
      } else if (error.toLowerCase().includes('password')) {
        setError('Password does not meet requirements. Try a stronger one.')
      } else {
        setError('Registration failed. Please try again.')
      }
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="glass-card rounded-3xl p-10 shadow-xl max-w-md w-full text-center space-y-5 animate-fade-in-up">
          <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center"
               style={{ background: 'rgba(52, 211, 153, 0.15)', border: '2px solid rgba(52, 211, 153, 0.4)' }}>
            <CheckIcon className="size-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground font-serif">Account Created!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Welcome to Foodie. Check your email to verify your account, then sign in.
          </p>
          <Link to="/signin">
            <Button className="w-full h-11 rounded-xl font-semibold mt-2"
                    style={{ background: 'oklch(0.28 0.065 178)', color: 'white' }}>
              Go to Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden relative">
      {/* Ambient blobs */}
      <div className="absolute -top-32 right-0 w-96 h-96 rounded-full blur-3xl -z-10"
           style={{ background: 'rgba(110, 231, 183, 0.15)' }} />
      <div className="absolute bottom-0 -left-16 w-80 h-80 rounded-full blur-3xl -z-10"
           style={{ background: 'rgba(20, 78, 74, 0.10)' }} />

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-3xl font-bold tracking-tight"
                style={{ color: 'oklch(0.28 0.065 178)' }}>
            Foodie<span style={{ color: 'oklch(0.55 0.14 160)' }}>.</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Join thousands enjoying clean, organic delivery
          </p>
        </div>

        {/* Glass card */}
        <div className="glass-card rounded-3xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="your_handle"
                required
                aria-invalid={username.length > 0 && !usernameValid}
                className="bg-white/50 border-white/70 focus-visible:border-ring focus-visible:ring-ring/30 rounded-xl h-11"
              />
              {username.length > 0 && !usernameValid && (
                <p className="text-xs text-destructive">3–32 chars, letters/numbers/underscores only</p>
              )}
            </div>

            {/* Email */}
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
                aria-invalid={email.length > 0 && !emailValid}
                className="bg-white/50 border-white/70 focus-visible:border-ring focus-visible:ring-ring/30 rounded-xl h-11"
              />
              {email.length > 0 && !emailValid && (
                <p className="text-xs text-destructive">Please enter a valid email address</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
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

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`strength-bar flex-1 rounded-full transition-all ${
                          i <= strength.score ? strength.color : 'bg-border'
                        }`}
                        style={{ height: '3px' }}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength.score <= 1 ? 'text-destructive' :
                    strength.score <= 2 ? 'text-amber-600' :
                    'text-emerald-700'
                  }`}>
                    {strength.label} password
                  </p>
                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    <Rule met={passwordRules.length} label="8+ characters" />
                    <Rule met={passwordRules.upper} label="Uppercase letter" />
                    <Rule met={passwordRules.number} label="Number" />
                    <Rule met={passwordRules.special} label="Special character" />
                  </div>
                </div>
              )}
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
              className="w-full h-11 rounded-xl text-sm font-semibold shadow-md mt-2"
              style={{ background: 'oklch(0.48 0.12 160)', color: 'white' }}
            >
              {loading
                ? <><Loader2Icon className="size-4 animate-spin" /> Creating account…</>
                : 'Complete Sign Up'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/signin" className="font-semibold text-primary hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          By signing up you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  )
}
