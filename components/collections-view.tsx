'use client'

import { useState } from 'react'
import {
  Plus,
  FileText,
  Link2,
  Upload,
  Mic,
  Wand2,
  ArrowUpRight,
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
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-10 sm:py-14">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-8">
          <div>
            <p
              className="text-[15px] tracking-tight text-foreground/60"
              style={{ animation: 'mem-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both' }}
            >
              Refracted by meaning
            </p>
            <h1 className="text-heading mt-3 max-w-[14ch] font-normal text-foreground text-balance">
              Your <span className="font-bold">collections</span>
            </h1>
          </div>
          <button
            onClick={() => {
              setGrouping(true)
              setTimeout(() => setGrouping(false), 1600)
            }}
            disabled={grouping}
            className="flex items-center gap-2 border border-foreground px-4 py-3 text-[14px] tracking-tight text-foreground transition-colors hover:border-gunmetal hover:text-gunmetal disabled:opacity-60"
          >
            {grouping ? (
              <>
                <span className="size-3.5 animate-spin rounded-full border border-foreground/40 border-t-foreground" />
                GROUPING...
              </>
            ) : (
              <>
                <Wand2 className="size-4" />
                LET AI GROUP MY NOTES
              </>
            )}
          </button>
        </div>

        {/* Grid */}
        <div className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c, i) => {
            const items = c.nodeIds
              .map((id) => nodes.find((n) => n.id === id))
              .filter(Boolean)
              .slice(0, 3)
            return (
              <div
                key={c.id}
                className={cn(
                  'animate-fade-up group flex flex-col bg-background p-6 transition-colors duration-300 hover:bg-card',
                  grouping && 'animate-pulse',
                )}
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="size-3 rounded-full"
                    style={{ background: c.accent }}
                  />
                  {c.aiGenerated && (
                    <span className="text-[10px] uppercase tracking-[0.14em] text-foreground/45">
                      AI summary
                    </span>
                  )}
                </div>

                <h3 className="mt-5 text-[22px] font-normal leading-[1.2] text-balance">
                  {c.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-[14px] leading-[1.5] text-foreground/60">
                  {c.description}
                </p>

                {/* node previews */}
                <div className="mt-5 flex flex-col">
                  {items.map((n) => {
                    if (!n) return null
                    const meta = nodeTypeMeta[n.type]
                    const Icon = typeIcon[n.type]
                    return (
                      <div
                        key={n.id}
                        className="flex items-center gap-2.5 border-b border-border/60 py-2"
                      >
                        <Icon
                          className="size-3.5 shrink-0"
                          style={{ color: meta.color }}
                        />
                        <span className="truncate text-[13px] text-foreground/70">
                          {n.title}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-auto flex items-center justify-between pt-6">
                  <span className="text-[12px] text-foreground/45">
                    {c.nodeIds.length} nodes
                  </span>
                  <span className="flex items-center gap-1 text-[13px] tracking-tight text-foreground/50 transition-colors group-hover:text-foreground">
                    Open
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </div>
              </div>
            )
          })}

          {/* Create card */}
          <button className="group flex min-h-52 flex-col items-center justify-center gap-3 bg-background p-6 text-center transition-colors duration-300 hover:bg-card">
            <span className="flex size-11 items-center justify-center border border-border transition-colors group-hover:border-gunmetal">
              <Plus className="size-5 text-foreground/55 transition-colors group-hover:text-foreground" />
            </span>
            <span className="text-[15px] text-foreground">
              Create collection
            </span>
            <span className="text-[12px] text-foreground/45">
              Manual, or let AI group
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
