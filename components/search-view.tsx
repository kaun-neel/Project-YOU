'use client'

import { useEffect, useRef, useState } from 'react'
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
      {/* History rail */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border lg:flex">
        <div className="p-4">
          <button
            onClick={() => {
              setMessages([])
              handledInitial.current = true
            }}
            className="flex w-full items-center gap-2 border border-border px-3 py-2.5 text-[14px] tracking-tight text-foreground/80 transition-colors hover:border-gunmetal hover:text-foreground"
          >
            <Plus className="size-4" />
            New chat
          </button>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto px-4 pb-4">
          <p className="px-1 pb-2 pt-2 text-[10px] uppercase tracking-[0.14em] text-foreground/40">
            Recent
          </p>
          {chatThreads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveThread(t.id)}
              className={cn(
                'group mb-0.5 flex w-full flex-col gap-0.5 px-2.5 py-2.5 text-left transition-colors',
                activeThread === t.id
                  ? 'border-l border-foreground bg-secondary/40'
                  : 'border-l border-transparent hover:bg-secondary/30',
              )}
            >
              <span className="flex items-center gap-2 truncate text-[13px] text-foreground/85">
                <MessageSquareText className="size-3.5 shrink-0 text-foreground/45" />
                <span className="truncate">{t.title}</span>
              </span>
              <span className="pl-5 text-[10px] text-foreground/40">
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
            <div className="mx-auto flex max-w-2xl flex-col gap-7 px-5 py-10 sm:px-6">
              {messages.map((m) =>
                m.role === 'user' ? (
                  <div key={m.id} className="animate-fade-up flex justify-end">
                    <div className="max-w-[85%] border border-border bg-secondary/40 px-4 py-2.5 text-[15px] text-foreground">
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
        <div className="border-t border-border px-5 py-4 sm:px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="mx-auto flex max-w-2xl items-end gap-2 border border-border bg-background px-3.5 py-2.5 transition-colors focus-within:border-gunmetal"
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
              className="max-h-32 w-full resize-none bg-transparent py-1 text-[15px] outline-none placeholder:text-foreground/40"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="flex size-9 shrink-0 items-center justify-center border border-foreground text-foreground transition-all hover:border-gunmetal hover:text-gunmetal active:scale-95 disabled:opacity-30"
            >
              <ArrowUp className="size-4" />
            </button>
          </form>
          <p className="mx-auto mt-2 max-w-2xl text-center text-[11px] tracking-tight text-foreground/40">
            ProJect YOU answers using only what you&apos;ve saved · responses cite your nodes
          </p>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-5 py-10 text-center">
      <p
        className="text-[15px] tracking-tight text-foreground/60"
        style={{ animation: 'mem-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}
      >
        A darkroom for the mind
      </p>
      <h1 className="text-heading mt-4 max-w-[16ch] font-normal text-foreground text-balance">
        Ask your <span className="font-bold">second brain</span>.
      </h1>
      <p className="animate-fade-up mt-4 max-w-md text-pretty text-[16px] leading-[1.5] text-foreground/65">
        ProJect YOU searches across everything you&apos;ve captured and answers
        with citations to your own notes.
      </p>
      <div className="mt-9 flex w-full max-w-md flex-col">
        {examplePrompts.map((p, i) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="animate-fade-up group flex items-center justify-between gap-3 border-b border-border py-4 text-left text-[16px] transition-colors hover:text-foreground"
            style={{ animationDelay: `${i * 80 + 150}ms` }}
          >
            <span className="text-foreground/80 transition-colors group-hover:text-foreground">
              {p}
            </span>
            <ArrowUp className="size-4 rotate-45 text-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
          </button>
        ))}
      </div>
    </div>
  )
}

function AssistantMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="animate-fade-up flex gap-3.5">
      <div className="mt-1 flex size-7 shrink-0 items-center justify-center border border-border text-[11px] text-foreground/70">
        Y
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[16px] leading-[1.5] text-foreground/90">
          {message.content}
        </p>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-4">
            <p className="mb-2.5 text-[11px] uppercase tracking-[0.14em] text-foreground/45">
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
                    className="group border border-border p-3 transition-colors hover:border-gunmetal"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="flex size-5 items-center justify-center"
                        style={{ background: `${meta.color}1f` }}
                      >
                        <Icon className="size-3" style={{ color: meta.color }} />
                      </span>
                      <span className="truncate text-[13px] font-medium text-foreground">
                        {node.title}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[12px] leading-[1.5] text-foreground/55">
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
    <div className="animate-fade-up flex gap-3.5">
      <div className="mt-1 flex size-7 shrink-0 items-center justify-center border border-border text-[11px] text-foreground/70">
        Y
      </div>
      <div className="flex items-center gap-1.5 py-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-foreground/55"
            style={{
              animation: `mem-dot 1.2s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
        <span className="ml-1.5 text-[13px] text-foreground/50">
          searching your graph
        </span>
      </div>
      <style>{`@keyframes mem-dot{0%,60%,100%{opacity:0.25;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}`}</style>
    </div>
  )
}
