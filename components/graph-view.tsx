'use client'

import { useState } from 'react'
import { SlidersHorizontal, Check, RotateCcw } from 'lucide-react'
import { KnowledgeGraph } from './knowledge-graph'
import { NodeDetailPanel } from './node-detail-panel'
import { GraphLegend } from './graph-legend'
import {
  nodeTypeMeta,
  allTags,
  nodes,
  type KnowledgeNode,
  type NodeType,
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const types = Object.keys(nodeTypeMeta) as NodeType[]

export function GraphView() {
  const [selected, setSelected] = useState<KnowledgeNode | null>(null)
  const [activeTypes, setActiveTypes] = useState<NodeType[]>([...types])
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  function toggleType(t: NodeType) {
    setActiveTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    )
  }

  const filtered = nodes.filter(
    (n) =>
      activeTypes.includes(n.type) && (!activeTag || n.tags.includes(activeTag)),
  ).length

  function reset() {
    setActiveTypes([...types])
    setActiveTag(null)
  }

  return (
    <div className="relative flex h-full">
      {/* Filter sidebar */}
      <div
        className={cn(
          'absolute inset-y-0 left-0 z-30 w-64 shrink-0 overflow-y-auto border-r border-border bg-card/95 backdrop-blur-md transition-transform duration-300 md:relative md:z-10 md:translate-x-0',
          showFilters ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-primary" />
            <h2 className="font-heading text-sm font-semibold">Filters</h2>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        </div>

        <div className="p-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Type
          </p>
          <div className="flex flex-col gap-1">
            {types.map((t) => {
              const on = activeTypes.includes(t)
              return (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-secondary"
                >
                  <span
                    className={cn(
                      'flex size-4 items-center justify-center rounded border transition-colors',
                      on ? 'border-transparent' : 'border-border',
                    )}
                    style={on ? { background: nodeTypeMeta[t].color } : undefined}
                  >
                    {on && <Check className="size-3 text-background" />}
                  </span>
                  <span
                    className="size-2 rounded-full"
                    style={{ background: nodeTypeMeta[t].color }}
                  />
                  <span className={on ? 'text-foreground' : 'text-muted-foreground'}>
                    {nodeTypeMeta[t].label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-t border-border p-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Tag
          </p>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => {
              const on = activeTag === tag
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTag(on ? null : tag)}
                  className={cn(
                    'rounded px-2 py-1 font-mono text-[11px] transition-colors',
                    on
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-t border-border p-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Date range
          </p>
          <input
            type="range"
            min={0}
            max={100}
            defaultValue={100}
            className="w-full accent-primary"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>Jan 2025</span>
            <span>Now</span>
          </div>
        </div>

        <div className="border-t border-border p-4">
          <p className="text-xs text-muted-foreground">
            Showing <span className="text-foreground">{filtered}</span> of{' '}
            {nodes.length} nodes
          </p>
        </div>
      </div>

      {/* Stage */}
      <div className="relative min-h-0 flex-1">
        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground shadow-sm md:hidden"
        >
          <SlidersHorizontal className="size-3.5" />
          Filters
        </button>

        <KnowledgeGraph
          selectedId={selected?.id}
          onSelect={setSelected}
          activeTypes={activeTypes}
          activeTag={activeTag}
        />
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
