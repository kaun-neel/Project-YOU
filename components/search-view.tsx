'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ArrowUp,
  Plus,
  MessageSquareText,
  FileText,
  Link2,
  Upload,
  Mic,
} from 'lucide-react'
import {
  examplePrompts,
  chatThreads,
  nodes as seedNodes,
  nodeTypeMeta,
  type NodeType,
} from '@/lib/mock-data'
import { useCapture } from './capture-context'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const typeIcon: Record<NodeType, typeof FileText> = {
  note: FileText,
  url: Link2,
  pdf: Upload,
  voice: Mic,
}

function SearchViewInner() {
  const params = useSearchParams()
  const { nodes: capturedNodes } = useCapture()
  const [activeThread, setActiveThread] = useState('t1')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState<string>('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const handledInitial = useRef(false)
  const initialQ = params.get('q')

  // Use live captured nodes, falling back to seed data
  const liveNodes = capturedNodes.length > 0 ? capturedNodes : seedNodes

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, thinking])

  async function send(text: string) {
    const q = text.trim()
    if (!q || thinking) return

    setError('')
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: q }])
    setThinking(true)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, nodes: liveNodes }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      let fullContent = ''
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                fullContent += parsed.content
                setMessages((prev) => {
                  const lastMsg = prev[prev.length - 1]
                  if (lastMsg?.role === 'assistant') {
                    return [
                      ...prev.slice(0, -1),
                      { role: 'assistant', content: fullContent },
                    ]
                  }
                  return [...prev, { role: 'assistant', content: fullContent }]
                })
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(`Could not reach the AI. Please try again. (${message})`)
      console.error('[v0] Search error:', err)
    } finally {
      setThinking(false)
    }
  }

  useEffect(() => {
    if (initialQ && !handledInitial.current) {
      handledInitial.current = true
      send(initialQ)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ])

  const empty = messages.length === 0

  return (
    <div className="flex h-full">
      {/* History rail */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-foreground/10 bg-background/30 backdrop-blur-sm lg:flex">
        <div className="p-4">
          <button
            onClick={() => window.location.reload()}
            className="flex w-full items-center gap-2 border border-foreground/20 px-3 py-2.5 text-[14px] tracking-tight text-foreground/80 transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            <Plus className="size-4" />
            New chat
          </button>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto px-4 pb-4">
          {chatThreads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveThread(t.id)}
              className={cn(
                'mb-2 block w-full truncate rounded py-2 px-3 text-left text-[13px] transition-colors',
                activeThread === t.id
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-foreground/50 hover:text-foreground/80',
              )}
            >
              {t.title}
            </button>
          ))}
        </div>
      </aside>

      {/* Chat area */}
      <main className="relative flex flex-1 flex-col">
        {/* Messages */}
        <div
          ref={scrollRef}
          className="scroll-thin flex-1 overflow-y-auto space-y-6 p-6 sm:p-8"
        >
          {empty && (
            <div className="flex h-full flex-col items-center justify-center space-y-8 opacity-60">
              <MessageSquareText className="size-12" />
              <div className="text-center space-y-2">
                <p className="text-[14px] text-foreground/80">
                  Ask me about your captured knowledge
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                {examplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => send(prompt)}
                    className="border border-foreground/20 px-4 py-2.5 text-[12px] text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground hover:bg-foreground/5"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                'space-y-2',
                msg.role === 'user' ? 'flex justify-end' : 'flex justify-start',
              )}
            >
              <div
                className={cn(
                  'max-w-xl rounded-lg px-4 py-3 text-[14px] leading-[1.6]',
                  msg.role === 'user'
                    ? 'bg-foreground/10 text-foreground'
                    : 'bg-foreground/5 text-foreground/90',
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex gap-2 items-center text-foreground/60">
              <div className="size-2 rounded-full bg-foreground/60 animate-pulse" />
              <span className="text-[13px]">Thinking...</span>
            </div>
          )}

          {error && (
            <div className="border border-destructive/40 bg-destructive/10 rounded px-4 py-3 text-[13px] text-destructive/90">
              {error}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-foreground/10 p-4 sm:p-6">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send(input)
                }
              }}
              placeholder="Ask about your knowledge..."
              disabled={thinking}
              className="flex-1 bg-foreground/5 border border-foreground/20 rounded px-4 py-3 text-[14px] placeholder:text-foreground/40 focus:outline-none focus:border-foreground/40 transition-colors disabled:opacity-50"
            />
            <button
              onClick={() => send(input)}
              disabled={thinking || !input.trim()}
              className="flex size-10 items-center justify-center rounded border border-foreground/20 text-foreground/60 transition-all hover:border-foreground/40 hover:text-foreground disabled:opacity-50"
            >
              <ArrowUp className="size-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export function SearchView() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><div className="size-5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground/70" /></div>}>
      <SearchViewInner />
    </Suspense>
  )
}
