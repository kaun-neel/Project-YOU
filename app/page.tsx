'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { SignInPage } from '@/components/sign-in-page'
import { EntryExperience } from '@/components/entry-experience'
import { AppShell } from '@/components/app-shell'
import { GraphView } from '@/components/graph-view'

type Stage = 'loading' | 'signin' | 'entry' | 'graph'

interface UserInfo {
  userId: string
  email: string
  name: string
}

// Persisted stage: keeps the user on 'entry' when logo is clicked, never back to signin
let _persistedStage: Stage | null = null

export default function Home() {
  const [stage, setStage] = useState<Stage>(_persistedStage ?? 'loading')
  const [user, setUser] = useState<UserInfo | null>(null)

  const advance = useCallback((next: Stage) => {
    _persistedStage = next
    setStage(next)
  }, [])

  useEffect(() => {
    // Only check session on very first load (no persisted stage)
    if (_persistedStage !== null) return
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user)
          advance('entry')
        } else {
          advance('signin')
        }
      })
      .catch(() => advance('signin'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (stage === 'loading') return <div className="h-dvh bg-[#0d0d14]" />

  if (stage === 'signin')
    return (
      <SignInPage
        onSuccess={() => {
          fetch('/api/auth/me')
            .then((r) => r.json())
            .then((data) => { if (data?.user) setUser(data.user) })
            .catch(() => {})
          advance('entry')
        }}
      />
    )

  if (stage === 'entry')
    return <EntryExperience onEnter={() => advance('graph')} />

  return (
    <Suspense fallback={<div className="h-dvh bg-background" />}>
      <div style={{ animation: 'mem-blur-in 0.9s cubic-bezier(0.16,1,0.3,1) both' }}>
        <AppShell user={user} onLogoClick={() => advance('entry')}>
          <GraphView user={user} />
        </AppShell>
      </div>
    </Suspense>
  )
}
