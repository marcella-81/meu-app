'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const links = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="1" width="6" height="6" rx="1.5"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5"/>
      </svg>
    ),
  },
  {
    href: '/rotina',
    label: 'Rotina',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h12M2 8h8M2 12h10"/>
      </svg>
    ),
  },
  {
    href: '/pendencias',
    label: 'Pendências',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h12M2 8h12M2 12h12"/>
        <circle cx="5" cy="4" r="1" fill="currentColor"/>
        <circle cx="5" cy="8" r="1" fill="currentColor"/>
        <circle cx="5" cy="12" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: '/calendario',
    label: 'Calendário',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="14" height="12" rx="2"/>
        <path d="M5 1v4M11 1v4M1 7h14"/>
      </svg>
    ),
  },
  {
    href: '/wellness',
    label: 'Wellness',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 14s-6-4-6-8a6 6 0 0112 0c0 4-6 8-6 8z"/>
      </svg>
    ),
  },
  {
    href: '/metas',
    label: 'Metas',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12l3-3 3 3 6-6"/>
      </svg>
    ),
  },
]

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname()
  const supabase = createClient()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <aside className="w-52 h-screen sticky top-0 flex flex-col bg-sidebar border-r border-black/5 px-3 py-6">

      {/* Logo */}
      <div className="px-3 mb-6">
        <span className="text-xl font-bold tracking-tight text-hero">
          flow<span className="text-accent">.</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-ink3 px-3 mb-1">
          Menu
        </p>
        {links.map(link => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all`} 
              style={active ? { background: 'var(--hero)', color: 'white', fontWeight: 500 } : { color: 'var(--text2)' }}
            >
              {link.icon}
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-black/5 pt-4 mt-4">
        <Link
          href="/perfil"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-hero flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {userName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-ink truncate">{userName}</p>
            <p className="text-[10px] text-ink3">Ver perfil</p>
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-xs text-ink3 hover:text-accent3 transition-all rounded-xl hover:bg-black/5"
        >
          Sair
        </button>
      </div>

    </aside>
  )
}