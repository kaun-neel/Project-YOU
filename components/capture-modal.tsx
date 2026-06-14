'use client'

import { useEffect, useRef, useState } from 'react'
import {
  FileText,
  Link2,
  Upload,
  Mic,
  X,
  Check,
  Globe,
  Square,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCapture } from './capture-context'
import { allTags } from '@/lib/mock-data'

type Tab = 'note' | 'url' | 'pdf' | 'voice'

const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: 'note', label: 'Note', icon: FileText },
  { id: 'url', label: 'URL', icon: Link2 },
  { id: 'pdf', label: 'PDF', icon: Upload },
  { id: 'voice', label: 'Voice', icon: Mic },
]

export function CaptureModal() {
  const { open, closeCapture } = useCapture()
  const [tab, setTab] = useState<Tab>('note')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [url, setUrl] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [recording, setRecording] = useState(false)
  const [render, setRender] = useState(false)

  // Mount/unmount with exit animation
  useEffect(() => {
    if (open) {
      setRender(true)
      setSaved(false)
    }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeCapture()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closeCapture])

  const suggestions = allTags
    .filter(
      (t) =>
        tagInput.length > 0 &&
        t.toLowerCase().includes(tagInput.toLowerCase()) &&
        !tags.includes(t),
    )
    .slice(0, 5)

  function addTag(t: string) {
    const clean = t.trim().toLowerCase()
    if (clean && !tags.includes(clean)) setTags((prev) => [...prev, clean])
    setTagInput('')
  }

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => {
        closeCapture()
        // reset after close animation
        setTimeout(() => {
          setSaved(false)
          setTags([])
          setUrl('')
          setShowPreview(false)
          setTab('note')
        }, 250)
      }, 900)
    }, 900)
  }

  if (!render && !open) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-end justify-center p-0 transition-opacity duration-200 sm:items-center sm:p-4',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
      onTransitionEnd={() => {
        if (!open) setRender(false)
      }}
    >
      {/* Backdrop */}
      <button
        aria-label="Close capture"
        onClick={closeCapture}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
      />

      {/* Panel */}
      <div
        className={cn(
          'relative w-full max-w-lg overflow-hidden rounded-t-xl border border-border bg-card shadow-2xl shadow-black/40 transition-all duration-300 sm:rounded-xl',
          open
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-4 scale-[0.98] opacity-0',
        )}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
      >
        {saved ? (
          <SavedState />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="font-heading text-base font-semibold">
                  Quick capture
                </h2>
                <p className="text-xs text-muted-foreground">
                  Drop anything — Mem connects it for you.
                </p>
              </div>
              <button
                onClick={closeCapture}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-3 pt-3">
              {tabs.map((t) => {
                const Icon = t.icon
                const active = tab === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      'relative flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors duration-200',
                      active
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {active && (
                      <span className="absolute inset-0 -z-10 rounded-md bg-secondary" />
                    )}
                    <Icon className="size-3.5" />
                    {t.label}
                  </button>
                )
              })}
            </div>

            {/* Tab content */}
            <div className="px-5 py-4">
              <div key={tab} className="animate-fade-up">
                {tab === 'note' && (
                  <textarea
                    autoFocus
                    placeholder="Start writing a thought, an idea, anything worth remembering..."
                    className="h-40 w-full resize-none rounded-md border border-border bg-background/60 p-3 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
                  />
                )}

                {tab === 'url' && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-background/60 px-3 transition-colors focus-within:border-primary/50">
                        <Globe className="size-4 shrink-0 text-muted-foreground" />
                        <input
                          value={url}
                          onChange={(e) => {
                            setUrl(e.target.value)
                            setShowPreview(false)
                          }}
                          placeholder="https://..."
                          className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                        />
                      </div>
                      <button
                        onClick={() => url && setShowPreview(true)}
                        className="rounded-md border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                      >
                        Fetch
                      </button>
                    </div>
                    {showPreview && (
                      <div className="animate-scale-in overflow-hidden rounded-md border border-border bg-background/60">
                        <div className="h-24 bg-gradient-to-br from-primary/20 to-accent/15" />
                        <div className="p-3">
                          <p className="truncate text-sm font-medium">
                            The Bitter Lesson — Rich Sutton
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            General methods that leverage computation are
                            ultimately the most effective.
                          </p>
                          <p className="mt-1.5 truncate font-mono text-[10px] text-accent">
                            {url}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {tab === 'pdf' && <DropZone />}

                {tab === 'voice' && (
                  <VoiceRecorder
                    recording={recording}
                    onToggle={() => setRecording((r) => !r)}
                  />
                )}
              </div>

              {/* Tags */}
              <div className="mt-4">
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Tags
                </label>
                <div className="relative">
                  <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-background/60 p-2 transition-colors focus-within:border-primary/50">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="flex items-center gap-1 rounded bg-primary/15 px-2 py-0.5 font-mono text-[11px] text-primary"
                      >
                        {t}
                        <button
                          onClick={() =>
                            setTags(tags.filter((x) => x !== t))
                          }
                          className="text-primary/60 hover:text-primary"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault()
                          addTag(tagInput)
                        }
                      }}
                      placeholder={tags.length ? '' : 'Add tags, comma separated...'}
                      className="min-w-24 flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  {suggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full animate-scale-in overflow-hidden rounded-md border border-border bg-popover shadow-xl">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => addTag(s)}
                          className="block w-full px-3 py-1.5 text-left font-mono text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
              <p className="text-[11px] text-muted-foreground">
                Press{' '}
                <kbd className="rounded border border-border bg-secondary px-1 font-mono">
                  Esc
                </kbd>{' '}
                to close
              </p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <span className="size-3.5 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                    Connecting...
                  </>
                ) : (
                  'Save to knowledge base'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SavedState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="relative flex size-16 items-center justify-center">
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-accent/10" />
        <div className="flex size-16 animate-scale-in items-center justify-center rounded-full bg-accent/15 ring-1 ring-accent/40">
          <Check className="size-7 text-accent" />
        </div>
      </div>
      <div className="animate-fade-up">
        <h3 className="font-heading text-lg font-semibold">Added to your brain</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          A new node is forming connections in your graph.
        </p>
      </div>
    </div>
  )
}

