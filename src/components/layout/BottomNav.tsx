'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Home', icon: '⊞' },
  { href: '/rotina', label: 'Rotina', icon: '◷' },
  { href: '/wellness', label: 'Wellness', icon: '♡' },
  { href: '/metas', label: 'Metas', icon: '◎' },
  { href: '/perfil', label: 'Perfil', icon: '◯' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 z-50">
      <div className="max-w-2xl mx-auto flex justify-around">
        {links.map(link => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-all ${
                active
                  ? 'text-violet-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span style={{ fontSize: 20 }}>{link.icon}</span>
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}