'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  Share2,
  MessageSquareText,
  FolderTree,
  Plus,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCapture } from './capture-context'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutGrid },
  { href: '/graph', label: 'Graph', icon: Share2 },
  { href: '/search', label: 'Search', icon: MessageSquareText },
  { href: '/collections', label: 'Collections', icon: FolderTree },
]

export function Sidebar() {
  const pathname = usePathname()
  const { openCapture } = useCapture()

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/30">
          <Sparkles className="size-4 text-primary" />
        </div>
        <div className="leading-tight">
          <p className="font-heading text-[15px] font-semibold tracking-tight text-foreground">
            Mem
          </p>
          <p className="text-[10px] text-muted-foreground">second brain</p>
        </div>
      </div>

      {/* Capture button */}
      <div className="px-3 pb-2 pt-1">
        <button
          onClick={openCapture}
          className="group flex w-full items-center gap-2.5 rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
        >
          <Plus className="size-4 transition-transform duration-300 group-hover:rotate-90" />
          Capture
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        <p className="px-2 pb-1.5 pt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Navigate
        </p>
        {navItems.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2 text-sm transition-colors duration-200',
                active
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {active && (
                <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary" />
              )}
              <span
                className={cn(
                  'absolute inset-0 -z-10 rounded-md transition-colors duration-200',
                  active
                    ? 'bg-sidebar-accent'
                    : 'bg-transparent group-hover:bg-sidebar-accent/60',
                )}
              />
              <Icon
                className={cn(
                  'size-4 transition-colors',
                  active && 'text-primary',
                )}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer status */}
      <div className="border-t border-sidebar-border px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground">15</span> nodes synced
          </p>
        </div>
      </div>
    </aside>
  )
}
