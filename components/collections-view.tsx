'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  FileText,
  Link2,
  Upload,
  Mic,
  Wand2,
  ArrowUpRight,
  X,
  ArrowLeft,
} from 'lucide-react'
import {
  collections,
  nodes,
  nodeTypeMeta,
  type Collection,
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
  const [open, setOpen] = useState<Collection | null>(null)

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
              <button
                key={c.id}
                onClick={() => setOpen(c)}
                className={cn(
                  'animate-fade-up group flex flex-col bg-background p-6 text-left transition-colors duration-300 hover:bg-card',
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
              </button>
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

      {/* Collection detail drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpen(null)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-border bg-background"
            >
              {/* Drawer header */}
              <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-5">
                <button
                  onClick={() => setOpen(null)}
                  className="flex items-center gap-2 text-[13px] tracking-tight text-foreground/60 transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                  Collections
                </button>
                <button
                  onClick={() => setOpen(null)}
                  className="flex size-8 items-center justify-center text-foreground/50 transition-colors hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Drawer content */}
              <div className="scroll-thin flex-1 overflow-y-auto px-6 py-7">
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className="size-3 rounded-full"
                    style={{ background: open.accent }}
                  />
                  {open.aiGenerated && (
                    <span className="text-[11px] uppercase tracking-[0.14em] text-foreground/45">
                      AI summary
                    </span>
                  )}
                </div>
                <h2 className="mt-4 text-[28px] font-normal leading-[1.2] text-foreground">
                  {open.title}
                </h2>
                <p className="mt-3 text-[15px] leading-[1.6] text-foreground/65">
                  {open.description}
                </p>

                <div className="mt-9">
                  <p className="mb-4 text-[11px] uppercase tracking-[0.14em] text-foreground/45">
                    {open.nodeIds.length} nodes in this collection
                  </p>
                  <div className="flex flex-col gap-px border border-border bg-border">
                    {open.nodeIds.map((id) => {
                      const n = nodes.find((node) => node.id === id)
                      if (!n) return null
                      const meta = nodeTypeMeta[n.type]
                      const Icon = typeIcon[n.type]
                      return (
                        <div
                          key={id}
                          className="group flex flex-col gap-1.5 bg-background px-4 py-4 transition-colors hover:bg-card"
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon
                              className="size-3.5 shrink-0"
                              style={{ color: meta.color }}
                            />
                            <span className="text-[14px] font-medium text-foreground">
                              {n.title}
                            </span>
                            <span
                              className="ml-auto rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
                              style={{
                                background: `${meta.color}22`,
                                color: meta.color,
                              }}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <p className="line-clamp-2 pl-6 text-[13px] leading-[1.5] text-foreground/55">
                            {n.summary}
                          </p>
                          {n.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pl-6 pt-1">
                              {n.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="border border-border px-1.5 py-0.5 text-[10px] tracking-tight text-foreground/50"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
