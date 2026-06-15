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
        'pointer-events-none absolute inset-y-0 right-0 z-20 w-full max-w-sm p-3 transition-all duration-500 ease-fluid sm:p-4',
        open ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0',
      )}
    >
      {node && meta && (
        <div className="pointer-events-auto flex h-full flex-col overflow-hidden border border-border bg-carbon/95 backdrop-blur-md">
          {/* header */}
          <div className="flex items-start justify-between gap-3 border-b border-border p-5">
            <div className="flex items-start gap-2.5">
              <span
                className="mt-1.5 size-2.5 shrink-0 rounded-full"
                style={{ background: meta.color }}
              />
              <div>
                <span className="text-[10px] uppercase tracking-[0.14em] text-foreground/50">
                  {meta.label}
                </span>
                <h3 className="text-[22px] font-normal leading-[1.2] text-balance">
                  {node.title}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-foreground/50 transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="scroll-thin flex-1 overflow-y-auto p-5">
            <p className="text-[15px] leading-[1.5] text-foreground/85">
              {node.summary}
            </p>

            {/* tags */}
            <div className="mt-5 flex flex-wrap gap-1.5">
              {node.tags.map((t) => (
                <span
                  key={t}
                  className="border border-border px-2 py-0.5 text-[11px] tracking-tight text-foreground/55"
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
                className="mt-5 flex items-center gap-2 border border-border px-3 py-2.5 text-[13px] text-foreground/55 transition-colors hover:border-gunmetal hover:text-foreground"
              >
                <ExternalLink className="size-3.5 shrink-0" />
                <span className="truncate">{node.source}</span>
              </a>
            )}

            <p className="mt-4 text-[12px] text-foreground/45">
              Captured {node.createdAt} · {node.connections} connections
            </p>

            {/* related */}
            <div className="mt-7">
              <p className="mb-2.5 text-[11px] uppercase tracking-[0.14em] text-foreground/45">
                Related nodes
              </p>
              <div className="flex flex-col">
                {related.map((r) => {
                  const rMeta = nodeTypeMeta[r.type]
                  return (
                    <button
                      key={r.id}
                      onClick={() => onSelect?.(r)}
                      className="group flex items-center gap-2.5 border-b border-border/60 py-2.5 text-left transition-colors hover:text-foreground"
                    >
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ background: rMeta.color }}
                      />
                      <span className="flex-1 truncate text-[14px] text-foreground/75 transition-colors group-hover:text-foreground">
                        {r.title}
                      </span>
                      <ArrowUpRight className="size-3.5 shrink-0 text-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* footer action */}
          <div className="border-t border-border p-4">
            <Link
              href={`/search?q=${encodeURIComponent('Tell me about ' + node.title)}`}
              className="flex w-full items-center justify-center gap-2 border border-foreground px-3 py-3 text-[14px] tracking-tight text-foreground transition-colors hover:border-gunmetal hover:text-gunmetal"
            >
              <MessageSquareText className="size-4" />
              ASK ABOUT THIS
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
