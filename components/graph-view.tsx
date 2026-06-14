'use client'

import { useState } from 'react'
import { SlidersHorizontal, Check, RotateCcw } from 'lucide-react'
import { KnowledgeGraph } from './knowledge-graph'
import { NodeDetailPanel } from './node-detail-panel'
import { GraphLegend } from './graph-legend'
import {
  nodeTypeMeta,
  type KnowledgeNode,
  type NodeType,
} from '@/lib/mock-data'
import { useCapture } from './capture-context'
import { cn } from '@/lib/utils'

const types = Object.keys(nodeTypeMeta) as NodeType[]

export function GraphView() {
  const { nodes, tags: allTags } = useCapture()
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
      {/* Filter rail */}
      <div
        className={cn(
          'absolute inset-y-0 left-0 z-30 w-64 shrink-0 overflow-y-auto border-r border-border bg-background/95 backdrop-blur-md transition-transform duration-500 ease-fluid md:relative md:z-10 md:translate-x-0',
          showFilters ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-3.5 text-foreground/70" />
            <h2 className="text-[13px] uppercase tracking-[0.12em] text-foreground/70">
              Filters
            </h2>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1 text-[11px] tracking-tight text-foreground/50 transition-colors hover:text-foreground"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-foreground/45">
            Type
          </p>
          <div className="flex flex-col gap-0.5">
            {types.map((t) => {
              const on = activeTypes.includes(t)
              return (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className="group flex items-center gap-3 px-1 py-2 text-[15px] transition-colors"
                >
                  <span
                    className={cn(
                      'flex size-4 items-center justify-center border transition-colors',
                      on ? 'border-foreground bg-foreground' : 'border-border',
                    )}
                  >
                    {on && <Check className="size-3 text-background" />}
                  </span>
                  <span
                    className="size-2 rounded-full"
                    style={{ background: nodeTypeMeta[t].color }}
                  />
                  <span
                    className={
                      on ? 'text-foreground' : 'text-foreground/50'
                    }
                  >
                    {nodeTypeMeta[t].label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-t border-border px-5 py-5">
          <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-foreground/45">
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
                    'border px-2 py-1 text-[11px] tracking-tight transition-colors',
                    on
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-foreground/55 hover:border-gunmetal hover:text-foreground',
                  )}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-t border-border px-5 py-5">
          <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-foreground/45">
            Date range
          </p>
          <input
            type="range"
            min={0}
            max={100}
            defaultValue={100}
            className="w-full accent-gunmetal"
          />
          <div className="mt-1.5 flex justify-between text-[10px] text-foreground/45">
            <span>Jan 2025</span>
            <span>Now</span>
          </div>
        </div>

        <div className="border-t border-border px-5 py-5">
          <p className="text-[13px] text-foreground/55">
            Showing <span className="text-foreground">{filtered}</span> of{' '}
            {nodes.length} nodes
          </p>
        </div>
      </div>

      {/* Stage */}
      <div className="relative min-h-0 flex-1">
        {/* Section label */}
        <div className="pointer-events-none absolute left-5 top-4 z-20 hidden sm:block">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/45">
            Your memory
          </p>
          <p className="text-heading-sm font-normal text-foreground">
            {nodes.length} ideas, refracted
          </p>
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="absolute left-5 top-4 z-20 flex items-center gap-1.5 border border-border bg-background/80 px-2.5 py-1.5 text-[12px] tracking-tight text-foreground backdrop-blur-sm md:hidden"
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
