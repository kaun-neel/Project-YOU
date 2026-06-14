'use client'

import { useState } from 'react'
import { X, User, Sliders, Brain, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCapture } from './capture-context'

const INPUT_LIMIT = 100

type SettingsTab = 'user' | 'preferences' | 'mind'

const TONE_OPTIONS = ['Concise', 'Detailed', 'Socratic', 'Casual'] as const
const STYLE_OPTIONS = ['Analytical', 'Narrative', 'Bullet points', 'Step-by-step'] as const

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
  user?: { userId: string; email: string; name: string } | null
}

export function SettingsPanel({ open, onClose, user }: SettingsPanelProps) {
  const { nodes } = useCapture()
  const [tab, setTab] = useState<SettingsTab>('user')
  const [tone, setTone] = useState<string>('Concise')
  const [style, setStyle] = useState<string>('Analytical')
  const [customInstruction, setCustomInstruction] = useState('')

  const usedCount = nodes.length
  const pct = Math.min(100, Math.round((usedCount / INPUT_LIMIT) * 100))

  const initials = user?.name
    ? user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <>
      {/* Backdrop */}
      {open && (
        <button
          onClick={onClose}
          className="fixed inset-0 z-40 bg-obsidian/40 backdrop-blur-[2px]"
          aria-label="Close settings"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-border/60 bg-background shadow-2xl transition-transform duration-500 ease-fluid',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
          <span className="text-[13px] uppercase tracking-[0.12em] text-foreground/60">
            Settings
          </span>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center text-foreground/40 transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tab nav */}
        <div className="flex border-b border-border/40">
          {([
            { id: 'user', icon: User, label: 'Account' },
            { id: 'preferences', icon: Sliders, label: 'Preferences' },
            { id: 'mind', icon: Brain, label: 'Mind Limit' },
          ] as { id: SettingsTab; icon: typeof User; label: string }[]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-3 text-[11px] tracking-wide transition-colors',
                tab === id
                  ? 'border-b-2 border-foreground text-foreground'
                  : 'border-b-2 border-transparent text-foreground/45 hover:text-foreground/70',
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scroll-thin">
          {tab === 'user' && (
            <div className="px-5 py-6 space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-[18px] font-medium text-foreground">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[16px] font-medium text-foreground">
                    {user?.name || 'Anonymous'}
                  </p>
                  <p className="truncate text-[13px] text-foreground/55">
                    {user?.email || '—'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <InfoRow label="Name" value={user?.name || '—'} />
                <InfoRow label="Email" value={user?.email || '—'} />
                <InfoRow
                  label="Profile URL"
                  value={user?.name
                    ? `projectyou.app/${user.name.toLowerCase().replace(/\s+/g, '-')}`
                    : '—'}
                />
                <InfoRow label="Member since" value="June 2026" />
              </div>

              <button className="w-full border border-destructive/50 px-4 py-2.5 text-[13px] text-destructive/80 transition-colors hover:border-destructive hover:text-destructive">
                Sign out
              </button>
            </div>
          )}

          {tab === 'preferences' && (
            <div className="px-5 py-6 space-y-7">
              <div>
                <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-foreground/45">
                  AI Response Tone
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {TONE_OPTIONS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={cn(
                        'border px-3 py-2.5 text-[13px] text-left transition-colors',
                        tone === t
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border text-foreground/60 hover:border-foreground/50 hover:text-foreground',
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-foreground/45">
                  AI Response Style
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {STYLE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={cn(
                        'border px-3 py-2.5 text-[13px] text-left transition-colors',
                        style === s
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border text-foreground/60 hover:border-foreground/50 hover:text-foreground',
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-foreground/45">
                  Custom instructions
                </p>
                <textarea
                  rows={4}
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  placeholder="e.g. Always cite sources. Prefer short answers. Use first-principles reasoning..."
                  className="w-full resize-none border border-border bg-background/40 p-3 text-[13px] leading-[1.5] text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-foreground/40"
                />
              </div>

              <button className="w-full border border-foreground px-4 py-2.5 text-[13px] tracking-tight text-foreground transition-colors hover:border-gunmetal hover:text-gunmetal">
                Save preferences
              </button>
            </div>
          )}

          {tab === 'mind' && (
            <div className="px-5 py-6 space-y-6">
              <div>
                <p className="text-[13px] text-foreground/55 leading-[1.6]">
                  Your memory has a limit of{' '}
                  <span className="text-foreground font-medium">{INPUT_LIMIT} inputs</span>.
                  Each note, PDF, URL, or voice memo counts as one input.
                </p>
              </div>

              {/* Meter */}
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <span className="text-[32px] font-bold leading-none text-foreground">
                    {usedCount}
                  </span>
                  <span className="text-[14px] text-foreground/40">/ {INPUT_LIMIT}</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden bg-border/40">
                  <div
                    className={cn(
                      'absolute inset-y-0 left-0 transition-all duration-700',
                      pct >= 90 ? 'bg-destructive' : pct >= 70 ? 'bg-gunmetal' : 'bg-foreground',
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[12px] text-foreground/45">
                  {INPUT_LIMIT - usedCount} inputs remaining
                </p>
              </div>

              {/* Breakdown */}
              <div className="space-y-1 border-t border-border/40 pt-4">
                <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-foreground/45">
                  Breakdown
                </p>
                {(['note', 'url', 'pdf', 'voice'] as const).map((type) => {
                  const count = nodes.filter((n) => n.type === type).length
                  return (
                    <div key={type} className="flex items-center justify-between py-1.5">
                      <span className="text-[13px] capitalize text-foreground/70">{type}</span>
                      <span className="text-[13px] text-foreground">{count}</span>
                    </div>
                  )
                })}
              </div>

              {pct >= 80 && (
                <div className="border border-destructive/40 bg-destructive/10 px-4 py-3">
                  <p className="text-[13px] text-destructive/90">
                    {pct >= 100
                      ? 'Memory full. Remove some inputs to add new ones.'
                      : `You are at ${pct}% capacity. Consider archiving older inputs.`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/30 py-2.5">
      <span className="text-[12px] uppercase tracking-[0.1em] text-foreground/45 shrink-0">{label}</span>
      <span className="text-[13px] text-foreground/80 text-right break-all">{value}</span>
    </div>
  )
}
