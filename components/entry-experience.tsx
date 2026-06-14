'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { TopNav } from './top-nav'
import { WaveText } from './ui/wave-text'

/** A single clip-revealed display line — chars wave on hover. */
function RevealLine({
  children,
  delay,
  text,
}: {
  children?: React.ReactNode
  delay: number
  text?: string
}) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <span
        className="block will-change-transform"
        style={{
          animation: `mem-reveal 0.95s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
        }}
      >
        {text ? (
          <WaveText text={text} className="font-heading text-display-xl font-normal text-foreground" />
        ) : (
          children
        )}
      </span>
    </span>
  )
}

export function EntryExperience({ onEnter }: { onEnter: () => void }) {
  const [showEnter, setShowEnter] = useState(false)
  const [leaving, setLeaving] = useState(false)

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

      {/* Floating glass prism */}
      <div
        className="pointer-events-none absolute right-[-6%] top-1/2 hidden aspect-square w-[58vw] max-w-[820px] -translate-y-1/2 md:block"
        style={{
          animation: 'mem-blur-in 1.6s cubic-bezier(0.16,1,0.3,1) 0.1s both',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 38%, transparent 72%)',
          maskImage: 'radial-gradient(circle at 50% 50%, black 38%, transparent 72%)',
        }}
      >
        <div className="size-full" style={{ animation: 'mem-float 9s ease-in-out infinite' }}>
          <img src="/prism-hero.png" alt="" aria-hidden="true" className="size-full object-contain opacity-90" />
        </div>
      </div>

      {/* Mobile prism */}
      <div
        className="pointer-events-none absolute right-[-15%] top-[6%] aspect-square w-[80vw] md:hidden"
        style={{
          animation: 'mem-blur-in 1.6s cubic-bezier(0.16,1,0.3,1) 0.1s both',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 36%, transparent 70%)',
          maskImage: 'radial-gradient(circle at 50% 50%, black 36%, transparent 70%)',
        }}
      >
        <img src="/prism-hero.png" alt="" aria-hidden="true" className="size-full object-contain opacity-80" />
      </div>

      {/* Editorial composition */}
      <div className="relative z-10 flex h-full flex-col justify-center px-5 sm:px-10">
        <div
          className="mb-6 sm:mb-8"
          style={{ animation: 'mem-fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}
        >
          <WaveText
            text="A darkroom for the mind"
            className="text-[15px] tracking-tight text-foreground/70 sm:text-[18px]"
          />
        </div>

        <h1 className="font-heading text-display-xl max-w-[15ch] font-normal text-foreground text-balance">
          <RevealLine delay={350} text="Everything" />
          <RevealLine delay={520} text="you have ever" />
          {/* Last line has mixed weight — handle manually */}
          <span className="block overflow-hidden pb-[0.06em]">
            <span
              className="block will-change-transform"
              style={{ animation: 'mem-reveal 0.95s cubic-bezier(0.16,1,0.3,1) 690ms both' }}
            >
              <motion.span
                className="inline-block cursor-pointer"
                whileHover="hover"
                initial="initial"
              >
                {'known, finally '.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    className="inline-block"
                    variants={{
                      initial: { y: 0, scale: 1 },
                      hover: {
                        y: -4,
                        scale: 1.15,
                        transition: { type: 'spring', stiffness: 300, damping: 15, delay: i * 0.03 },
                      },
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
              </motion.span>
              <motion.span
                className="inline-block cursor-pointer font-bold"
                whileHover="hover"
                initial="initial"
              >
                {'remembered.'.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    className="inline-block"
                    variants={{
                      initial: { y: 0, scale: 1 },
                      hover: {
                        y: -4,
                        scale: 1.15,
                        transition: { type: 'spring', stiffness: 300, damping: 15, delay: i * 0.03 },
                      },
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.span>
            </span>
          </span>
        </h1>

        {/* Enter button */}
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
            <WaveText text="ENTER YOUR MEMORY" className="text-[14px] tracking-tight" />
            <ArrowRight className="size-4 transition-transform duration-500 ease-fluid group-hover:translate-x-1" />
          </button>
        </div>

        {/* Bottom-right manifesto */}
        <div
          className="absolute bottom-8 right-5 max-w-[34ch] rounded-[6px] bg-background/55 px-4 py-3 text-right backdrop-blur-md sm:bottom-12 sm:right-10"
          style={{ animation: 'mem-fade-up 0.9s cubic-bezier(0.16,1,0.3,1) 1.1s both' }}
        >
          <WaveText
            text="Capture a thought, a paper, a voice memo. ProJect YOU refracts them into a single living graph — and hands you back the connections you forgot you made."
            className="text-[14px] leading-[1.5] text-foreground/75 sm:text-[16px]"
          />
        </div>
      </div>
    </div>
  )
}
