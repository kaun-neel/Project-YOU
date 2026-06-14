'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode } from 'react'
import {
  LayoutGrid,
  Share2,
  MessageSquareText,
  FolderTree,
  Plus,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CaptureProvider, useCapture } from './capture-context'
import { Sidebar } from './sidebar'
import { CaptureModal } from './capture-modal'

const mobileNav = [
  { href: '/', label: 'Home', icon: LayoutGrid },
  { href: '/graph', label: 'Graph', icon: Share2 },
  { href: '/search', label: 'Search', icon: MessageSquareText },
  { href: '/collections', label: 'Lists', icon: FolderTree },
]

function FloatingCapture() {
  const { openCapture } = useCapture()
  return (
    <button
      onClick={openCapture}
      aria-label="Quick capture"
      className="group fixed bottom-20 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-primary/50 active:scale-95 md:bottom-7 md:right-7"
    >
      <span className="absolute inset-0 animate-pulse-ring rounded-full" />
      <Plus className="size-6 transition-transform duration-300 group-hover:rotate-90" />
    </button>
  )
}

function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-sidebar-border bg-sidebar/90 px-2 py-1.5 backdrop-blur-md md:hidden">
      {mobileNav.map((item) => {
        const active =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 text-[10px] transition-colors',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon className="size-5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function MobileHeader() {
  return (
    <header className="flex h-14 items-center gap-2.5 border-b border-border px-4 md:hidden">
      <div className="flex size-7 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/30">
        <Sparkles className="size-3.5 text-primary" />
      </div>
      <p className="font-heading text-sm font-semibold">Mem</p>
    </header>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <CaptureProvider>
      <div className="flex h-dvh overflow-hidden bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileHeader />
          <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
        </div>
        <FloatingCapture />
        <MobileNav />
        <CaptureModal />
      </div>
    </CaptureProvider>
  )
}
