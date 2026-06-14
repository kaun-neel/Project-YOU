'use client'

import { useEffect, useState } from 'react'
import { EntryExperience } from '@/components/entry-experience'
import { AppShell } from '@/components/app-shell'
import { GraphView } from '@/components/graph-view'

const ENTERED_KEY = 'project-you-entered'

export default function Home() {
  const [entered, setEntered] = useState<boolean | null>(null)

  // Skip the intro if the user has already entered this session.
  useEffect(() => {
    setEntered(sessionStorage.getItem(ENTERED_KEY) === '1')
  }, [])

  function enter() {
    sessionStorage.setItem(ENTERED_KEY, '1')
    setEntered(true)
  }

  // Avoid a flash before we know the session state.
  if (entered === null) {
    return <div className="h-dvh bg-background" />
  }

  if (!entered) {
    return <EntryExperience onEnter={enter} />
  }

  return (
    <div style={{ animation: 'mem-blur-in 0.9s cubic-bezier(0.16,1,0.3,1) both' }}>
      <AppShell>
        <GraphView />
      </AppShell>
    </div>
  )
}
