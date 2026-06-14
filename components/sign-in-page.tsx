'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WaveText } from '@/components/ui/wave-text'

type Mode = 'signin' | 'signup'

// ─── tiny hook ────────────────────────────────────────────────────────────────
function useField(initial = '') {
  const [value, setValue] = useState(initial)
  const [touched, setTouched] = useState(false)
  return {
    value,
    touched,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    onBlur: () => setTouched(true),
    reset: () => { setValue(initial); setTouched(false) },
  }
}

// ─── Input ─────────────────────────────────────────────────────────────────
function Field({
  label,
  type = 'text',
  placeholder,
  autoComplete,
  error,
  ...rest
}: {
  label: string
  type?: string
  placeholder?: string
  autoComplete?: string
  error?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (show ? 'text' : 'password') : type

  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] tracking-[0.08em] uppercase text-white/40">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(
            'w-full rounded-lg border bg-white/[0.05] px-4 py-3 text-[15px] text-white placeholder:text-white/20 focus:outline-none transition-colors duration-200',
            error
              ? 'border-red-500/60 focus:border-red-400'
              : 'border-white/10 focus:border-white/35',
            isPassword && 'pr-11',
          )}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
            tabIndex={-1}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-[12px] text-red-400">{error}</p>
      )}
    </div>
  )
}

