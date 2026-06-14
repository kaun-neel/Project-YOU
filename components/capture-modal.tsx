'use client'

import { useEffect, useRef, useState } from 'react'
import {
  FileText,
  Link2,
  Upload,
  Mic,
  MicOff,
  X,
  Check,
  Globe,
  Square,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
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
  const { open, closeCapture, addNode } = useCapture()
  const [tab, setTab] = useState<Tab>('note')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [url, setUrl] = useState('')
  const [noteText, setNoteText] = useState('')
  const [pdfName, setPdfName] = useState<string | null>(null)
  const [voiceDuration, setVoiceDuration] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [urlFetching, setUrlFetching] = useState(false)
  const [urlMeta, setUrlMeta] = useState<{ title: string; description: string; image?: string | null; hostname: string } | null>(null)
  const [urlError, setUrlError] = useState<string | null>(null)
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

  async function handleFetchUrl() {
    if (!url.trim()) return
    setUrlFetching(true)
    setUrlError(null)
    setUrlMeta(null)
    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setUrlError(data.error || 'Could not fetch URL')
      } else {
        setUrlMeta(data)
        setShowPreview(true)
      }
    } catch {
      setUrlError('Network error. Please try again.')
    } finally {
      setUrlFetching(false)
    }
  }

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      // Build a meaningful title from the captured content
      const titleMap: Record<Tab, string> = {
        note: noteText.trim().slice(0, 60) || 'Untitled note',
        url: urlMeta?.title || url.trim() || 'Saved URL',
        pdf: pdfName ?? 'Uploaded PDF',
        voice: `Voice memo (${Math.floor(voiceDuration / 60)}:${String(voiceDuration % 60).padStart(2, '0')})`,
      }
      const summaryMap: Record<Tab, string> = {
        note: noteText.trim().slice(0, 200) || 'A thought captured from Quick Capture.',
        url: urlMeta?.description || `Saved from ${url.trim() || 'web'}`,
        pdf: `PDF document: ${pdfName ?? 'untitled'}`,
        voice: `Voice recording of ${voiceDuration}s captured from microphone.`,
      }
      addNode({
        id: `n-${Date.now()}`,
        title: titleMap[tab],
        type: tab,
        summary: summaryMap[tab],
        tags: tags.length > 0 ? tags : ['uncategorised'],
        source: tab === 'url' ? url : undefined,
        createdAt: new Date().toISOString().slice(0, 10),
        connections: 0,
      })
      setSaving(false)
      setSaved(true)
        setTimeout(() => {
          closeCapture()
          setTimeout(() => {
            setSaved(false)
            setTags([])
            setUrl('')
            setNoteText('')
            setPdfName(null)
            setVoiceDuration(0)
            setShowPreview(false)
            setUrlMeta(null)
            setUrlError(null)
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
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
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
                        onClick={handleFetchUrl}
                        disabled={!url.trim() || urlFetching}
                        className="border border-border px-4 text-[13px] tracking-tight text-foreground transition-colors hover:border-gunmetal disabled:opacity-50"
                      >
                        {urlFetching ? (
                          <span className="flex items-center gap-1.5">
                            <span className="size-3 animate-spin rounded-full border border-foreground/30 border-t-foreground" />
                            Fetching
                          </span>
                        ) : 'Fetch'}
                      </button>
                    </div>
                    {urlError && (
                      <p className="text-[12px] text-destructive/80">{urlError}</p>
                    )}
                    {showPreview && urlMeta && (
                      <div className="animate-scale-in overflow-hidden border border-border bg-background/40">
                        {urlMeta.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={urlMeta.image}
                            alt=""
                            className="h-28 w-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        )}
                        {!urlMeta.image && <div className="h-16 bg-secondary/60" />}
                        <div className="p-3.5">
                          <p className="truncate text-[15px] text-foreground">{urlMeta.title}</p>
                          {urlMeta.description && (
                            <p className="mt-1 line-clamp-2 text-[13px] text-foreground/55">{urlMeta.description}</p>
                          )}
                          <p className="mt-2 truncate text-[11px] text-gunmetal">{urlMeta.hostname}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {tab === 'pdf' && <DropZone onFile={setPdfName} />}

                {tab === 'voice' && <VoiceRecorder active={tab === 'voice'} onDuration={setVoiceDuration} />}
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

function DropZone({ onFile }: { onFile?: (name: string) => void }) {
  const [over, setOver] = useState(false)
  const [file, setFile] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(name: string) {
    setFile(name)
    onFile?.(name)
  }

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
        const name = e.dataTransfer.files[0]?.name ?? 'document.pdf'
        handleFile(name)
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
        onChange={(e) => {
          const name = e.target.files?.[0]?.name
          if (name) handleFile(name)
        }}
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

const BAR_COUNT = 40

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

type RecorderStatus =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'recorded'
  | 'denied'
  | 'blocked'

function VoiceRecorder({ active, onDuration }: { active: boolean; onDuration?: (seconds: number) => void }) {
  const [status, setStatus] = useState<RecorderStatus>('idle')
  const [time, setTime] = useState(0)
  const [levels, setLevels] = useState<number[]>(() =>
    Array.from({ length: BAR_COUNT }, () => 0),
  )
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)

  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)

  // Fully stop and release all audio resources.
  function teardown() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    recorderRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {})
    }
    audioCtxRef.current = null
    analyserRef.current = null
  }

  // Clean up when leaving the voice tab or unmounting.
  useEffect(() => {
    if (!active) {
      teardown()
      setStatus('idle')
      setTime(0)
      setPlaying(false)
    }
    return () => teardown()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  function visualize() {
    const analyser = analyserRef.current
    if (!analyser) return
    const data = new Uint8Array(analyser.frequencyBinCount)

    const tick = () => {
      analyser.getByteFrequencyData(data)
      const step = Math.floor(data.length / BAR_COUNT)
      const next: number[] = []
      for (let i = 0; i < BAR_COUNT; i++) {
        let sum = 0
        for (let j = 0; j < step; j++) sum += data[i * step + j]
        next.push(Math.min(1, sum / step / 180))
      }
      setLevels(next)
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()
  }

  async function startRecording() {
    // Clear any previous take.
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const AudioCtx =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      const ctx = new AudioCtx()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.7
      source.connect(analyser)
      analyserRef.current = analyser

      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })
        setAudioUrl(URL.createObjectURL(blob))
      }
      recorder.start()
      recorderRef.current = recorder

      setTime(0)
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000)
      setStatus('recording')
      visualize()
    } catch (err) {
      const name = (err as DOMException)?.name
      const inIframe =
        typeof window !== 'undefined' && window.self !== window.top
      // Inside the v0 preview the app runs in a cross-origin iframe whose
      // permissions policy blocks getUserMedia before the browser can prompt.
      // Opening in its own tab lets the real browser permission prompt appear.
      if (inIframe && name !== 'NotFoundError') {
        setStatus('blocked')
      } else {
        setStatus('denied')
      }
    }
  }

  function openInNewTab() {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank', 'noopener')
    }
  }

  function stopRecording() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {})
    }
    audioCtxRef.current = null
    analyserRef.current = null
    setLevels(Array.from({ length: BAR_COUNT }, () => 0))
    setStatus('recorded')
    onDuration?.(time)
  }

  function reset() {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setPlaying(false)
    setTime(0)
    setStatus('idle')
  }

  function togglePlay() {
    const el = audioElRef.current
    if (!el) return
    if (playing) {
      el.pause()
    } else {
      el.play()
    }
  }

  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-4 border border-border bg-background/40 px-6 py-5">
      {/* Timer */}
      <span
        className={cn(
          'font-mono text-[15px] tabular-nums transition-colors duration-300',
          status === 'recording'
            ? 'text-foreground'
            : status === 'recorded'
              ? 'text-gunmetal'
              : 'text-foreground/30',
        )}
      >
        {formatTime(time)}
      </span>

      {/* Live visualizer */}
      <div className="flex h-10 w-full max-w-xs items-center justify-center gap-[3px]">
        {levels.map((lvl, i) => (
          <span
            key={i}
            className={cn(
              'w-[3px] rounded-full transition-[height,background-color] duration-100',
              status === 'recording' ? 'bg-foreground' : 'bg-border',
            )}
            style={{
              height:
                status === 'recording'
                  ? `${Math.max(8, lvl * 100)}%`
                  : status === 'recorded'
                    ? '14%'
                    : '8%',
            }}
          />
        ))}
      </div>

      {/* Status / controls */}
      {status === 'blocked' ? (
        <div className="flex flex-col items-center gap-2.5 text-center">
          <p className="flex items-center gap-1.5 text-[13px] text-foreground/70">
            <MicOff className="size-4" />
            The preview can&apos;t reach your microphone
          </p>
          <button
            onClick={openInNewTab}
            className="flex items-center gap-2 border border-foreground px-5 py-2.5 text-[13px] tracking-tight text-foreground transition-colors hover:border-gunmetal hover:text-gunmetal active:scale-95"
          >
            <ExternalLink className="size-3.5" />
            OPEN IN NEW TAB
          </button>
          <button
            onClick={startRecording}
            className="text-[12px] text-foreground/50 underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Try again here
          </button>
        </div>
      ) : status === 'denied' ? (
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="flex items-center gap-1.5 text-[13px] text-destructive">
            <MicOff className="size-4" />
            Microphone access denied
          </p>
          <button
            onClick={startRecording}
            className="border border-foreground px-4 py-2 text-[13px] tracking-tight text-foreground transition-colors hover:border-gunmetal hover:text-gunmetal active:scale-95"
          >
            Try again
          </button>
        </div>
      ) : status === 'recorded' && audioUrl ? (
        <div className="flex items-center gap-2.5">
          <audio
            ref={audioElRef}
            src={audioUrl}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            className="hidden"
          />
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 border border-foreground px-5 py-2.5 text-[14px] tracking-tight text-foreground transition-colors hover:border-gunmetal hover:text-gunmetal active:scale-95"
          >
            {playing ? (
              <>
                <Pause className="size-3.5 fill-current" />
                PAUSE
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-current" />
                PLAY
              </>
            )}
          </button>
          <button
            onClick={reset}
            aria-label="Record again"
            className="flex items-center gap-2 border border-border px-4 py-2.5 text-[13px] tracking-tight text-foreground/70 transition-colors hover:border-foreground hover:text-foreground active:scale-95"
          >
            <RotateCcw className="size-3.5" />
            RETAKE
          </button>
        </div>
      ) : (
        <button
          onClick={status === 'recording' ? stopRecording : startRecording}
          disabled={status === 'requesting'}
          className={cn(
            'flex items-center gap-2 border px-5 py-2.5 text-[14px] tracking-tight transition-colors duration-300 active:scale-95 disabled:opacity-60',
            status === 'recording'
              ? 'border-destructive text-destructive'
              : 'border-foreground text-foreground hover:border-gunmetal hover:text-gunmetal',
          )}
        >
          {status === 'requesting' ? (
            <>
              <span className="size-3.5 animate-spin rounded-full border border-foreground/40 border-t-foreground" />
              ALLOW MIC ACCESS
            </>
          ) : status === 'recording' ? (
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
      )}

      <p className="h-4 text-[12px] text-foreground/45">
        {status === 'recording'
          ? 'Listening...'
          : status === 'requesting'
            ? 'Waiting for permission'
            : status === 'recorded'
              ? 'Review your recording'
              : status === 'denied'
                ? 'Enable mic in your browser settings'
                : status === 'blocked'
                  ? 'Open in a tab to grant microphone access'
                  : 'Click to speak'}
      </p>
    </div>
  )
}
