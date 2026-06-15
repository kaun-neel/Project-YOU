'use client'

import { type ReactNode } from 'react'
import { CaptureProvider, useCapture } from './capture-context'
import { TopNav } from './top-nav'
import { CaptureModal } from './capture-modal'

interface UserInfo {
  userId: string
  email: string
  name: string
}

function Shell({
  children,
  user,
  onLogoClick,
}: {
  children: ReactNode
  user?: UserInfo | null
  onLogoClick?: () => void
}) {
  const { openCapture } = useCapture()
  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-background">
      {/* Detached floating nav — pinned to the top-right, independent of the
          shell layout below. */}
      <TopNav
        variant="app"
        reveal={true}
        onCapture={openCapture}
        onLogoClick={onLogoClick}
        user={user}
      />
      <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      <CaptureModal />
    </div>
  )
}

export function AppShell({
  children,
  user,
  onLogoClick,
}: {
  children: ReactNode
  user?: UserInfo | null
  onLogoClick?: () => void
}) {
  return (
    <CaptureProvider>
      <Shell user={user} onLogoClick={onLogoClick}>{children}</Shell>
    </CaptureProvider>
  )
}
