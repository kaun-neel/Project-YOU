'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Sparkles,
  ArrowUp,
  Plus,
  MessageSquareText,
  FileText,
  Link2,
  Upload,
  Mic,
} from 'lucide-react'
import {
  mockAnswer,
  examplePrompts,
  chatThreads,
  nodes,
  nodeTypeMeta,
  type ChatMessage,
  type NodeType,
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const typeIcon: Record<NodeType, typeof FileText> = {
  note: FileText,
  url: Link2,
  pdf: Upload,
  voice: Mic,
}

export function SearchView() {
  const params = useSearchParams()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [activeThread, setActiveThread] = useState('t1')
  const scrollRef = useRef<HTMLDivElement>(null)
  const initialQ = params.get('q')
  const handledInitial = useRef(false)

  function send(text: string) {
    const q = text.trim()
    if (!q || thinking) return
    setInput('')
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: q,
    }
    setMessages((prev) => [...prev, userMsg])
    setThinking(true)

    setTimeout(() => {
      const { content, sources } = mockAnswer(q)
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content, sources },
      ])
      setThinking(false)
    }, 1100)
  }

  // Seed from ?q=
  useEffect(() => {
    if (initialQ && !handledInitial.current) {
      handledInitial.current = true
      send(initialQ)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, thinking])

  const empty = messages.length === 0

  return (
    <div className="flex h-full">
      {/* Chat history rail */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card/40 lg:flex">
        <div className="p-3">
          <button
            onClick={() => {
              setMessages([])
              handledInitial.current = true
            }}
            className="flex w-full items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
          >
            <Plus className="size-4" />
            New chat
          </button>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto px-3 pb-3">
          <p className="px-1 pb-1.5 pt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Recent
          </p>
          {chatThreads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveThread(t.id)}
              className={cn(
                'group mb-0.5 flex w-full flex-col gap-0.5 rounded-md px-2.5 py-2 text-left transition-colors',
                activeThread === t.id
                  ? 'bg-secondary'
                  : 'hover:bg-secondary/60',
              )}
            >
              <span className="flex items-center gap-2 truncate text-xs text-foreground/90">
                <MessageSquareText className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{t.title}</span>
              </span>
              <span className="pl-5 text-[10px] text-muted-foreground">
                {t.updatedAt}
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* Conversation */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div ref={scrollRef} className="scroll-thin flex-1 overflow-y-auto">
          {empty && !thinking ? (
            <EmptyState onPick={send} />
          ) : (
            <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6">
              {messages.map((m) =>
                m.role === 'user' ? (
                  <div
                    key={m.id}
                    className="animate-fade-up flex justify-end"
                  >
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <AssistantMessage key={m.id} message={m} />
                ),
              )}
              {thinking && <ThinkingBubble />}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="mx-auto flex max-w-2xl items-end gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 transition-colors focus-within:border-primary/50"
          >
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send(input)
                }
              }}
              placeholder="Ask your knowledge base anything..."
              className="max-h-32 w-full resize-none bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:brightness-110 active:scale-95 disabled:opacity-40"
            >
              <ArrowUp className="size-4" />
            </button>
          </form>
          <p className="mx-auto mt-1.5 max-w-2xl text-center text-[11px] text-muted-foreground">
            Mem answers using only what you&apos;ve saved · responses cite your nodes
          </p>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-10 text-center">
      <div className="animate-scale-in flex size-14 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
        <Sparkles className="size-6 text-primary" />
      </div>
      <h1 className="animate-fade-up mt-5 font-heading text-2xl font-semibold tracking-tight">
        Ask your second brain
      </h1>
      <p className="animate-fade-up mt-1.5 max-w-md text-pretty text-sm text-muted-foreground">
        Mem searches across everything you&apos;ve captured and answers with
        citations to your own notes.
      </p>
      <div className="mt-7 flex w-full max-w-md flex-col gap-2">
        {examplePrompts.map((p, i) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="animate-fade-up group flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left text-sm transition-all duration-200 hover:border-primary/40 hover:bg-secondary"
            style={{ animationDelay: `${i * 70 + 100}ms` }}
          >
            <span className="text-foreground/90">{p}</span>
            <ArrowUp className="size-4 rotate-45 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
          </button>
        ))}
      </div>
    </div>
  )
}

function AssistantMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="animate-fade-up flex gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
        <Sparkles className="size-3.5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed text-foreground/90">
          {message.content}
        </p>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Sources used
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {message.sources.map((s) => {
                const node = nodes.find((n) => n.id === s.nodeId)
                if (!node) return null
                const meta = nodeTypeMeta[node.type]
                const Icon = typeIcon[node.type]
                return (
                  <div
                    key={s.nodeId}
                    className="group rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="flex size-5 items-center justify-center rounded"
                        style={{ background: `${meta.color}22` }}
                      >
                        <Icon className="size-3" style={{ color: meta.color }} />
                      </span>
                      <span className="truncate text-xs font-medium text-foreground">
                        {node.title}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                      {s.snippet}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ThinkingBubble() {
  return (
    <div className="animate-fade-up flex gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
        <Sparkles className="size-3.5 animate-pulse text-primary" />
      </div>
      <div className="flex items-center gap-1.5 py-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-muted-foreground"
            style={{
              animation: `mem-dot 1.2s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
        <span className="ml-1 text-xs text-muted-foreground">
          searching your graph
        </span>
      </div>
      <style>{`@keyframes mem-dot{0%,60%,100%{opacity:0.25;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}`}</style>
    </div>
  )
}
