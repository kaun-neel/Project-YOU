'use client'

import { useEffect, useState } from 'react'
import { SignInPage } from '@/components/sign-in-page'
import { EntryExperience } from '@/components/entry-experience'
import { AppShell } from '@/components/app-shell'
import { GraphView } from '@/components/graph-view'

type Stage = 'loading' | 'signin' | 'entry' | 'graph'

export default function Home() {
  const [stage, setStage] = useState<Stage>('loading')

  // On mount, hit /api/auth/me — if we have a valid session cookie skip sign-in
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) {
          // Already authenticated — go straight to entry experience
          setStage('entry')
        } else {
          setStage('signin')
        }
      })
      .catch(() => setStage('signin'))
  }, [])

  function advance(next: Stage) {
    setStage(next)
  }

  if (stage === 'loading') return <div className="h-dvh bg-[#0d0d14]" />

  if (stage === 'signin')
    return <SignInPage onSuccess={() => advance('entry')} />

  if (stage === 'entry')
    return <EntryExperience onEnter={() => advance('graph')} />

  return (
    <div style={{ animation: 'mem-blur-in 0.9s cubic-bezier(0.16,1,0.3,1) both' }}>
      <AppShell>
        <GraphView />
      </AppShell>
    </div>
  )
}
