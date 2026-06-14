'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface NavItem {
  href: string
  label: string
}

export const navItems: NavItem[] = [
  { href: '/', label: 'GRAPH' },
  { href: '/search', label: 'SEARCH' },
  { href: '/collections', label: 'COLLECTIONS' },
]

function Wordmark() {
  return (
    <Link
      href="/"
      className="select-none text-[17px] font-normal tracking-tight text-foreground transition-opacity duration-300 hover:opacity-70 sm:text-[18px]"
    >
      ProJect <span className="font-bold">YOU</span>
    </Link>
  )
}

/**
 * Floating minimal top bar.
 * - variant="landing": just the wordmark + a ghost CONTACT control.
 * - variant="app": wordmark + nav links + a CAPTURE ghost action.
 */
export function TopNav({
  variant = 'app',
  onCapture,
  reveal = false,
}: {
  variant?: 'landing' | 'app'
  onCapture?: () => void
  reveal?: boolean
}) {
  const pathname = usePathname()

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <nav className="pointer-events-auto mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 sm:px-10 sm:py-7">
        <Wordmark />

        {variant === 'landing' ? (
          <a
            href="#"
            className="rounded-[5px] border border-foreground px-4 py-2 text-[14px] tracking-tight text-foreground transition-colors duration-300 hover:border-gunmetal hover:text-gunmetal"
          >
            CONTACT
          </a>
        ) : (
          <div
            className={cn(
              'flex items-center gap-4 transition-all duration-700 ease-fluid sm:gap-7',
              reveal ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
            )}
          >
            <ul className="flex items-center gap-4 sm:gap-7">
              {navItems.map((item) => {
                const active =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'text-[13px] tracking-tight transition-colors duration-300 sm:text-[14px]',
                        active
                          ? 'text-foreground'
                          : 'text-foreground/55 hover:text-foreground',
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
            {onCapture && (
              <button
                onClick={onCapture}
                className="rounded-[5px] border border-foreground px-3 py-2 text-[13px] tracking-tight text-foreground transition-colors duration-300 hover:border-gunmetal hover:text-gunmetal sm:px-4 sm:text-[14px]"
              >
                CAPTURE
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
