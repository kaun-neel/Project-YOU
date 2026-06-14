'use client'

import { useState } from 'react'
import {
  Sparkles,
  Plus,
  FolderTree,
  FileText,
  Link2,
  Upload,
  Mic,
  Wand2,
} from 'lucide-react'
import {
  collections,
  nodes,
  nodeTypeMeta,
  type NodeType,
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const typeIcon: Record<NodeType, typeof FileText> = {
  note: FileText,
  url: Link2,
  pdf: Upload,
  voice: Mic,
}

export function CollectionsView() {
  const [grouping, setGrouping] = useState(false)

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="animate-fade-up">
            <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
              Collections
            </h1>
            <p className="text-sm text-muted-foreground">
              Auto-grouped clusters of related ideas, suggested by Mem.
            </p>
          </div>
          <button
            onClick={() => {
              setGrouping(true)
              setTimeout(() => setGrouping(false), 1600)
            }}
            disabled={grouping}
            className="flex items-center gap-2 rounded-md bg-primary/15 px-3.5 py-2 text-sm font-medium text-primary ring-1 ring-primary/30 transition-colors hover:bg-primary/25 disabled:opacity-70"
          >
            {grouping ? (
              <>
                <span className="size-3.5 animate-spin rounded-full border-2 border-primary/40 border-t-primary" />
                Grouping...
              </>
            ) : (
              <>
                <Wand2 className="size-4" />
                Let AI group my notes
              </>
            )}
          </button>
        </div>

        {/* Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Create card */}
          <button className="group flex min-h-44 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/40 p-5 text-center transition-all duration-200 hover:border-primary/40 hover:bg-card">
            <span className="flex size-10 items-center justify-center rounded-full bg-secondary transition-transform duration-200 group-hover:scale-110">
              <Plus className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
            </span>
            <span className="text-sm font-medium text-foreground">
              Create collection
            </span>
            <span className="text-xs text-muted-foreground">
              Manual, or let AI group
            </span>
          </button>

          {collections.map((c, i) => {
            const items = c.nodeIds
              .map((id) => nodes.find((n) => n.id === id))
              .filter(Boolean)
              .slice(0, 3)
            return (
              <div
                key={c.id}
                className={cn(
                  'animate-fade-up group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-black/20',
                  grouping && 'animate-pulse',
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Accent bar */}
                <div
                  className="h-1 w-full"
                  style={{ background: c.accent }}
                />
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="flex size-9 items-center justify-center rounded-lg"
                      style={{ background: `${c.accent}22` }}
                    >
                      <FolderTree
                        className="size-4.5"
                        style={{ color: c.accent }}
                      />
                    </span>
                    {c.aiGenerated && (
                      <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary ring-1 ring-primary/25">
                        <Sparkles className="size-2.5" />
                        AI Summary
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 font-heading text-[15px] font-semibold leading-snug text-balance">
                    {c.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {c.description}
                  </p>

                  {/* node previews */}
                  <div className="mt-3 flex flex-col gap-1">
                    {items.map((n) => {
                      if (!n) return null
                      const meta = nodeTypeMeta[n.type]
                      const Icon = typeIcon[n.type]
                      return (
                        <div
                          key={n.id}
                          className="flex items-center gap-2 rounded-md bg-background/50 px-2 py-1.5"
                        >
                          <span
                            className="flex size-4 items-center justify-center rounded"
                            style={{ background: `${meta.color}22` }}
                          >
                            <Icon
                              className="size-2.5"
                              style={{ color: meta.color }}
                            />
                          </span>
                          <span className="truncate text-[11px] text-foreground/80">
                            {n.title}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="text-[11px] text-muted-foreground">
                      {c.nodeIds.length} nodes
                    </span>
                    <span className="text-[11px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Open →
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
