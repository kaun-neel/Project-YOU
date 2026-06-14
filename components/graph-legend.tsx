'use client'

import { MousePointerClick } from 'lucide-react'
import { nodeTypeMeta } from '@/lib/mock-data'

export function GraphLegend() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 flex flex-col gap-2">
      <div className="pointer-events-auto flex flex-wrap gap-x-3 gap-y-1.5 rounded-lg border border-border bg-card/80 px-3 py-2 backdrop-blur-md">
        {(Object.keys(nodeTypeMeta) as (keyof typeof nodeTypeMeta)[]).map((t) => (
          <div key={t} className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-full"
              style={{ background: nodeTypeMeta[t].color }}
            />
            <span className="text-[11px] text-muted-foreground">
              {nodeTypeMeta[t].label}
            </span>
          </div>
        ))}
      </div>
      <div className="pointer-events-none hidden items-center gap-1.5 px-1 text-[11px] text-muted-foreground sm:flex">
        <MousePointerClick className="size-3" />
        Click a node to explore · scroll to zoom · drag to reposition
      </div>
    </div>
  )
}
