'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import {
  nodes as allNodes,
  edges as allEdges,
  nodeTypeMeta,
  type KnowledgeNode,
  type NodeType,
} from '@/lib/mock-data'

interface SimNode extends KnowledgeNode {
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}
interface SimLink {
  source: SimNode | string
  target: SimNode | string
  strength: number
}

interface Props {
  selectedId?: string | null
  onSelect?: (node: KnowledgeNode | null) => void
  activeTypes?: NodeType[] | null
  activeTag?: string | null
}

export function KnowledgeGraph({
  selectedId,
  onSelect,
  activeTypes,
  activeTag,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const selectedRef = useRef<string | null | undefined>(selectedId)
  const filterRef = useRef({ activeTypes, activeTag })

  selectedRef.current = selectedId
  filterRef.current = { activeTypes, activeTag }

  useEffect(() => {
    const container = containerRef.current
    const svgEl = svgRef.current
    if (!container || !svgEl) return

    let width = container.clientWidth
    let height = container.clientHeight

    const svg = d3.select(svgEl)
    svg.selectAll('*').remove()

    const root = svg.append('g')

    // ── defs: glow filter ──
    const defs = svg.append('defs')
    const glow = defs
      .append('filter')
      .attr('id', 'node-glow')
      .attr('x', '-60%')
      .attr('y', '-60%')
      .attr('width', '220%')
      .attr('height', '220%')
    glow.append('feGaussianBlur').attr('stdDeviation', 3).attr('result', 'blur')
    const merge = glow.append('feMerge')
    merge.append('feMergeNode').attr('in', 'blur')
    merge.append('feMergeNode').attr('in', 'SourceGraphic')

    const linkGroup = root.append('g').attr('class', 'links')
    const nodeGroup = root.append('g').attr('class', 'nodes')

    const simNodes: SimNode[] = allNodes.map((n) => ({ ...n }))
    const simLinks: SimLink[] = allEdges.map((e) => ({ ...e }))

    const sim = d3
      .forceSimulation<SimNode>(simNodes)
      .force(
        'link',
        d3
          .forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance((d) => 70 + (1 - d.strength) * 90)
          .strength((d) => d.strength * 0.6),
      )
      .force('charge', d3.forceManyBody().strength(-340))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collide',
        d3.forceCollide<SimNode>().radius((d) => radius(d) + 10),
      )

    function radius(d: SimNode) {
      return 7 + d.connections * 1.7
    }

    // ── Links ──
    const link = linkGroup
      .selectAll('line')
      .data(simLinks)
      .join('line')
      .attr('stroke', 'var(--node-url)')
      .attr('stroke-opacity', (d) => 0.12 + d.strength * 0.18)
      .attr('stroke-width', (d) => 0.5 + d.strength * 1.5)

    // ── Nodes ──
    const node = nodeGroup
      .selectAll<SVGGElement, SimNode>('g')
      .data(simNodes)
      .join('g')
      .attr('class', 'node-g')
      .style('cursor', 'pointer')

    // pulse halo
    node
      .append('circle')
      .attr('class', 'halo')
      .attr('r', (d) => radius(d))
      .attr('fill', (d) => nodeTypeMeta[d.type].color)
      .attr('opacity', 0.18)

    // main circle
    node
      .append('circle')
      .attr('class', 'core')
      .attr('r', (d) => radius(d))
      .attr('fill', (d) => nodeTypeMeta[d.type].color)
      .attr('filter', 'url(#node-glow)')
      .attr('stroke', 'var(--background)')
      .attr('stroke-width', 1.5)

    // labels
    node
      .append('text')
      .attr('class', 'label')
      .text((d) => d.title)
      .attr('x', (d) => radius(d) + 6)
      .attr('y', 4)
      .attr('font-size', 11)
      .attr('font-family', 'var(--font-sans)')
      .attr('fill', 'var(--foreground)')
      .attr('opacity', 0.001)
      .style('pointer-events', 'none')

    // gentle float pulse
    node
      .select('.halo')
      .style('animation', (_, i) => `mem-node-pulse 3.2s ease-in-out ${i * 0.2}s infinite`)

    node.on('click', (event, d) => {
      event.stopPropagation()
      onSelect?.(d)
    })

    node.on('mouseenter', function (_, d) {
      d3.select(this).select<SVGTextElement>('.label').transition().duration(200).attr('opacity', 1)
      highlightNeighbors(d.id)
    })
    node.on('mouseleave', function () {
      applyState()
    })

    svg.on('click', () => onSelect?.(null))

    // drag
    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on('start', (event, d) => {
        if (!event.active) sim.alphaTarget(0.25).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) sim.alphaTarget(0)
        d.fx = null
        d.fy = null
      })
    node.call(drag)

    // zoom / pan
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => root.attr('transform', event.transform))
    svg.call(zoom)

    function neighborsOf(id: string) {
      const set = new Set<string>([id])
      simLinks.forEach((l) => {
        const s = (l.source as SimNode).id ?? (l.source as string)
        const t = (l.target as SimNode).id ?? (l.target as string)
        if (s === id) set.add(t)
        if (t === id) set.add(s)
      })
      return set
    }

    function passesFilter(d: SimNode) {
      const { activeTypes, activeTag } = filterRef.current
      if (activeTypes && activeTypes.length && !activeTypes.includes(d.type))
        return false
      if (activeTag && !d.tags.includes(activeTag)) return false
      return true
    }

    function highlightNeighbors(id: string) {
      const set = neighborsOf(id)
      node
        .transition()
        .duration(180)
        .style('opacity', (d) => (set.has(d.id) ? 1 : 0.18))
      link
        .transition()
        .duration(180)
        .attr('stroke-opacity', (l) => {
          const s = (l.source as SimNode).id
          const t = (l.target as SimNode).id
          return s === id || t === id ? 0.6 : 0.04
        })
        .attr('stroke', (l) => {
          const s = (l.source as SimNode).id
          const t = (l.target as SimNode).id
          return s === id || t === id ? 'var(--primary)' : 'var(--node-url)'
        })
    }

    function applyState() {
      const sel = selectedRef.current
      const focusSet = sel ? neighborsOf(sel) : null

      node
        .transition()
        .duration(220)
        .style('opacity', (d) => {
          if (!passesFilter(d)) return 0.06
          if (focusSet) return focusSet.has(d.id) ? 1 : 0.2
          return 1
        })

      node
        .select('.core')
        .transition()
        .duration(220)
        .attr('stroke', (d) =>
          sel === d.id ? 'var(--primary)' : 'var(--background)',
        )
        .attr('stroke-width', (d) => (sel === d.id ? 3 : 1.5))

      node
        .select<SVGTextElement>('.label')
        .transition()
        .duration(220)
        .attr('opacity', (d) => {
          if (sel === d.id) return 1
          if (!passesFilter(d)) return 0.001
          return 0.001
        })

      link
        .transition()
        .duration(220)
        .attr('stroke-opacity', (l) => {
          const s = (l.source as SimNode).id
          const t = (l.target as SimNode).id
          const visible = passesFilter(l.source as SimNode) && passesFilter(l.target as SimNode)
          if (!visible) return 0.02
          if (sel) return s === sel || t === sel ? 0.6 : 0.05
          return 0.12 + l.strength * 0.18
        })
        .attr('stroke', (l) => {
          const s = (l.source as SimNode).id
          const t = (l.target as SimNode).id
          return sel && (s === sel || t === sel)
            ? 'var(--primary)'
            : 'var(--node-url)'
        })
    }

    // expose applyState for prop-driven updates
    ;(svgEl as unknown as { __apply: () => void }).__apply = applyState

    sim.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as SimNode).x!)
        .attr('y1', (d) => (d.source as SimNode).y!)
        .attr('x2', (d) => (d.target as SimNode).x!)
        .attr('y2', (d) => (d.target as SimNode).y!)
      node.attr('transform', (d) => `translate(${d.x},${d.y})`)
    })

    // resize
    const ro = new ResizeObserver(() => {
      width = container.clientWidth
      height = container.clientHeight
      sim.force('center', d3.forceCenter(width / 2, height / 2))
      sim.alpha(0.3).restart()
    })
    ro.observe(container)

    applyState()

    return () => {
      sim.stop()
      ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-apply visual state when selection / filters change
  useEffect(() => {
    const svgEl = svgRef.current as unknown as { __apply?: () => void } | null
    svgEl?.__apply?.()
  }, [selectedId, activeTypes, activeTag])

  return (
    <div ref={containerRef} className="relative size-full">
      <svg ref={svgRef} className="size-full touch-none" />
      <style>{`
        @keyframes mem-node-pulse {
          0%, 100% { transform: scale(1); opacity: 0.16; }
          50% { transform: scale(1.45); opacity: 0.28; }
        }
        .halo { transform-box: fill-box; transform-origin: center; }
      `}</style>
    </div>
  )
}
