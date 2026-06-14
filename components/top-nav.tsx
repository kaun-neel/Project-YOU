'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

function Wordmark({ onClick }: { onClick?: () => void }) {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="block shrink-0 transition-opacity duration-300 hover:opacity-70"
        aria-label="Go home"
      >
        <Image
          src="/logo.png"
          alt="Logo"
          width={40}
          height={40}
          className="size-10 object-contain invert"
          priority
        />
      </button>
    )
  }
  return (
    <Link
      href="/"
      className="block shrink-0 transition-opacity duration-300 hover:opacity-70"
      aria-label="Go home"
    >
      <Image
        src="/logo.png"
        alt="Logo"
        width={40}
        height={40}
        className="size-10 object-contain invert"
        priority
      />
    </Link>
  )
}

/**
 * Floating minimal top bar.
 * - variant="landing": just the wordmark + a ghost CONTACT control.
 * - variant="app": wordmark + nav links + a CAPTURE ghost action.
 */
interface UserInfo {
  userId: string
  email: string
  name: string
}

function NavLinks({ reveal }: { reveal: boolean }) {
  const pathname = usePathname()
  return (
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
  )
}

export function TopNav({
  variant = 'app',
  onCapture,
  onLogoClick,
  reveal = true,
  user,
}: {
  variant?: 'landing' | 'app'
  onCapture?: () => void
  onLogoClick?: () => void
  reveal?: boolean
  user?: UserInfo | null
}) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[60]">
      <nav className="pointer-events-auto mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        <Wordmark onClick={onLogoClick} />

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
            <Suspense fallback={<div className="h-5 w-48" />}>
              <NavLinks reveal={reveal} />
            </Suspense>
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