// ─── Left decorative panel ─────────────────────────────────────────────────
function LeftPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    let t = 0

    function resize() {
      canvas!.width = canvas!.offsetWidth * window.devicePixelRatio
      canvas!.height = canvas!.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const STAR_COUNT = 260
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.3,
      speed: Math.random() * 0.00008 + 0.00003,
      phase: Math.random() * Math.PI * 2,
    }))

    function draw() {
      const w = canvas!.offsetWidth
      const h = canvas!.offsetHeight
      ctx.clearRect(0, 0, w, h)

      // Deep space gradient bg
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, h * 0.9)
      bg.addColorStop(0, '#151c2e')
      bg.addColorStop(0.5, '#0c1220')
      bg.addColorStop(1, '#07090f')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // Nebula smears
      const nebulas = [
        { cx: 0.3, cy: 0.25, rx: 0.28, ry: 0.18, color: 'rgba(60,90,180,0.08)' },
        { cx: 0.72, cy: 0.55, rx: 0.22, ry: 0.15, color: 'rgba(90,55,155,0.07)' },
        { cx: 0.5, cy: 0.75, rx: 0.35, ry: 0.14, color: 'rgba(30,110,140,0.06)' },
      ]
      nebulas.forEach(({ cx, cy, rx, ry, color }) => {
        const g = ctx.createRadialGradient(cx * w, cy * h, 0, cx * w, cy * h, Math.max(rx * w, ry * h))
        g.addColorStop(0, color)
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.ellipse(cx * w, cy * h, rx * w, ry * h, 0, 0, Math.PI * 2)
        ctx.fill()
      })

      // Stars
      stars.forEach((s) => {
        const blink = 0.55 + 0.45 * Math.sin(t * 0.6 + s.phase)
        ctx.globalAlpha = blink * (0.5 + s.r * 0.3)
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1

      // Floating prism glyph
      const cx = w * 0.5, cy = h * 0.42
      const sz = Math.min(w, h) * 0.22
      const rot = t * 0.25
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rot)

      // Outer ring glow
      const ring = ctx.createRadialGradient(0, 0, sz * 0.6, 0, 0, sz * 1.1)
      ring.addColorStop(0, 'rgba(100,140,220,0.10)')
      ring.addColorStop(1, 'transparent')
      ctx.fillStyle = ring
      ctx.beginPath(); ctx.arc(0, 0, sz * 1.1, 0, Math.PI * 2); ctx.fill()

      // Triangular prism
      const pts = [
        [0, -sz],
        [sz * 0.866, sz * 0.5],
        [-sz * 0.866, sz * 0.5],
      ]
      ctx.beginPath()
      ctx.moveTo(pts[0][0], pts[0][1])
      pts.slice(1).forEach(([x, y]) => ctx.lineTo(x, y))
      ctx.closePath()
      const prismGrad = ctx.createLinearGradient(-sz, -sz, sz, sz)
      prismGrad.addColorStop(0, 'rgba(200,215,255,0.22)')
      prismGrad.addColorStop(0.5, 'rgba(120,160,230,0.10)')
      prismGrad.addColorStop(1, 'rgba(80,110,190,0.18)')
      ctx.fillStyle = prismGrad
      ctx.fill()
      ctx.strokeStyle = 'rgba(180,200,255,0.35)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Inner lines
      ctx.globalAlpha = 0.18
      ctx.strokeStyle = '#a0b8ff'
      ctx.lineWidth = 0.8
      ctx.beginPath(); ctx.moveTo(0, -sz); ctx.lineTo(0, sz * 0.5); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(sz * 0.866, sz * 0.5); ctx.lineTo(-sz * 0.433, -sz * 0.25); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(-sz * 0.866, sz * 0.5); ctx.lineTo(sz * 0.433, -sz * 0.25); ctx.stroke()
      ctx.globalAlpha = 1

      ctx.restore()

      t += 0.008
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="relative hidden h-full flex-col justify-between overflow-hidden md:flex" style={{ background: '#07090f' }}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Overlay content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-10">
        <span className="select-none text-[17px] font-normal tracking-tight text-white/70">
          ProJect <span className="font-bold text-white">YOU</span>
        </span>

        <div className="space-y-4">
          <WaveText
            text="Your memory,"
            className="block text-[2.8rem] font-bold leading-[1.05] tracking-tight text-white"
          />
          <WaveText
            text="finally organised."
            className="block text-[2.8rem] font-bold leading-[1.05] tracking-tight text-white/50"
          />
          <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-white/35">
            Capture anything. Find everything. Let the graph connect the dots
            between your thoughts, papers, and voice memos.
          </p>
        </div>

        <p className="text-[12px] text-white/20">
          &copy; {new Date().getFullYear()} ProJect YOU
        </p>
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────
export function SignInPage({
  className,
  onSuccess,
}: {
  className?: string
  onSuccess?: () => void
}) {
  const [mode, setMode] = useState<Mode>('signin')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)

  // Sign-in fields
  const siEmail = useField()
  const siPassword = useField()

  // Sign-up fields
  const suName = useField()
  const suEmail = useField()
  const suPassword = useField()
  const suConfirm = useField()

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (mode === 'signin') {
      if (!siEmail.value) e.siEmail = 'Required'
      if (!siPassword.value) e.siPassword = 'Required'
    } else {
      if (!suName.value.trim()) e.suName = 'Required'
      if (!suEmail.value) e.suEmail = 'Required'
      if (suPassword.value.length < 8) e.suPassword = 'At least 8 characters'
      if (suConfirm.value !== suPassword.value) e.suConfirm = 'Passwords do not match'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError(null)
    if (!validate()) return
    setLoading(true)

    try {
      const endpoint = mode === 'signin' ? '/api/auth/signin' : '/api/auth/signup'
      const body =
        mode === 'signin'
          ? { email: siEmail.value, password: siPassword.value }
          : { email: suEmail.value, name: suName.value, password: suPassword.value }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) {
        setApiError(data.error || 'Something went wrong.')
        setLoading(false)
        return
      }

      // Success — animate out
      setLeaving(true)
      setTimeout(() => onSuccess?.(), 750)
    } catch {
      setApiError('Network error. Please try again.')
      setLoading(false)
    }
  }

  function switchMode(next: Mode) {
    setMode(next)
    setErrors({})
    setApiError(null)
    siEmail.reset(); siPassword.reset()
    suName.reset(); suEmail.reset(); suPassword.reset(); suConfirm.reset()
  }

  return (
    <div
      className={cn(
        'relative flex h-dvh w-full overflow-hidden transition-[opacity,transform,filter] duration-700',
        leaving && 'scale-105 opacity-0 blur-lg',
        className,
      )}
      style={{ background: '#0d0d14' }}
    >
      {/* ── Responsive 2-col grid ── */}
      <div className="grid h-full w-full md:grid-cols-[1fr_1fr] lg:grid-cols-[1.1fr_0.9fr]">

        {/* Left — decorative canvas */}
        <LeftPanel />

        {/* Right — form */}
        <div className="relative flex h-full flex-col overflow-y-auto">
          {/* Mobile wordmark */}
          <div className="flex items-center justify-between px-6 pt-7 md:hidden">
            <span className="select-none text-[17px] font-normal tracking-tight text-white/80">
              ProJect <span className="font-bold text-white">YOU</span>
            </span>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 sm:px-10">
            <div className="w-full max-w-[380px]">

              {/* Tab switcher */}
              <div className="mb-8 flex rounded-lg border border-white/10 bg-white/[0.04] p-1">
                {(['signin', 'signup'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={cn(
                      'flex-1 rounded-md py-2 text-[13px] font-medium tracking-wide transition-all duration-300',
                      mode === m
                        ? 'bg-white text-black shadow-sm'
                        : 'text-white/45 hover:text-white/70',
                    )}
                  >
                    {m === 'signin' ? 'Sign in' : 'Create account'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Heading */}
                  <div className="mb-7 space-y-1">
                    <h1 className="text-[2rem] font-bold leading-[1.1] tracking-tight text-white">
                      <WaveText
                        text={mode === 'signin' ? 'Welcome Human' : 'Join the Memory'}
                        className="text-[2rem] font-bold tracking-tight text-white"
                      />
                    </h1>
                    <p className="text-[14px] text-white/35">
                      {mode === 'signin'
                        ? 'Sign in to access your knowledge graph.'
                        : 'Create an account and start capturing.'}
                    </p>
                  </div>

                  {/* API error */}
                  {apiError && (
                    <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
                      {apiError}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    {mode === 'signup' && (
                      <Field
                        label="Full name"
                        placeholder="Ada Lovelace"
                        autoComplete="name"
                        value={suName.value}
                        onChange={suName.onChange}
                        onBlur={suName.onBlur}
                        error={suName.touched ? errors.suName : undefined}
                      />
                    )}

                    <Field
                      label="Email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={mode === 'signin' ? siEmail.value : suEmail.value}
                      onChange={mode === 'signin' ? siEmail.onChange : suEmail.onChange}
                      onBlur={mode === 'signin' ? siEmail.onBlur : suEmail.onBlur}
                      error={(mode === 'signin' ? siEmail.touched : suEmail.touched)
                        ? (errors.siEmail ?? errors.suEmail)
                        : undefined}
                    />

                    <Field
                      label="Password"
                      type="password"
                      placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      value={mode === 'signin' ? siPassword.value : suPassword.value}
                      onChange={mode === 'signin' ? siPassword.onChange : suPassword.onChange}
                      onBlur={mode === 'signin' ? siPassword.onBlur : suPassword.onBlur}
                      error={(mode === 'signin' ? siPassword.touched : suPassword.touched)
                        ? (errors.siPassword ?? errors.suPassword)
                        : undefined}
                    />

                    {mode === 'signup' && (
                      <Field
                        label="Confirm password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        value={suConfirm.value}
                        onChange={suConfirm.onChange}
                        onBlur={suConfirm.onBlur}
                        error={suConfirm.touched ? errors.suConfirm : undefined}
                      />
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 text-[14px] font-semibold text-black transition-all duration-200 hover:bg-white/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <>
                          {mode === 'signin' ? 'Sign in' : 'Create account'}
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {mode === 'signin' && (
                    <p className="mt-5 text-center text-[12px] text-white/25">
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('signup')}
                        className="text-white/55 underline underline-offset-2 transition-colors hover:text-white"
                      >
                        Create one
                      </button>
                    </p>
                  )}

                  <p className="mt-6 text-center text-[11px] text-white/20">
                    By continuing you agree to our{' '}
                    <span className="underline underline-offset-2 cursor-pointer hover:text-white/40">Terms</span>
                    {' & '}
                    <span className="underline underline-offset-2 cursor-pointer hover:text-white/40">Privacy Policy</span>.
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
