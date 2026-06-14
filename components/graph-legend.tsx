'use client'

import { MousePointerClick } from 'lucide-react'
import { nodeTypeMeta } from '@/lib/mock-data'

export function GraphLegend() {
  return (
    <div className="pointer-events-none absolute bottom-5 left-5 flex flex-col gap-2">
      <div className="pointer-events-auto flex flex-wrap gap-x-4 gap-y-1.5 border border-border bg-background/80 px-3.5 py-2.5 backdrop-blur-md">
        {(Object.keys(nodeTypeMeta) as (keyof typeof nodeTypeMeta)[]).map((t) => (
          <div key={t} className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-full"
              style={{ background: nodeTypeMeta[t].color }}
            />
            <span className="text-[11px] uppercase tracking-[0.1em] text-foreground/55">
              {nodeTypeMeta[t].label}
            </span>
          </div>
        ))}
      </div>
      <div className="pointer-events-none hidden items-center gap-1.5 px-1 text-[11px] tracking-tight text-foreground/45 sm:flex">
        <MousePointerClick className="size-3" />
        Click a node to explore · scroll to zoom · drag to reposition
      </div>
    </div>
  )
}
