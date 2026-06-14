import { Suspense } from 'react'
import { AppShell } from '@/components/app-shell'
import { SearchView } from '@/components/search-view'

// Search page — AI-powered knowledge retrieval
export default function SearchPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="h-full" />}>
        <SearchView />
      </Suspense>
    </AppShell>
  )
}
