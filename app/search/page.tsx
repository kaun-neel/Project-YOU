import { Suspense } from 'react'
import { AppShell } from '@/components/app-shell'
import { SearchView } from '@/components/search-view'

export default function SearchPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="h-full" />}>
        <SearchView />
      </Suspense>
    </AppShell>
  )
}
