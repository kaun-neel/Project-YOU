'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Sidebar({ children, open = true, onOpenChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(open)

  const handleToggle = () => {
    const newOpen = !isOpen
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-foreground/10 bg-background/40 backdrop-blur-sm transition-all duration-300 ease-fluid',
        isOpen ? 'w-64' : 'w-16',
      )}
    >
      {/* Toggle button */}
      <button
        onClick={handleToggle}
        className="absolute -right-3 top-24 z-50 flex size-6 items-center justify-center rounded-full border border-foreground/20 bg-background/80 backdrop-blur transition-all hover:border-foreground/40 hover:bg-background"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? (
          <ChevronLeft className="size-4" />
        ) : (
          <ChevronRight className="size-4" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scroll-thin p-4">
        {children && (
          <div className={cn('space-y-4 transition-opacity duration-300', !isOpen && 'hidden')}>
            {children}
          </div>
        )}
      </div>
    </aside>
  )
}
