'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { WaveText } from '@/components/ui/wave-text'
import { ClosingPlasma } from '@/components/ui/closing-plasma'

export function SignInPage({
  className,
  onSuccess,
}: {
  className?: string
  onSuccess?: () => void
}) {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [leaving, setLeaving] = useState(false)

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setStep('code')
  }

  useEffect(() => {
    if (step === 'code') {
      setTimeout(() => codeInputRefs.current[0]?.focus(), 400)
    }
    if (step === 'success') {
      const t = setTimeout(() => {
        setLeaving(true)
        setTimeout(() => onSuccess?.(), 700)
      }, 1200)
      return () => clearTimeout(t)
    }
  }, [step, onSuccess])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    const next = [...code]
    next[index] = value
    setCode(next)
    if (value && index < 5) codeInputRefs.current[index + 1]?.focus()
    if (index === 5 && value && next.every((d) => d.length === 1)) {
      setTimeout(() => setStep('success'), 300)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0)
      codeInputRefs.current[index - 1]?.focus()
  }

  const handleBack = () => {
    setStep('email')
    setCode(['', '', '', '', '', ''])
  }

  return (
    <div
      className={cn(
        'relative flex min-h-screen w-full flex-col overflow-hidden',
        className,
      )}
      style={{
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'scale(1.04)' : 'scale(1)',
        filter: leaving ? 'blur(10px)' : 'blur(0)',
        transition: 'opacity 0.7s ease, transform 0.7s ease, filter 0.7s ease',
      }}
    >
      {/* Full-screen plasma background */}
      <div className="absolute inset-0 z-0">
        <ClosingPlasma
          themeMode="dark"
          speed={1}
          turbulence={1}
          mouseInfluence={1}
          grain={1}
          sparkle={1}
          vignette={1}
          opacity={1}
          interactive
          darkColorA="#0d0d14"
          darkColorB="#1f2540"
          darkColorC="#4a6191"
          lightColorA="#f0f2f7"
          lightColorB="#d7dceb"
          lightColorC="#bcc5e0"
          className="h-full w-full"
        />
      </div>

      {/* Top wordmark */}
      <div className="relative z-10 flex items-center justify-between px-7 pt-7 sm:px-10 sm:pt-9">
        <span className="select-none text-[17px] font-normal tracking-tight text-white/90">
          ProJect <span className="font-bold">YOU</span>
        </span>
      </div>

      {/* Centered form */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-7 text-center"
              >
                <div className="space-y-2">
                  <h1 className="text-[2.6rem] font-bold leading-[1.08] tracking-tight text-white">
                    <WaveText text="Welcome Human" className="text-[2.6rem] font-bold tracking-tight text-white" />
                  </h1>
                  <p className="text-[1.3rem] font-light text-white/55">
                    <WaveText text="Your memory awaits" className="text-[1.3rem] font-light text-white/55" />
                  </p>
                </div>

                <div className="space-y-4">
                  <button className="flex w-full items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/8 px-4 py-3 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/14">
                    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <WaveText text="Continue with Google" className="text-sm text-white" />
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/12" />
                    <span className="text-sm text-white/35">or</span>
                    <div className="h-px flex-1 bg-white/12" />
                  </div>

                  <form onSubmit={handleEmailSubmit}>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-full border border-white/12 bg-white/6 py-3 px-5 text-center text-white backdrop-blur-sm transition-colors focus:border-white/35 focus:outline-none placeholder:text-white/35"
                        required
                      />
                      <button
                        type="submit"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/22"
                      >
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </form>
                </div>

                <p className="pt-4 text-xs text-white/35">
                  By continuing, you agree to our{' '}
                  <Link href="#" className="underline underline-offset-2 transition-colors hover:text-white/60">Terms</Link>
                  {' '}&amp;{' '}
                  <Link href="#" className="underline underline-offset-2 transition-colors hover:text-white/60">Privacy</Link>.
                </p>
              </motion.div>

            ) : step === 'code' ? (
              <motion.div
                key="code"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-7 text-center"
              >
                <div className="space-y-2">
                  <h1 className="text-[2.2rem] font-bold leading-[1.1] tracking-tight text-white">
                    <WaveText text="Check your inbox" className="text-[2.2rem] font-bold tracking-tight text-white" />
                  </h1>
                  <p className="text-[1.1rem] font-light text-white/50">
                    <WaveText text={`Code sent to ${email || 'your email'}`} className="text-[1.1rem] font-light text-white/50" />
                  </p>
                </div>

                <div className="rounded-2xl border border-white/12 bg-white/6 px-5 py-5 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-1">
                    {code.map((digit, i) => (
                      <div key={i} className="flex items-center">
                        <div className="relative">
                          <input
                            ref={(el) => { codeInputRefs.current[i] = el }}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleCodeChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            className="w-9 appearance-none border-none bg-transparent text-center text-2xl font-bold text-white focus:outline-none"
                            style={{ caretColor: 'transparent' }}
                          />
                          {!digit && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl text-white/20">·</span>
                            </div>
                          )}
                        </div>
                        {i < 5 && <span className="mx-0.5 text-white/15">|</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <p className="cursor-pointer text-sm text-white/45 transition-colors hover:text-white/70">
                  Didn&apos;t receive it? <span className="underline underline-offset-2">Resend</span>
                </p>

                <div className="flex gap-3">
                  <motion.button
                    onClick={handleBack}
                    className="w-1/3 rounded-full border border-white/20 py-3 text-sm font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white"
                    whileTap={{ scale: 0.97 }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    onClick={() => code.every((d) => d !== '') && setStep('success')}
                    className={cn(
                      'flex-1 rounded-full py-3 text-sm font-medium transition-all duration-300',
                      code.every((d) => d !== '')
                        ? 'bg-white text-black cursor-pointer hover:bg-white/90'
                        : 'border border-white/12 bg-white/5 text-white/35 cursor-not-allowed',
                    )}
                    whileTap={code.every((d) => d !== '') ? { scale: 0.97 } : {}}
                  >
                    Continue
                  </motion.button>
                </div>
              </motion.div>

            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="mx-auto flex size-20 items-center justify-center rounded-full bg-white"
                >
                  <svg className="size-9 text-black" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
                <div>
                  <h1 className="text-[2.4rem] font-bold tracking-tight text-white">
                    <WaveText text="You're in!" className="text-[2.4rem] font-bold tracking-tight text-white" />
                  </h1>
                  <p className="mt-1 text-[1.2rem] font-light text-white/50">
                    <WaveText text="Opening your memory..." className="text-[1.2rem] font-light text-white/50" />
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
