import * as React from 'react'
import { Link } from 'react-router-dom'
import { Award as AwardIcon, BaggageClaim as BaggageClaimIcon, Globe as GlobeIcon, Camera as CameraIcon, Send as SendIcon, Minus as MinusIcon, Plus as PlusIcon, ShoppingBag as ShoppingBagIcon, Smartphone as SmartphoneIcon, Star as StarIcon, Truck as TruckIcon, Bone as XIcon, Zap as ZapIcon, LogOut as LogOutIcon, Shield as ShieldIcon, User as UserIcon, Menu as MenuIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'

/* ── Types ────────────────────────────────────────────── */
interface CartItem {
  name: string
  price: number
  imgUrl: string
  quantity: number
}

type MenuFilter = 'all' | 'burger' | 'pizza' | 'pasta'

/* ── Menu data ────────────────────────────────────────── */
const MENU_ITEMS = [
  {
    id: 1,
    name: 'Double Beef Burger',
    price: 9.67,
    category: 'burger' as const,
    badge: 'Best Seller',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 2,
    name: 'Veggie Pizza',
    price: 10.99,
    category: 'pizza' as const,
    badge: null,
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 3,
    name: 'Fried Chicken',
    price: 13.45,
    category: 'pasta' as const,
    badge: null,
    img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 4,
    name: 'Sub Sandwich',
    price: 6.99,
    category: 'burger' as const,
    badge: null,
    img: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 5,
    name: 'Chicken Lasagna',
    price: 16.45,
    category: 'pasta' as const,
    badge: 'Organic',
    img: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 6,
    name: 'Italian Spaghetti',
    price: 7.65,
    category: 'pasta' as const,
    badge: null,
    img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600',
  },
] as const

/* ── Component ────────────────────────────────────────── */
export default function Home() {
  const { profile, signOut } = useAuth()
  const [cartOpen, setCartOpen] = React.useState(false)
  const [cart, setCart] = React.useState<CartItem[]>([])
  const [filter, setFilter] = React.useState<MenuFilter>('all')
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  const addToCart = (item: typeof MENU_ITEMS[number]) => {
    setCart(prev => {
      const existing = prev.find(c => c.name === item.name)
      if (existing) return prev.map(c => c.name === item.name ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { name: item.name, price: item.price, imgUrl: item.img, quantity: 1 }]
    })
  }

  const changeQty = (name: string, delta: number) => {
    setCart(prev =>
      prev
        .map(c => c.name === name ? { ...c, quantity: c.quantity + delta } : c)
        .filter(c => c.quantity > 0)
    )
  }

  const filtered = MENU_ITEMS.filter(i => filter === 'all' || i.category === filter)

  const initials = profile?.username
    ? profile.username.slice(0, 2).toUpperCase()
    : 'FD'

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── Navbar ─────────────────────────────────────── */}
      <nav className="glass-nav sticky top-0 z-50 px-6 md:px-12 py-4 flex items-center justify-between">
        <a href="#hero" className="text-2xl font-bold tracking-tight"
           style={{ color: 'oklch(0.22 0.055 178)' }}>
          Foodie<span style={{ color: 'oklch(0.55 0.14 160)' }}>.</span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7 font-medium text-muted-foreground">
          {[
            ['Home', '#hero'],
            ['Menu', '#menu'],
            ['Services', '#services'],
            ['Reviews', '#reviews'],
          ].map(([label, href]) => (
            <a key={label} href={href}
               className="hover:text-foreground transition-colors text-sm">
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Cart button */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2.5 bg-white/80 rounded-full shadow-sm border border-white/70 hover:scale-105 transition-all"
            aria-label="Open cart"
          >
            <ShoppingBagIcon className="size-5" style={{ color: 'oklch(0.28 0.065 178)' }} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 size-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white shadow"
                    style={{ background: 'oklch(0.48 0.12 160)' }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-white/80 border border-white/70 hover:bg-white/90 transition-all shadow-sm">
                <Avatar className="size-6">
                  <AvatarFallback className="text-[10px] font-bold"
                                  style={{ background: 'oklch(0.28 0.065 178)', color: 'white' }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-xs font-semibold text-foreground max-w-24 truncate">
                  {profile?.username ?? 'User'}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-2xl">
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-foreground truncate">{profile?.username}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{profile?.role ?? 'user'}</p>
              </div>
              <DropdownMenuSeparator />
              {profile?.role === 'admin' && (
                <DropdownMenuItem asChild>
                  <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                    <ShieldIcon className="size-3.5" /> Admin Panel
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                  <UserIcon className="size-3.5" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={signOut}
                className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer">
                <LogOutIcon className="size-3.5" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(v => !v)}>
            {mobileMenuOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="glass-card absolute top-full left-0 w-full border-t border-white/50 shadow-xl p-6 flex flex-col gap-3 md:hidden">
            {[['Home', '#hero'], ['Menu', '#menu'], ['Services', '#services'], ['Reviews', '#reviews']].map(([l, h]) => (
              <a key={l} href={h} onClick={() => setMobileMenuOpen(false)}
                 className="py-2 text-sm font-medium text-foreground border-b border-border/50">
                {l}
              </a>
            ))}
            <button onClick={signOut}
                    className="mt-2 flex items-center gap-2 text-sm font-medium text-destructive">
              <LogOutIcon className="size-4" /> Sign Out
            </button>
          </div>
        )}
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section id="hero" className="relative px-6 md:px-12 py-14 md:py-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="absolute -top-12 -left-12 w-80 h-80 rounded-full blur-3xl -z-10"
             style={{ background: 'rgba(110, 231, 183, 0.20)' }} />
        <div className="absolute top-40 right-8 w-96 h-96 rounded-full blur-3xl -z-10"
             style={{ background: 'rgba(20, 78, 74, 0.08)' }} />

        <div className="lg:col-span-6 space-y-6 text-center lg:text-left animate-fade-in-up">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider glass-badge"
                style={{ color: 'oklch(0.22 0.055 178)' }}>
            🌱 Pure Eco-Minimalism Food Delivery
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight">
            Enjoy Your<br />
            <span className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, oklch(0.28 0.065 178), oklch(0.55 0.14 160))' }}>
              Delicious Food
            </span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto lg:mx-0 text-base md:text-lg font-light leading-relaxed">
            We&apos;ll fill your tummy with delicious, clean, and healthy organic food — with premium zero-emission fast delivery.
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <a href="#menu">
              <Button className="rounded-full h-12 px-7 font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
                      style={{ background: 'oklch(0.28 0.065 178)', color: 'white' }}>
                Order now
              </Button>
            </a>
            <a href="#services">
              <Button variant="outline" className="glass-card rounded-full h-12 px-7 font-semibold border-border/50 hover:-translate-y-0.5 transition-all">
                How It Works
              </Button>
            </a>
          </div>
          <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
            {[GlobeIcon, CameraIcon, SendIcon].map((Icon, i) => (
              <a key={i} href="#"
                 className="size-10 rounded-full glass-card flex items-center justify-center hover:-translate-y-1 shadow-sm transition-all"
                 style={{ color: 'oklch(0.28 0.065 178)' }}>
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 relative flex justify-center items-center animate-fade-in-up animate-fade-in-up-delay-2">
          <div className="absolute w-80 h-80 lg:w-[420px] lg:h-[420px] rounded-full -z-10"
               style={{ background: 'oklch(0.28 0.065 178 / 5%)' }} />
          <div className="relative max-w-sm sm:max-w-md w-full">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800"
              alt="Gourmet plate"
              className="w-full h-auto drop-shadow-2xl rounded-3xl object-cover"
            />
            <div className="absolute -bottom-4 -left-4 glass-card p-4 rounded-2xl shadow-xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ background: 'rgba(167, 243, 208, 0.5)' }}>
                <ZapIcon className="size-5 fill-emerald-600 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Delivery</p>
                <p className="text-sm font-bold text-foreground">Super Fast 🔥</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────── */}
      <section id="services" className="py-16 md:py-24 border-y border-border/40"
               style={{ background: 'rgba(255,255,255,0.35)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-xl mx-auto mb-14">
            <p className="text-xs uppercase font-bold tracking-widest text-emerald-700 mb-2">Our Services</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">How Does It Work?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { Icon: SmartphoneIcon, title: 'Easy To Order', desc: 'Browse our clean eating menu and set up eco-delivery with just a few swift taps.' },
              { Icon: TruckIcon, title: 'Fast Delivery', desc: 'Our electric fleet brings fresh, hot food straight to your door in record time.' },
              { Icon: AwardIcon, title: 'Best Quality', desc: 'Local chefs, organic ingredients, and chemical-free prep ensures premium taste.' },
            ].map(({ Icon, title, desc }, i) => (
              <div key={i}
                   className="glass-card p-8 rounded-3xl shadow-sm hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group">
                <div className="size-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:text-white"
                     style={{ background: 'rgba(167, 243, 208, 0.4)', color: 'oklch(0.28 0.065 178)' }}
                     onMouseEnter={e => {
                       const el = e.currentTarget
                       el.style.background = 'oklch(0.28 0.065 178)'
                       el.style.color = 'white'
                     }}
                     onMouseLeave={e => {
                       const el = e.currentTarget
                       el.style.background = 'rgba(167, 243, 208, 0.4)'
                       el.style.color = 'oklch(0.28 0.065 178)'
                     }}>
                  <Icon className="size-5" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground font-light text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Menu ─────────────────────────────────────────── */}
      <section id="menu" className="py-16 md:py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <p className="text-xs uppercase font-bold tracking-widest text-emerald-700 mb-1">Our Menu</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">The Most Popular</h2>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-full"
               style={{ background: 'rgba(0,0,0,0.06)' }}>
            {(['all', 'burger', 'pizza', 'pasta'] as MenuFilter[]).map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 capitalize ${
                  filter === cat
                    ? 'text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                style={filter === cat ? { background: 'oklch(0.28 0.065 178)' } : {}}
              >
                {cat === 'all' ? 'All Items' : cat + 's'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(item => (
            <div key={item.id}
                 className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              {item.badge && (
                <Badge className="absolute top-4 right-4 text-[10px] uppercase font-bold z-10 shadow-sm px-2.5 py-1 rounded-full"
                       style={item.badge === 'Organic'
                         ? { background: 'rgba(167, 243, 208, 0.7)', color: 'oklch(0.32 0.09 160)', border: 'none' }
                         : { background: 'oklch(0.78 0.18 60)', color: 'white', border: 'none' }}>
                  {item.badge}
                </Badge>
              )}
              <div className="w-full aspect-square flex items-center justify-center overflow-hidden rounded-2xl bg-white/40 p-4">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-contain rounded-2xl group-hover:scale-105 transition-all duration-300"
                />
              </div>
              <div className="mt-4 space-y-3">
                <h3 className="text-lg font-bold text-foreground tracking-tight">{item.name}</h3>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xl font-black font-serif" style={{ color: 'oklch(0.22 0.055 178)' }}>
                    ${item.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(item)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-all"
                    style={{ background: 'oklch(0.28 0.065 178)' }}
                  >
                    <PlusIcon className="size-3.5" /> Add Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────── */}
      <section id="reviews" className="py-16 md:py-24" style={{ background: 'rgba(0,0,0,0.025)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-xl mx-auto mb-14">
            <p className="text-xs uppercase font-bold tracking-widest text-emerald-700 mb-2">Our Reviews</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">What They Say?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                text: '"Fresh ingredients, creative menu, and warm service make this spot a hidden gem. Perfect for casual dinners or special nights out. Truly a foodie\'s paradise!"',
                name: 'Sophia Anderson',
                role: 'Verified Food Lover',
                initials: 'SA',
                bg: 'oklch(0.28 0.065 178)',
              },
              {
                text: '"Delicious dishes, cozy ambiance, and exceptional service. A must-visit for food lovers seeking bold flavors and unforgettable dining experiences."',
                name: 'Olivia Smith',
                role: 'Gourmet Specialist',
                initials: 'OS',
                bg: 'oklch(0.38 0.09 160)',
              },
            ].map(({ text, name, role, initials, bg }) => (
              <div key={name} className="glass-card p-8 rounded-3xl shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="size-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-foreground/80 font-light italic text-sm leading-relaxed">{text}</p>
                </div>
                <div className="flex items-center gap-3 pt-4 mt-6 border-t border-border/40">
                  <div className="size-10 rounded-full flex items-center justify-center text-white font-bold text-xs"
                       style={{ background: bg }}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{name}</p>
                    <p className="text-[11px] text-muted-foreground">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────────── */}
      <section className="py-16 max-w-4xl mx-auto px-6">
        <div className="glass-card rounded-3xl p-8 md:p-12 shadow-xl border border-white text-center space-y-6 relative overflow-hidden"
             style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.65), rgba(236, 253, 245, 0.55))' }}>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Newsletter</h2>
            <p className="text-muted-foreground font-light text-sm">
              Subscribe for daily updates, new menu items, and exclusive eco-friendly promos.
            </p>
          </div>
          <form
            onSubmit={e => { e.preventDefault(); alert('Subscribed! 🌱') }}
            className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 pt-2"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              required
              className="flex-1 px-5 py-3 rounded-full bg-white border border-border text-sm focus:outline-none focus:border-ring transition-all shadow-inner"
            />
            <Button type="submit" className="rounded-full px-7 font-semibold shadow-md"
                    style={{ background: 'oklch(0.28 0.065 178)', color: 'white' }}>
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer id="footer" className="pt-16 pb-8 border-t border-border/40"
              style={{ background: 'oklch(0.18 0.05 178)', color: 'oklch(0.8 0.01 200)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Foodie<span style={{ color: 'oklch(0.65 0.15 160)' }}>.</span>
            </h3>
            <p className="text-xs font-light leading-relaxed max-w-xs" style={{ color: 'oklch(0.65 0.02 200)' }}>
              We&apos;ll fill your tummy with delicious, clean, healthy food with incredibly fast, carbon-neutral delivery.
            </p>
            <div className="flex gap-3 pt-1">
              {[SendIcon, CameraIcon, GlobeIcon].map((Icon, i) => (
                <a key={i} href="#"
                   className="size-8 rounded-full flex items-center justify-center transition-colors hover:text-white"
                   style={{ background: 'oklch(0.28 0.065 178)', color: 'oklch(0.75 0.03 200)' }}>
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: 'Menu', links: ['Why Foodie', 'Popular', 'Categories'] },
            { title: 'Company', links: ['About', "FAQ's", 'Partners'] },
            { title: 'Support', links: ['Account', 'Support Center', 'Feedback'] },
          ].map(({ title, links }) => (
            <div key={title} className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold tracking-wider uppercase" style={{ color: 'oklch(0.65 0.15 160)' }}>
                {title}
              </h4>
              <div className="flex flex-col gap-2 text-xs font-light" style={{ color: 'oklch(0.65 0.02 200)' }}>
                {links.map(l => (
                  <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
                ))}
              </div>
            </div>
          ))}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold tracking-wider uppercase" style={{ color: 'oklch(0.65 0.15 160)' }}>
              Contacts
            </h4>
            <div className="flex flex-col gap-2 text-xs font-light" style={{ color: 'oklch(0.55 0.02 200)' }}>
              <p>hello@foodie.eco</p>
              <p>+1 (555) 234-5678</p>
              <p>San Francisco, CA</p>
            </div>
          </div>
        </div>
        <Separator style={{ background: 'oklch(0.28 0.065 178 / 60%)' }} />
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light"
             style={{ color: 'oklch(0.45 0.02 200)' }}>
          <p>&copy; 2026 Foodie. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* ── Cart Sidebar ─────────────────────────────────── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-full max-w-md bg-background shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BaggageClaimIcon className="size-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Your Cart</h3>
              </div>
              <button onClick={() => setCartOpen(false)}
                      className="p-1.5 rounded-full hover:bg-accent transition-colors">
                <XIcon className="size-5 text-muted-foreground" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                  <ShoppingBagIcon className="size-10 text-border" />
                  <p className="text-sm font-light">Your cart is empty.</p>
                  <button onClick={() => setCartOpen(false)}
                          className="text-sm font-semibold text-primary hover:underline">
                    Browse the menu
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.name}
                       className="flex items-center justify-between gap-4 p-3 rounded-2xl border border-border/60 bg-muted/30">
                    <img src={item.imgUrl} alt={item.name}
                         className="size-12 rounded-xl object-cover bg-white shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{item.name}</p>
                      <p className="text-xs font-semibold" style={{ color: 'oklch(0.38 0.09 160)' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-full border border-border p-1">
                      <button onClick={() => changeQty(item.name, -1)}
                              className="size-6 rounded-full flex items-center justify-center hover:bg-accent text-muted-foreground transition-colors">
                        <MinusIcon className="size-3" />
                      </button>
                      <span className="text-xs font-bold px-1 text-foreground">{item.quantity}</span>
                      <button onClick={() => changeQty(item.name, 1)}
                              className="size-6 rounded-full flex items-center justify-center hover:bg-accent text-muted-foreground transition-colors">
                        <PlusIcon className="size-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 bg-muted/30 border-t border-border space-y-4">
                <div className="flex items-center justify-between text-base font-bold text-foreground">
                  <span>Total:</span>
                  <span className="font-serif text-lg" style={{ color: 'oklch(0.22 0.055 178)' }}>
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => setCartOpen(false)}
                          className="rounded-full text-xs font-semibold">
                    Close
                  </Button>
                  <Button className="rounded-full text-xs font-semibold text-white shadow-md"
                          style={{ background: 'oklch(0.28 0.065 178)' }}
                          onClick={() => alert('Order submitted! 🎉')}>
                    Checkout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
