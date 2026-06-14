'use client'

import { type ReactNode } from 'react'
import { CaptureProvider, useCapture } from './capture-context'
import { TopNav } from './top-nav'
import { CaptureModal } from './capture-modal'

function Shell({ children }: { children: ReactNode }) {
  const { openCapture } = useCapture()
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <TopNav variant="app" reveal={true} onCapture={openCapture} />
      {/* top padding clears the floating nav */}
      <main className="min-h-0 flex-1 overflow-hidden pt-[72px] sm:pt-[88px]">
        {children}
      </main>
      <CaptureModal />
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <CaptureProvider>
      <Shell>{children}</Shell>
    </CaptureProvider>
  )
}
