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

// ── Logo: fixed top-left, standalone ──────────────────────────────────────
function Wordmark({ onClick }: { onClick?: () => void }) {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="fixed left-5 top-4 z-[70] block transition-opacity duration-300 hover:opacity-70"
        aria-label="Go home"
      >
        <Image
          src="/logo.png"
          alt="Project YOU"
          width={56}
          height={56}
          className="size-14 object-contain invert drop-shadow-lg"
          priority
        />
      </button>
    )
  }
  return (
    <Link
      href="/"
      className="fixed left-5 top-4 z-[70] block transition-opacity duration-300 hover:opacity-70"
      aria-label="Go home"
    >
      <Image
        src="/logo.png"
        alt="Project YOU"
        width={56}
        height={56}
        className="size-14 object-contain invert drop-shadow-lg"
        priority
      />
    </Link>
  )
}

interface UserInfo {
  userId: string
  email: string
  name: string
}

// ── Nav links (uses usePathname so must be inside Suspense) ───────────────
function NavLinks() {
  const pathname = usePathname()
  return (
    <ul className="flex items-center gap-5 sm:gap-8">
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
                'text-[13px] font-medium tracking-widest uppercase transition-colors duration-300 sm:text-[13px]',
                active
                  ? 'text-foreground'
                  : 'text-foreground/45 hover:text-foreground',
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

// ── TopNav ─────────────────────────────────────────────────────────────────
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
    <>
      {/* Standalone logo — fixed top-left */}
      <Wordmark onClick={onLogoClick} />

      {/* Floating pill navbar — centred at top */}
      <header className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center">
        <nav
          className={cn(
            'pointer-events-auto flex items-center gap-5 rounded-full border border-foreground/10 bg-background/20 px-6 py-3 shadow-2xl backdrop-blur-2xl transition-all duration-700 sm:gap-8 sm:px-8',
            reveal ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0',
          )}
        >
          {variant === 'landing' ? (
            <a
              href="#"
              className="text-[13px] uppercase tracking-widest text-foreground/70 transition-colors hover:text-foreground"
            >
              CONTACT
            </a>
          ) : (
            <>
              <Suspense fallback={<div className="h-4 w-56" />}>
                <NavLinks />
              </Suspense>
              {onCapture && (
                <button
                  onClick={onCapture}
                  className="rounded-full border border-foreground/60 px-4 py-1.5 text-[12px] font-medium uppercase tracking-widest text-foreground transition-all duration-200 hover:bg-foreground hover:text-background"
                >
                  CAPTURE
                </button>
              )}
            </>
          )}
        </nav>
      </header>
    </>
  )
}
