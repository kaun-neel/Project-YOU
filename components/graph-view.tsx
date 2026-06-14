'use client'

import { useState } from 'react'
import { SlidersHorizontal, Check, RotateCcw, Settings, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { KnowledgeGraph } from './knowledge-graph'
import { NodeDetailPanel } from './node-detail-panel'
import { GraphLegend } from './graph-legend'
import { SettingsPanel } from './settings-panel'
import {
  nodeTypeMeta,
  type KnowledgeNode,
  type NodeType,
} from '@/lib/mock-data'
import { useCapture } from './capture-context'
import { cn } from '@/lib/utils'

const types = Object.keys(nodeTypeMeta) as NodeType[]

interface UserInfo {
  userId: string
  email: string
  name: string
}

export function GraphView({ user }: { user?: UserInfo | null }) {
  const { nodes, tags: allTags } = useCapture()
  const [selected, setSelected] = useState<KnowledgeNode | null>(null)
  const [activeTypes, setActiveTypes] = useState<NodeType[]>([...types])
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

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

      {/* ── Sidebar toggle button — always visible ── */}
      <button
        onClick={() => setSidebarOpen((s) => !s)}
        title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        className={cn(
          'absolute z-40 top-4 flex items-center justify-center size-8 rounded-full border border-foreground/15 bg-background/60 text-foreground/50 backdrop-blur-sm transition-all duration-300 hover:border-foreground/30 hover:text-foreground',
          sidebarOpen ? 'left-[256px]' : 'left-4',
        )}
      >
        {sidebarOpen
          ? <PanelLeftClose className="size-4" />
          : <PanelLeftOpen className="size-4" />
        }
      </button>

      {/* ── Filter / sidebar rail ── */}
      <div
        className={cn(
          'relative flex flex-col inset-y-0 left-0 z-30 shrink-0 overflow-y-auto border-r border-foreground/8 bg-transparent transition-all duration-500 ease-fluid',
          sidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 pointer-events-none overflow-hidden',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-foreground/8 px-5 py-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-3.5 text-foreground/50" />
            <h2 className="text-[11px] uppercase tracking-[0.16em] text-foreground/50">
              Filters
            </h2>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1 text-[11px] tracking-tight text-foreground/35 transition-colors hover:text-foreground/70"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        </div>

        {/* Type filters */}
        <div className="px-5 py-5">
          <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-foreground/35">
            Type
          </p>
          <div className="flex flex-col gap-0.5">
            {types.map((t) => {
              const on = activeTypes.includes(t)
              return (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className="group flex items-center gap-3 px-1 py-2 text-[14px] transition-colors"
                >
                  <span
                    className={cn(
                      'flex size-4 items-center justify-center border transition-colors',
                      on ? 'border-foreground/70 bg-foreground/70' : 'border-foreground/20',
                    )}
                  >
                    {on && <Check className="size-3 text-background" />}
                  </span>
                  <span
                    className="size-2 rounded-full"
                    style={{ background: nodeTypeMeta[t].color }}
                  />
                  <span className={on ? 'text-foreground/90' : 'text-foreground/40'}>
                    {nodeTypeMeta[t].label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tag filters */}
        <div className="border-t border-foreground/8 px-5 py-5">
          <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-foreground/35">
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
                      ? 'border-foreground/70 bg-foreground/10 text-foreground'
                      : 'border-foreground/15 text-foreground/40 hover:border-foreground/35 hover:text-foreground/70',
                  )}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        {/* Date range */}
        <div className="border-t border-foreground/8 px-5 py-5">
          <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-foreground/35">
            Date range
          </p>
          <input
            type="range"
            min={0}
            max={100}
            defaultValue={100}
            className="w-full accent-gunmetal"
          />
          <div className="mt-1.5 flex justify-between text-[10px] text-foreground/35">
            <span>Jan 2025</span>
            <span>Now</span>
          </div>
        </div>

        {/* Node count */}
        <div className="border-t border-foreground/8 px-5 py-4">
          <p className="text-[12px] text-foreground/40">
            Showing <span className="text-foreground/80">{filtered}</span> of {nodes.length} nodes
          </p>
        </div>

        {/* Settings — pinned to bottom */}
        <div className="mt-auto border-t border-foreground/8 px-5 py-4">
          <button
            onClick={() => setShowSettings(true)}
            className="flex w-full items-center gap-2.5 text-[12px] text-foreground/40 transition-colors hover:text-foreground/80"
          >
            <Settings className="size-4" />
            Settings
          </button>
        </div>
      </div>

      {/* ── Graph stage ── */}
      <div className="relative min-h-0 flex-1">
        {/* Section label */}
        <div className="pointer-events-none absolute left-14 top-4 z-20 hidden sm:block">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/35">
            Your memory
          </p>
          <p className="text-heading-sm font-normal text-foreground/80">
            {nodes.length} ideas, refracted
          </p>
        </div>

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

      <SettingsPanel
        open={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
      />
    </div>
  )
}
