'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, ArrowRight } from 'lucide-react'
import { KnowledgeGraph } from './knowledge-graph'
import { NodeDetailPanel } from './node-detail-panel'
import { GraphLegend } from './graph-legend'
import { nodes, nodeTypeMeta, type KnowledgeNode } from '@/lib/mock-data'

export function Dashboard() {
  const router = useRouter()
  const [selected, setSelected] = useState<KnowledgeNode | null>(null)
  const [query, setQuery] = useState('')

  const typeCounts = (Object.keys(nodeTypeMeta) as (keyof typeof nodeTypeMeta)[]).map(
    (t) => ({
      type: t,
      count: nodes.filter((n) => n.type === t).length,
    }),
  )

  return (
    <div className="relative flex h-full flex-col">
      {/* Top bar */}
      <div className="z-10 border-b border-border px-4 py-3 sm:px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (query.trim())
              router.push(`/search?q=${encodeURIComponent(query)}`)
          }}
          className="mx-auto flex max-w-2xl items-center gap-2.5 rounded-lg border border-border bg-card px-3.5 py-2.5 transition-colors focus-within:border-primary/50"
        >
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask your knowledge base anything..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary transition-colors hover:bg-primary/25"
          >
            <ArrowRight className="size-4" />
          </button>
        </form>
      </div>

      {/* Heading row */}
      <div className="flex flex-wrap items-end justify-between gap-3 px-4 pb-2 pt-4 sm:px-6">
        <div className="animate-fade-up">
          <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            Your knowledge graph
          </h1>
          <p className="text-sm text-muted-foreground">
            {nodes.length} ideas, connected by meaning. Drag, zoom, and explore.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {typeCounts.map(({ type, count }) => (
            <div
              key={type}
              className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5"
            >
              <span
                className="size-2 rounded-full"
                style={{ background: nodeTypeMeta[type].color }}
              />
              <span className="text-xs text-foreground">{count}</span>
              <span className="text-xs text-muted-foreground">
                {nodeTypeMeta[type].label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Graph stage */}
      <div className="relative min-h-0 flex-1">
        <KnowledgeGraph selectedId={selected?.id} onSelect={setSelected} />
        <GraphLegend />
        <NodeDetailPanel
          node={selected}
          onClose={() => setSelected(null)}
          onSelect={setSelected}
        />
      </div>
    </div>
  )
}
