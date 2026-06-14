'use client'

import Link from 'next/link'
import { X, ExternalLink, MessageSquareText, ArrowUpRight } from 'lucide-react'
import {
  nodeTypeMeta,
  nodes,
  edges,
  type KnowledgeNode,
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'

function relatedNodes(id: string): KnowledgeNode[] {
  const ids = new Set<string>()
  edges.forEach((e) => {
    if (e.source === id) ids.add(e.target)
    if (e.target === id) ids.add(e.source)
  })
  return nodes.filter((n) => ids.has(n.id))
}

export function NodeDetailPanel({
  node,
  onClose,
  onSelect,
}: {
  node: KnowledgeNode | null
  onClose: () => void
  onSelect?: (n: KnowledgeNode) => void
}) {
  const open = !!node
  const meta = node ? nodeTypeMeta[node.type] : null
  const related = node ? relatedNodes(node.id) : []

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-y-0 right-0 z-20 w-full max-w-sm p-3 transition-all duration-300 sm:p-4',
        open ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0',
      )}
      style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
    >
      {node && meta && (
        <div className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card/95 shadow-2xl shadow-black/40 backdrop-blur-md">
          {/* header */}
          <div className="flex items-start justify-between gap-3 border-b border-border p-4">
            <div className="flex items-start gap-2.5">
              <span
                className="mt-1 size-2.5 shrink-0 rounded-full"
                style={{ background: meta.color }}
              />
              <div>
                <span
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </span>
                <h3 className="font-heading text-base font-semibold leading-snug text-balance">
                  {node.title}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="scroll-thin flex-1 overflow-y-auto p-4">
            <p className="text-sm leading-relaxed text-foreground/90">
              {node.summary}
            </p>

            {/* tags */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {node.tags.map((t) => (
                <span
                  key={t}
                  className="rounded bg-secondary px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* source */}
            {node.source && (
              <a
                href={`https://${node.source}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
              >
                <ExternalLink className="size-3.5 shrink-0" />
                <span className="truncate font-mono">{node.source}</span>
              </a>
            )}

            <p className="mt-3 text-[11px] text-muted-foreground">
              Captured {node.createdAt} · {node.connections} connections
            </p>

            {/* related */}
            <div className="mt-6">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Related nodes
              </p>
              <div className="flex flex-col gap-1.5">
                {related.map((r) => {
                  const rMeta = nodeTypeMeta[r.type]
                  return (
                    <button
                      key={r.id}
                      onClick={() => onSelect?.(r)}
                      className="group flex items-center gap-2.5 rounded-md border border-transparent bg-background/40 px-3 py-2 text-left transition-colors hover:border-border hover:bg-secondary"
                    >
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ background: rMeta.color }}
                      />
                      <span className="flex-1 truncate text-xs text-foreground/90">
                        {r.title}
                      </span>
                      <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* footer action */}
          <div className="border-t border-border p-3">
            <Link
              href={`/search?q=${encodeURIComponent('Tell me about ' + node.title)}`}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary/15 px-3 py-2.5 text-sm font-medium text-primary ring-1 ring-primary/30 transition-colors hover:bg-primary/25"
            >
              <MessageSquareText className="size-4" />
              Ask about this
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
