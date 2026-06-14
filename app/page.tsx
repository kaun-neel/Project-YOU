'use client'

import { useEffect, useState } from 'react'
import { SignInPage } from '@/components/sign-in-page'
import { EntryExperience } from '@/components/entry-experience'
import { AppShell } from '@/components/app-shell'
import { GraphView } from '@/components/graph-view'

type Stage = 'signin' | 'entry' | 'graph'
const SESSION_KEY = 'project-you-stage'

export default function Home() {
  const [stage, setStage] = useState<Stage | null>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY) as Stage | null
    // Always start fresh from signin unless already in graph
    setStage(saved === 'graph' ? 'graph' : 'signin')
  }, [])

  function advance(next: Stage) {
    sessionStorage.setItem(SESSION_KEY, next)
    setStage(next)
  }

  if (stage === null) return <div className="h-dvh bg-black" />

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
