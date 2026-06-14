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
        'fixed inset-0 z-[60] flex items-end justify-center p-0 transition-opacity duration-300 sm:items-center sm:p-4',
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
        className="absolute inset-0 bg-obsidian/60 backdrop-blur-sm"
      />

      {/* Panel */}
      <div
        className={cn(
          'relative w-full max-w-lg overflow-hidden border border-border bg-carbon transition-all duration-500 ease-fluid',
          open
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-4 scale-[0.98] opacity-0',
        )}
      >
        {saved ? (
          <SavedState />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <h2 className="text-[22px] font-normal leading-[1.2]">
                  Quick capture
                </h2>
                <p className="text-[13px] text-foreground/55">
                  Drop anything — ProJect YOU connects it for you.
                </p>
              </div>
              <button
                onClick={closeCapture}
                className="p-1.5 text-foreground/50 transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              {tabs.map((t) => {
                const Icon = t.icon
                const active = tab === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      'relative flex flex-1 items-center justify-center gap-1.5 px-2 py-3 text-[13px] tracking-tight transition-colors duration-300',
                      active
                        ? 'text-foreground'
                        : 'text-foreground/45 hover:text-foreground/80',
                    )}
                  >
                    <Icon className="size-3.5" />
                    {t.label}
                    {active && (
                      <span className="absolute inset-x-0 -bottom-px h-px bg-foreground" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Tab content */}
            <div className="px-6 py-5">
              <div key={tab} className="animate-fade-up">
                {tab === 'note' && (
                  <textarea
                    autoFocus
                    placeholder="Start writing a thought, an idea, anything worth remembering..."
                    className="h-40 w-full resize-none border border-border bg-background/40 p-3.5 text-[15px] leading-[1.5] outline-none transition-colors placeholder:text-foreground/40 focus:border-gunmetal"
                  />
                )}

                {tab === 'url' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <div className="flex flex-1 items-center gap-2 border border-border bg-background/40 px-3 transition-colors focus-within:border-gunmetal">
                        <Globe className="size-4 shrink-0 text-foreground/45" />
                        <input
                          value={url}
                          onChange={(e) => {
                            setUrl(e.target.value)
                            setShowPreview(false)
                          }}
                          placeholder="https://..."
                          className="w-full bg-transparent py-2.5 text-[15px] outline-none placeholder:text-foreground/40"
                        />
                      </div>
                      <button
                        onClick={() => url && setShowPreview(true)}
                        className="border border-border px-4 text-[13px] tracking-tight text-foreground transition-colors hover:border-gunmetal"
                      >
                        Fetch
                      </button>
                    </div>
                    {showPreview && (
                      <div className="animate-scale-in overflow-hidden border border-border bg-background/40">
                        <div className="h-24 bg-secondary" />
                        <div className="p-3.5">
                          <p className="truncate text-[15px]">
                            The Bitter Lesson — Rich Sutton
                          </p>
                          <p className="mt-1 line-clamp-2 text-[13px] text-foreground/55">
                            General methods that leverage computation are
                            ultimately the most effective.
                          </p>
                          <p className="mt-2 truncate text-[11px] text-gunmetal">
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
              <div className="mt-5">
                <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-foreground/45">
                  Tags
                </label>
                <div className="relative">
                  <div className="flex flex-wrap items-center gap-1.5 border border-border bg-background/40 p-2 transition-colors focus-within:border-gunmetal">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="flex items-center gap-1 border border-border px-2 py-0.5 text-[11px] text-foreground/80"
                      >
                        {t}
                        <button
                          onClick={() => setTags(tags.filter((x) => x !== t))}
                          className="text-foreground/50 hover:text-foreground"
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
                      className="min-w-24 flex-1 bg-transparent py-0.5 text-[15px] outline-none placeholder:text-foreground/40"
                    />
                  </div>
                  {suggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full animate-scale-in overflow-hidden border border-border bg-popover">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => addTag(s)}
                          className="block w-full px-3 py-2 text-left text-[13px] text-foreground/60 transition-colors hover:bg-secondary hover:text-foreground"
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
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <p className="text-[11px] text-foreground/45">
                Press{' '}
                <kbd className="border border-border px-1 text-[11px]">Esc</kbd>{' '}
                to close
              </p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 border border-foreground px-5 py-2.5 text-[14px] tracking-tight text-foreground transition-colors hover:border-gunmetal hover:text-gunmetal active:scale-[0.98] disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="size-3.5 animate-spin rounded-full border border-foreground/40 border-t-foreground" />
                    CONNECTING...
                  </>
                ) : (
                  'SAVE TO MEMORY'
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
    <div className="flex flex-col items-center justify-center gap-5 px-6 py-20 text-center">
      <div className="relative flex size-16 items-center justify-center">
        <span className="absolute inset-0 animate-pulse-ring rounded-full border border-foreground/30" />
        <div className="flex size-16 animate-scale-in items-center justify-center rounded-full border border-foreground">
          <Check className="size-7 text-foreground" />
        </div>
      </div>
      <div className="animate-fade-up">
        <h3 className="text-[22px] font-normal leading-[1.2]">
          Refracted into your graph
        </h3>
        <p className="mt-1.5 text-[14px] text-foreground/55">
          A new node is forming connections in your memory.
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
        'flex h-40 cursor-pointer flex-col items-center justify-center gap-2.5 border border-dashed transition-all duration-300',
        over
          ? 'border-gunmetal bg-gunmetal/5'
          : 'border-border bg-background/40 hover:border-foreground/50',
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
          'flex size-11 items-center justify-center border border-border transition-transform duration-300',
          over && 'scale-110',
        )}
      >
        <Upload className="size-5 text-foreground/55" />
      </div>
      {file ? (
        <p className="text-[13px] text-gunmetal">{file}</p>
      ) : (
        <>
          <p className="text-[15px] text-foreground">Drop a PDF here</p>
          <p className="text-[12px] text-foreground/45">or click to browse</p>
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
    <div className="flex h-40 flex-col items-center justify-center gap-5 border border-border bg-background/40">
      <div className="flex h-12 items-center gap-1">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'w-1 rounded-full transition-all',
              recording ? 'bg-foreground' : 'bg-border',
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
          'flex items-center gap-2 border px-5 py-2.5 text-[14px] tracking-tight transition-colors duration-300 active:scale-95',
          recording
            ? 'border-destructive text-destructive'
            : 'border-foreground text-foreground hover:border-gunmetal hover:text-gunmetal',
        )}
      >
        {recording ? (
          <>
            <Square className="size-3.5 fill-current" />
            STOP RECORDING
          </>
        ) : (
          <>
            <Mic className="size-4" />
            START RECORDING
          </>
        )}
      </button>
      <style>{`@keyframes mem-wave{to{transform:scaleY(1.6)}}`}</style>
    </div>
  )
}
