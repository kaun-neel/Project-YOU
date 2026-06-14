'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  nodes as seedNodes,
  edges as seedEdges,
  allTags as seedTags,
  type KnowledgeNode,
  type KnowledgeEdge,
} from '@/lib/mock-data'

interface CaptureContextValue {
  open: boolean
  openCapture: () => void
  closeCapture: () => void
  // live graph data
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
  tags: string[]
  addNode: (node: KnowledgeNode) => void
}

const CaptureContext = createContext<CaptureContextValue | null>(null)

export function CaptureProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [nodes, setNodes] = useState<KnowledgeNode[]>(seedNodes)
  const [edges, setEdges] = useState<KnowledgeEdge[]>(seedEdges)
  const [tags, setTags] = useState<string[]>(seedTags)

  const openCapture = useCallback(() => setOpen(true), [])
  const closeCapture = useCallback(() => setOpen(false), [])

  const addNode = useCallback((newNode: KnowledgeNode) => {
    setNodes((prev) => {
      // Connect new node to 1-2 existing nodes with shared tags
      const targets = prev
        .filter((n) => n.tags.some((t) => newNode.tags.includes(t)))
        .slice(0, 2)
        .map((n) => n.id)

      // If no shared tags, pick the most-connected node
      const fallback = targets.length === 0
        ? [prev.reduce((a, b) => (a.connections > b.connections ? a : b)).id]
        : []
      const connectTo = [...targets, ...fallback]

      setEdges((prev) => [
        ...prev,
        ...connectTo.map((tid) => ({
          source: newNode.id,
          target: tid,
          strength: 0.5 + Math.random() * 0.4,
        })),
      ])

      return [...prev, { ...newNode, connections: connectTo.length }]
    })

    // Merge any new tags
    setTags((prev) => {
      const next = [...prev]
      newNode.tags.forEach((t) => { if (!next.includes(t)) next.push(t) })
      return next
    })
  }, [])

  return (
    <CaptureContext.Provider value={{ open, openCapture, closeCapture, nodes, edges, tags, addNode }}>
      {children}
    </CaptureContext.Provider>
  )
}

export function useCapture() {
  const ctx = useContext(CaptureContext)
  if (!ctx) throw new Error('useCapture must be used within CaptureProvider')
  return ctx
}
