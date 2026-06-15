'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { GlassEffect, GlassFilter } from '@/components/ui/liquid-glass'

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
          width={72}
          height={72}
          className="size-16 object-contain invert sm:size-[72px]"
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
        width={72}
        height={72}
        className="size-16 object-contain invert sm:size-[72px]"
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
    <>
      {/* SVG filter that powers the liquid-glass distortion. Rendered once. */}
      <GlassFilter />

      {/* Detached, floating nav pinned to the top-right of the viewport. */}
      <header
        className={cn(
          'pointer-events-none fixed right-4 top-4 z-[60] sm:right-6 sm:top-6',
          'transition-all duration-700 ease-fluid',
          reveal ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
        )}
      >
        <GlassEffect className="pointer-events-auto rounded-3xl px-4 py-2.5 sm:px-5 sm:py-3">
          <nav className="flex items-center gap-4 sm:gap-6">
            <Wordmark onClick={onLogoClick} />

            {variant === 'landing' ? (
              <a
                href="#"
                className="rounded-[5px] border border-foreground/70 px-4 py-2 text-[14px] tracking-tight text-foreground transition-colors duration-300 hover:border-gunmetal hover:text-gunmetal"
              >
                CONTACT
              </a>
            ) : (
              <>
                <Suspense fallback={<div className="h-5 w-40" />}>
                  <NavLinks reveal={reveal} />
                </Suspense>
                {onCapture && (
                  <button
                    onClick={onCapture}
                    className="rounded-full border border-foreground/70 px-3 py-1.5 text-[13px] tracking-tight text-foreground transition-colors duration-300 hover:border-gunmetal hover:text-gunmetal sm:px-4 sm:text-[14px]"
                  >
                    CAPTURE
                  </button>
                )}
              </>
            )}
          </nav>
        </GlassEffect>
      </header>
    </>
  )
}