function DropZone() {
  const [over, setOver] = useState(false)
  const [file, setFile] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        setFile(e.dataTransfer.files[0]?.name ?? 'document.pdf')
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed transition-all duration-200',
        over
          ? 'border-primary bg-primary/5'
          : 'border-border bg-background/60 hover:border-primary/40',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)}
      />
      <div
        className={cn(
          'flex size-11 items-center justify-center rounded-full bg-secondary transition-transform duration-200',
          over && 'scale-110',
        )}
      >
        <Upload className="size-5 text-muted-foreground" />
      </div>
      {file ? (
        <p className="font-mono text-xs text-accent">{file}</p>
      ) : (
        <>
          <p className="text-sm text-foreground">Drop a PDF here</p>
          <p className="text-xs text-muted-foreground">or click to browse</p>
        </>
      )}
    </div>
  )
}

function VoiceRecorder({
  recording,
  onToggle,
}: {
  recording: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-5 rounded-md border border-border bg-background/60">
      {/* Waveform */}
      <div className="flex h-12 items-center gap-1">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'w-1 rounded-full transition-all',
              recording ? 'bg-node-voice' : 'bg-border',
            )}
            style={{
              height: recording ? `${20 + Math.abs(Math.sin(i * 0.9)) * 70}%` : '20%',
              animation: recording
                ? `mem-wave 0.9s ease-in-out ${i * 0.04}s infinite alternate`
                : 'none',
            }}
          />
        ))}
      </div>
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 active:scale-95',
          recording
            ? 'bg-destructive/15 text-destructive ring-1 ring-destructive/40'
            : 'bg-node-voice/15 text-node-voice ring-1 ring-node-voice/40',
        )}
      >
        {recording ? (
          <>
            <Square className="size-3.5 fill-current" />
            Stop recording
          </>
        ) : (
          <>
            <Mic className="size-4" />
            Start recording
          </>
        )}
      </button>
      <style>{`@keyframes mem-wave{to{transform:scaleY(1.6)}}`}</style>
    </div>
  )
}
