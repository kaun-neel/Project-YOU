'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { TopNav } from './top-nav'

/** A single clip-revealed display line. */
function RevealLine({
  children,
  delay,
}: {
  children: React.ReactNode
  delay: number
}) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <span
        className="block will-change-transform"
        style={{
          animation: `mem-reveal 0.95s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
        }}
      >
        {children}
      </span>
    </span>
  )
}

export function EntryExperience({ onEnter }: { onEnter: () => void }) {
  const [showEnter, setShowEnter] = useState(false)
  const [leaving, setLeaving] = useState(false)

  // Reveal the enter button only after the headline animation has played out.
  useEffect(() => {
    const t = setTimeout(() => setShowEnter(true), 2400)
    return () => clearTimeout(t)
  }, [])

  function handleEnter() {
    if (leaving) return
    setLeaving(true)
    setTimeout(onEnter, 720)
  }

  return (
    <div
      className="relative h-dvh overflow-hidden bg-background transition-all duration-700 ease-fluid"
      style={{
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'scale(1.04)' : 'scale(1)',
        filter: leaving ? 'blur(8px)' : 'blur(0)',
      }}
    >
      <TopNav variant="landing" />

      {/* Floating glass prism — the only chromatic element */}
      <div
        className="pointer-events-none absolute right-[-6%] top-1/2 hidden aspect-square w-[58vw] max-w-[820px] -translate-y-1/2 md:block"
        style={{
          animation: 'mem-blur-in 1.6s cubic-bezier(0.16,1,0.3,1) 0.1s both',
          WebkitMaskImage:
            'radial-gradient(circle at 50% 50%, black 38%, transparent 72%)',
          maskImage:
            'radial-gradient(circle at 50% 50%, black 38%, transparent 72%)',
        }}
      >
        <div
          className="size-full"
          style={{ animation: 'mem-float 9s ease-in-out infinite' }}
        >
          <img
            src="/prism-hero.png"
            alt=""
            aria-hidden="true"
            className="size-full object-contain opacity-90"
          />
        </div>
      </div>

      {/* Mobile prism — smaller, top */}
      <div
        className="pointer-events-none absolute right-[-15%] top-[6%] aspect-square w-[80vw] md:hidden"
        style={{
          animation: 'mem-blur-in 1.6s cubic-bezier(0.16,1,0.3,1) 0.1s both',
          WebkitMaskImage:
            'radial-gradient(circle at 50% 50%, black 36%, transparent 70%)',
          maskImage:
            'radial-gradient(circle at 50% 50%, black 36%, transparent 70%)',
        }}
      >
        <img
          src="/prism-hero.png"
          alt=""
          aria-hidden="true"
          className="size-full object-contain opacity-80"
        />
      </div>

      {/* Editorial composition */}
      <div className="relative z-10 flex h-full flex-col justify-center px-5 sm:px-10">
        <p
          className="mb-6 text-[15px] tracking-tight text-foreground/70 sm:mb-8 sm:text-[18px]"
          style={{
            animation: 'mem-fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both',
          }}
        >
          A darkroom for the mind
        </p>

        <h1 className="font-heading text-display-xl max-w-[15ch] font-normal text-foreground text-balance">
          <RevealLine delay={350}>Everything</RevealLine>
          <RevealLine delay={520}>you have ever</RevealLine>
          <RevealLine delay={690}>
            known, finally <span className="font-bold">remembered</span>.
          </RevealLine>
        </h1>

        {/* Enter control — appears only once the intro settles */}
        <div className="mt-12 h-[52px] sm:mt-16">
          <button
            onClick={handleEnter}
            aria-hidden={!showEnter}
            tabIndex={showEnter ? 0 : -1}
            className="group inline-flex items-center gap-3 rounded-[5px] border border-foreground px-6 py-3 text-[14px] tracking-tight text-foreground transition-all duration-500 ease-fluid hover:border-gunmetal hover:text-gunmetal"
            style={{
              opacity: showEnter ? 1 : 0,
              transform: showEnter ? 'translateY(0)' : 'translateY(12px)',
              pointerEvents: showEnter ? 'auto' : 'none',
            }}
          >
            ENTER YOUR MEMORY
            <ArrowRight className="size-4 transition-transform duration-500 ease-fluid group-hover:translate-x-1" />
          </button>
        </div>

        {/* Bottom-right manifesto */}
        <p
          className="absolute bottom-8 right-5 max-w-[34ch] text-right text-[15px] leading-[1.5] text-foreground/70 sm:bottom-12 sm:right-10 sm:text-[18px]"
          style={{
            animation: 'mem-fade-up 0.9s cubic-bezier(0.16,1,0.3,1) 1.1s both',
          }}
        >
          Capture a thought, a paper, a voice memo. ProJect YOU refracts them
          into a single living graph — and hands you back the connections you
          forgot you made.
        </p>
      </div>
    </div>
  )
}
