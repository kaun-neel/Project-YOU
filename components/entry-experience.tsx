'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ClosingPlasma } from '@/components/ui/closing-plasma'
import { WaveText } from '@/components/ui/wave-text'

export function EntryExperience({ onEnter }: { onEnter: () => void }) {
  const [showEnter, setShowEnter] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowEnter(true), 1800)
    return () => clearTimeout(t)
  }, [])

  function handleEnter() {
    if (leaving) return
    setLeaving(true)
    setTimeout(onEnter, 800)
  }

  return (
    <div
      className="relative h-dvh w-full overflow-hidden"
      style={{
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'scale(1.05)' : 'scale(1)',
        filter: leaving ? 'blur(12px)' : 'blur(0)',
        transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1), filter 0.8s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Full-screen plasma */}
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
        className="absolute inset-0 h-full w-full"
      />

      {/* Top logo */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center px-7 pt-7 sm:px-10 sm:pt-9">
        <Image
          src="/logo.png"
          alt="Logo"
          width={80}
          height={80}
          className="size-16 object-contain invert opacity-90 sm:size-20"
          priority
        />
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-5 text-[14px] tracking-[0.12em] uppercase text-white/50 sm:text-[15px]"
        >
          <WaveText text="A darkroom for the mind" className="text-[14px] tracking-[0.12em] uppercase text-white/50" />
        </motion.p>

        {/* Main headline */}
        <div className="overflow-hidden">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[16ch] text-[clamp(2.4rem,7vw,5.5rem)] font-bold leading-[1.06] tracking-tight text-white text-balance"
          >
            <WaveText
              text="Everything you"
              className="block text-[clamp(2.4rem,7vw,5.5rem)] font-bold leading-[1.06] tracking-tight text-white"
            />
            <WaveText
              text="have ever known"
              className="block text-[clamp(2.4rem,7vw,5.5rem)] font-bold leading-[1.06] tracking-tight text-white"
            />
            <WaveText
              text="finally remembered."
              className="block text-[clamp(2.4rem,7vw,5.5rem)] font-bold leading-[1.06] tracking-tight text-white/60"
            />
          </motion.h1>
        </div>

        {/* Enter button — appears after delay */}
        <div className="mt-14 h-14">
          <motion.button
            onClick={handleEnter}
            initial={{ opacity: 0, y: 16 }}
            animate={showEnter ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            tabIndex={showEnter ? 0 : -1}
            className="group inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/8 px-7 py-3.5 text-[14px] tracking-widest uppercase text-white backdrop-blur-sm transition-all duration-500 hover:border-white/60 hover:bg-white/15"
          >
            <WaveText text="Enter Your Memory" className="text-[14px] tracking-widest uppercase text-white" />
            <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
