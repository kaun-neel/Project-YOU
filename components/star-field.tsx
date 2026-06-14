'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  r: number
  alpha: number
  alphaTarget: number
  alphaSpeed: number
  z: number // depth for parallax
}

interface NebulaPatch {
  x: number
  y: number
  rx: number
  ry: number
  hue: number
  alpha: number
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let rafId: number
    let time = 0

    // ── Seeded pseudo-random for stable layout across redraws ──
    function seededRand(seed: number) {
      let s = seed
      return function () {
        s = (s * 16807 + 0) % 2147483647
        return (s - 1) / 2147483646
      }
    }
    const rand = seededRand(42)

    // ── Build star + nebula data once ──
    const STAR_COUNT = 380
    const NEBULA_COUNT = 7
    let stars: Star[] = []
    let nebulas: NebulaPatch[] = []

    function initScene() {
      const r2 = seededRand(42)
      stars = Array.from({ length: STAR_COUNT }, () => ({
        x: r2() * width,
        y: r2() * height,
        r: r2() * r2() * 2.2 + 0.3, // skewed small
        alpha: r2() * 0.5 + 0.3,
        alphaTarget: r2() * 0.5 + 0.3,
        alphaSpeed: r2() * 0.003 + 0.001,
        z: r2(), // 0=far, 1=near
      }))

      const r3 = seededRand(123)
      nebulas = Array.from({ length: NEBULA_COUNT }, () => ({
        x: r3() * width,
        y: r3() * height,
        rx: r3() * width * 0.3 + width * 0.1,
        ry: r3() * height * 0.3 + height * 0.1,
        // cool blue/teal/purple hues matching editorial palette
        hue: [210, 220, 235, 250, 265, 195, 245][Math.floor(r3() * 7)],
        alpha: r3() * 0.055 + 0.02,
      }))
    }

    function resize() {
      width = canvas.offsetWidth * window.devicePixelRatio
      height = canvas.offsetHeight * window.devicePixelRatio
      canvas.width = width
      canvas.height = height
      initScene()
    }

    // ── Draw ──
    function draw() {
      time += 0.008
      ctx.clearRect(0, 0, width, height)

      // Deep space base — very dark, slightly blue-tinted
      ctx.fillStyle = '#070b10'
      ctx.fillRect(0, 0, width, height)

      // Nebula patches
      for (const n of nebulas) {
        const px = n.x + Math.sin(time * 0.07 + n.hue) * (width * 0.012)
        const py = n.y + Math.cos(time * 0.05 + n.hue) * (height * 0.008)
        const grad = ctx.createRadialGradient(px, py, 0, px, py, Math.max(n.rx, n.ry))
        grad.addColorStop(0, `hsla(${n.hue},55%,48%,${n.alpha * 1.6})`)
        grad.addColorStop(0.45, `hsla(${n.hue},48%,38%,${n.alpha})`)
        grad.addColorStop(1, `hsla(${n.hue},40%,25%,0)`)
        ctx.save()
        ctx.translate(px, py)
        ctx.scale(n.rx / Math.max(n.rx, n.ry), n.ry / Math.max(n.rx, n.ry))
        ctx.beginPath()
        ctx.arc(0, 0, Math.max(n.rx, n.ry), 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
        ctx.restore()
      }

      // Stars — twinkle by drifting alpha
      for (const s of stars) {
        // Gently drift alpha target
        if (Math.abs(s.alpha - s.alphaTarget) < 0.02) {
          s.alphaTarget = Math.random() * 0.6 + 0.2
        }
        s.alpha += (s.alphaTarget - s.alpha) * s.alphaSpeed

        // Subtle parallax drift based on depth
        const drift = s.z * 0.15
        const sx = (s.x + Math.sin(time * (0.04 + s.z * 0.02)) * drift * width * 0.002) % width
        const sy = (s.y + Math.cos(time * (0.03 + s.z * 0.015)) * drift * height * 0.002) % height

        // Larger/nearer stars get a soft glow
        if (s.r > 1.2) {
          const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 3.5)
          glow.addColorStop(0, `rgba(200,220,255,${s.alpha * 0.5})`)
          glow.addColorStop(1, 'rgba(200,220,255,0)')
          ctx.beginPath()
          ctx.arc(sx, sy, s.r * 3.5, 0, Math.PI * 2)
          ctx.fillStyle = glow
          ctx.fill()
        }

        // Core star dot
        ctx.beginPath()
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220,235,255,${s.alpha})`
        ctx.fill()
      }

      // A single faint galactic-plane band
      const band = ctx.createLinearGradient(0, height * 0.25, 0, height * 0.75)
      band.addColorStop(0, 'rgba(100,130,180,0)')
      band.addColorStop(0.5, 'rgba(80,110,160,0.04)')
      band.addColorStop(1, 'rgba(100,130,180,0)')
      ctx.fillStyle = band
      ctx.fillRect(0, 0, width, height)

      rafId = requestAnimationFrame(draw)
    }

    resize()
    draw()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
