import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft as ArrowLeftIcon, Loader as Loader2Icon, Shield as ShieldIcon, Users as UsersIcon, Clock as ClockIcon, RefreshCw as RefreshCwIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface AuthEvent {
  id: number
  user_id: string | null
  event_type: string
  ip_address: string | null
  created_at: string
}

export default function Admin() {
  const { profile: currentProfile } = useAuth()
  const [users, setUsers] = React.useState<Profile[]>([])
  const [events, setEvents] = React.useState<AuthEvent[]>([])
  const [loadingUsers, setLoadingUsers] = React.useState(true)
  const [loadingEvents, setLoadingEvents] = React.useState(true)

  const fetchUsers = React.useCallback(async () => {
    setLoadingUsers(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setUsers(data ?? [])
    setLoadingUsers(false)
  }, [])

  const fetchEvents = React.useCallback(async () => {
    setLoadingEvents(true)
    const { data } = await supabase
      .from('auth_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setEvents(data ?? [])
    setLoadingEvents(false)
  }, [])

  React.useEffect(() => {
    fetchUsers()
    fetchEvents()
  }, [fetchUsers, fetchEvents])

  const roleBadgeStyle = (role: string) => {
    if (role === 'admin') return { background: 'oklch(0.28 0.065 178)', color: 'white', border: 'none' }
    if (role === 'moderator') return { background: 'oklch(0.78 0.18 60)', color: 'white', border: 'none' }
    return {}
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="icon" className="rounded-xl size-9">
              <ArrowLeftIcon className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <ShieldIcon className="size-5" style={{ color: 'oklch(0.28 0.065 178)' }} />
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Admin Panel</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Logged in as <span className="font-semibold">{currentProfile?.username}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} className="rounded-xl gap-1.5">
            <RefreshCwIcon className="size-3.5" /> Refresh Users
          </Button>
          <Button variant="outline" size="sm" onClick={fetchEvents} className="rounded-xl gap-1.5">
            <RefreshCwIcon className="size-3.5" /> Refresh Events
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: UsersIcon },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: ShieldIcon },
          { label: 'Locked Accounts', value: users.filter(u => u.is_locked).length, icon: ShieldIcon },
          { label: 'Auth Events', value: events.length, icon: ClockIcon },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="glass-card border-border/60 rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5 text-xs">
                <Icon className="size-3.5" /> {label}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-3xl font-bold font-serif"
                 style={{ color: 'oklch(0.28 0.065 178)' }}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card className="glass-card border-border/60 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UsersIcon className="size-4" /> User Management
          </CardTitle>
          <CardDescription>All registered users and their roles</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loadingUsers ? (
            <div className="flex items-center justify-center p-12">
              <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Failed Attempts</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <Badge className="capitalize text-xs" style={roleBadgeStyle(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.is_locked ? (
                        <Badge variant="destructive" className="text-xs">Locked</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-300">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.failed_attempts}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleString()
                        : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Auth Events */}
      <Card className="glass-card border-border/60 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClockIcon className="size-4" /> Recent Auth Events
          </CardTitle>
          <CardDescription>Security log — authentication activity</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loadingEvents ? (
            <div className="flex items-center justify-center p-12">
              <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No events logged yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map(ev => (
                  <TableRow key={ev.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-xs capitalize"
                        style={ev.event_type.includes('fail') || ev.event_type.includes('lock')
                          ? { color: 'oklch(0.577 0.245 27.325)', borderColor: 'oklch(0.577 0.245 27.325 / 50%)' }
                          : ev.event_type.includes('success') || ev.event_type.includes('sign')
                          ? { color: 'oklch(0.48 0.12 160)', borderColor: 'oklch(0.48 0.12 160 / 50%)' }
                          : {}}>
                        {ev.event_type.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-mono">
                      {ev.ip_address ?? '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(ev.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
