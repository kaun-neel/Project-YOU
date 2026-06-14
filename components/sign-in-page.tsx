'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────
type Uniforms = {
  [key: string]: { value: number[] | number[][] | number; type: string }
}
interface ShaderProps {
  source: string
  uniforms: Uniforms
  maxFps?: number
}

// ─── CanvasRevealEffect ────────────────────────────────────────────────────
export const CanvasRevealEffect = ({
  animationSpeed = 10,
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[255, 255, 255]],
  containerClassName,
  dotSize,
  showGradient = true,
  reverse = false,
}: {
  animationSpeed?: number
  opacities?: number[]
  colors?: number[][]
  containerClassName?: string
  dotSize?: number
  showGradient?: boolean
  reverse?: boolean
}) => (
  <div className={cn('relative h-full w-full', containerClassName)}>
    <div className="h-full w-full">
      <DotMatrix
        colors={colors ?? [[255, 255, 255]]}
        dotSize={dotSize ?? 3}
        opacities={opacities ?? [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1]}
        shader={`${reverse ? 'u_reverse_active' : 'false'}_;animation_speed_factor_${animationSpeed.toFixed(1)}_;`}
        center={['x', 'y']}
      />
    </div>
    {showGradient && (
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
    )}
  </div>
)

// ─── DotMatrix ────────────────────────────────────────────────────────────
interface DotMatrixProps {
  colors?: number[][]
  opacities?: number[]
  totalSize?: number
  dotSize?: number
  shader?: string
  center?: ('x' | 'y')[]
}
const DotMatrix: React.FC<DotMatrixProps> = ({
  colors = [[0, 0, 0]],
  opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
  totalSize = 20,
  dotSize = 2,
  shader = '',
  center = ['x', 'y'],
}) => {
  const uniforms = useMemo(() => {
    let colorsArray = [colors[0], colors[0], colors[0], colors[0], colors[0], colors[0]]
    if (colors.length === 2) {
      colorsArray = [colors[0], colors[0], colors[0], colors[1], colors[1], colors[1]]
    } else if (colors.length === 3) {
      colorsArray = [colors[0], colors[0], colors[1], colors[1], colors[2], colors[2]]
    }
    return {
      u_colors: {
        value: colorsArray.map((c) => [c[0] / 255, c[1] / 255, c[2] / 255]),
        type: 'uniform3fv',
      },
      u_opacities: { value: opacities, type: 'uniform1fv' },
      u_total_size: { value: totalSize, type: 'uniform1f' },
      u_dot_size: { value: dotSize, type: 'uniform1f' },
      u_reverse: { value: shader.includes('u_reverse_active') ? 1 : 0, type: 'uniform1i' },
    }
  }, [colors, opacities, totalSize, dotSize, shader])

  return (
    <Shader
      source={`
        precision mediump float;
        in vec2 fragCoord;
        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;
        uniform int u_reverse;
        out vec4 fragColor;
        float PHI = 1.61803398874989484820459;
        float random(vec2 xy){return fract(tan(distance(xy*PHI,xy)*0.5)*xy.x);}
        float map(float value,float min1,float max1,float min2,float max2){return min2+(value-min1)*(max2-min2)/(max1-min1);}
        void main(){
          vec2 st=fragCoord.xy;
          ${center.includes('x') ? 'st.x-=abs(floor((mod(u_resolution.x,u_total_size)-u_dot_size)*0.5));' : ''}
          ${center.includes('y') ? 'st.y-=abs(floor((mod(u_resolution.y,u_total_size)-u_dot_size)*0.5));' : ''}
          float opacity=step(0.0,st.x);
          opacity*=step(0.0,st.y);
          vec2 st2=vec2(int(st.x/u_total_size),int(st.y/u_total_size));
          float frequency=5.0;
          float show_offset=random(st2);
          float rand=random(st2*floor((u_time/frequency)+show_offset+frequency));
          opacity*=u_opacities[int(rand*10.0)];
          opacity*=1.0-step(u_dot_size/u_total_size,fract(st.x/u_total_size));
          opacity*=1.0-step(u_dot_size/u_total_size,fract(st.y/u_total_size));
          vec3 color=u_colors[int(show_offset*6.0)];
          float animation_speed_factor=0.5;
          vec2 center_grid=u_resolution/2.0/u_total_size;
          float dist_from_center=distance(center_grid,st2);
          float timing_offset_intro=dist_from_center*0.01+(random(st2)*0.15);
          float max_grid_dist=distance(center_grid,vec2(0.0,0.0));
          float timing_offset_outro=(max_grid_dist-dist_from_center)*0.02+(random(st2+42.0)*0.2);
          if(u_reverse==1){
            opacity*=1.0-step(timing_offset_outro,u_time*animation_speed_factor);
            opacity*=clamp((step(timing_offset_outro+0.1,u_time*animation_speed_factor))*1.25,1.0,1.25);
          } else {
            opacity*=step(timing_offset_intro,u_time*animation_speed_factor);
            opacity*=clamp((1.0-step(timing_offset_intro+0.1,u_time*animation_speed_factor))*1.25,1.0,1.25);
          }
          fragColor=vec4(color,opacity);
          fragColor.rgb*=fragColor.a;
        }`}
      uniforms={uniforms}
      maxFps={60}
    />
  )
}

// ─── Shader plumbing ──────────────────────────────────────────────────────
const ShaderMaterial = ({ source, uniforms, maxFps = 60 }: { source: string; maxFps?: number; uniforms: Uniforms }) => {
  const { size } = useThree()
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const mat: any = ref.current.material
    mat.uniforms.u_time.value = clock.getElapsedTime()
  })

  const material = useMemo(() => {
    const prepared: any = {}
    for (const name in uniforms) {
      const u: any = uniforms[name]
      switch (u.type) {
        case 'uniform1f': prepared[name] = { value: u.value }; break
        case 'uniform1i': prepared[name] = { value: u.value }; break
        case 'uniform1fv': prepared[name] = { value: u.value }; break
        case 'uniform3fv':
          prepared[name] = { value: (u.value as number[][]).map((v) => new THREE.Vector3().fromArray(v)) }
          break
        case 'uniform3f': prepared[name] = { value: new THREE.Vector3().fromArray(u.value as number[]) }; break
        case 'uniform2f': prepared[name] = { value: new THREE.Vector2().fromArray(u.value as number[]) }; break
      }
    }
    prepared['u_time'] = { value: 0 }
    prepared['u_resolution'] = { value: new THREE.Vector2(size.width * 2, size.height * 2) }
    return new THREE.ShaderMaterial({
      vertexShader: `precision mediump float;uniform vec2 u_resolution;out vec2 fragCoord;void main(){gl_Position=vec4(position.xy,0.0,1.0);fragCoord=(position.xy+vec2(1.0))*0.5*u_resolution;fragCoord.y=u_resolution.y-fragCoord.y;}`,
      fragmentShader: source,
      uniforms: prepared,
      glslVersion: THREE.GLSL3,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height, source])

  return (
    <mesh ref={ref as any}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
const Shader: React.FC<ShaderProps> = ({ source, uniforms, maxFps = 60 }) => (
  <Canvas className="absolute inset-0 h-full w-full">
    <ShaderMaterial source={source} uniforms={uniforms} maxFps={maxFps} />
  </Canvas>
)

// ─── MiniNavbar ───────────────────────────────────────────────────────────
function MiniNavbar() {
  return (
    <header className="fixed inset-x-0 top-6 z-20 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-full border border-[#333] bg-[#1f1f1f57] px-5 py-2.5 backdrop-blur-sm">
        <Image
          src="/logo.png"
          alt="Logo"
          width={28}
          height={28}
          className="size-7 object-contain invert opacity-90"
        />
      </div>
    </header>
  )
}

// ─── Animated nav link ─────────────────────────────────────────────────────
function AnimatedNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="group relative inline-flex h-5 items-center overflow-hidden text-sm">
      <div className="flex flex-col transition-transform duration-300 ease-out group-hover:-translate-y-1/2">
        <span className="text-gray-300">{children}</span>
        <span className="text-white">{children}</span>
      </div>
    </a>
  )
}

// ─── Field ─────────────────────────────────────────────────────────────────
function Field({
  label,
  error,
  className: cls,
  ...inputProps
}: {
  label: string
  error?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] uppercase tracking-[0.08em] text-white/40">{label}</label>
      <input
        className={cn(
          'w-full rounded-full border bg-white/[0.05] px-5 py-3 text-[15px] text-white placeholder:text-white/20 focus:outline-none transition-colors duration-200 backdrop-blur-[1px]',
          error ? 'border-red-500/60 focus:border-red-400' : 'border-white/10 focus:border-white/35',
          cls,
        )}
        {...inputProps}
      />
      {error && <p className="text-[12px] text-red-400">{error}</p>}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────
type Step = 'email' | 'password' | 'success'
type Mode = 'signin' | 'signup'

export function SignInPage({
  className,
  onSuccess,
}: {
  className?: string
  onSuccess?: () => void
}) {
  const [step, setStep] = useState<Step>('email')
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [leaving, setLeaving] = useState(false)

  // Canvas animation state
  const [initialCanvas, setInitialCanvas] = useState(true)
  const [reverseCanvas, setReverseCanvas] = useState(false)

  // Trigger reverse canvas on success then advance
  function triggerSuccessAnimation() {
    setReverseCanvas(true)
    setTimeout(() => setInitialCanvas(false), 50)
    setTimeout(() => setStep('success'), 1800)
    setTimeout(() => {
      setLeaving(true)
      setTimeout(() => onSuccess?.(), 700)
    }, 2800)
  }

  function validateEmail() {
    const e: Record<string, string> = {}
    if (!email.trim()) e.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email'
    if (mode === 'signup' && !name.trim()) e.name = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validatePassword() {
    const e: Record<string, string> = {}
    if (!password) e.password = 'Required'
    else if (password.length < 8) e.password = 'At least 8 characters'
    if (mode === 'signup' && confirm !== password) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleEmailNext(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validateEmail()) return
    setStep('password')
    setErrors({})
    setApiError(null)
  }

  async function handlePasswordSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setApiError(null)
    if (!validatePassword()) return
    setLoading(true)
    try {
      const endpoint = mode === 'signin' ? '/api/auth/signin' : '/api/auth/signup'
      const body = mode === 'signin'
        ? { email, password }
        : { email, name, password }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setApiError(data.error || 'Something went wrong.'); setLoading(false); return }
      setLoading(false)
      triggerSuccessAnimation()
    } catch {
      setApiError('Network error. Please try again.')
      setLoading(false)
    }
  }

  function handleBack() {
    setStep('email')
    setErrors({})
    setApiError(null)
    setReverseCanvas(false)
    setInitialCanvas(true)
  }

  function switchMode(m: Mode) {
    setMode(m)
    setStep('email')
    setErrors({})
    setApiError(null)
    setName(''); setPassword(''); setConfirm('')
    setReverseCanvas(false); setInitialCanvas(true)
  }

  const isComplete = step === 'password'
    ? (password.length >= 8 && (mode === 'signin' || confirm === password))
    : false

  return (
    <div
      className={cn(
        'relative flex min-h-dvh w-full flex-col bg-black transition-[opacity,filter] duration-700',
        leaving && 'opacity-0 blur-lg scale-105',
        className,
      )}
    >
      {/* Canvas layer */}
      <div className="absolute inset-0 z-0">
        {initialCanvas && (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={3}
              containerClassName="bg-black"
              colors={[[255, 255, 255], [255, 255, 255]]}
              dotSize={6}
              reverse={false}
            />
          </div>
        )}
        {reverseCanvas && (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={4}
              containerClassName="bg-black"
              colors={[[255, 255, 255], [255, 255, 255]]}
              dotSize={6}
              reverse={true}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.85)_0%,_transparent_70%)]" />
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
      </div>

      {/* Navbar */}
      <MiniNavbar />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-16 pt-32 sm:px-8">
        {/* Mode switcher */}
        <div className="mb-8 flex w-full max-w-sm rounded-full border border-white/10 bg-white/[0.04] p-1">
          {(['signin', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={cn(
                'flex-1 rounded-full py-2.5 text-[13px] font-medium tracking-wide transition-all duration-300',
                mode === m ? 'bg-white text-black shadow-sm' : 'text-white/45 hover:text-white/70',
              )}
            >
              {m === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">

            {/* ── STEP: email ── */}
            {step === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.38, ease: 'easeOut' }}
                className="space-y-6 text-center"
              >
                <div className="space-y-1">
                  <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                    {mode === 'signin' ? 'Welcome Human' : 'Join the Memory'}
                  </h1>
                  <p className="text-[1.1rem] font-light text-white/50">
                    {mode === 'signin' ? 'Sign in to your knowledge graph' : 'Create your account'}
                  </p>
                </div>

                {apiError && (
                  <div className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
                    {apiError}
                  </div>
                )}

                <form onSubmit={handleEmailNext} className="space-y-3">
                  {mode === 'signup' && (
                    <input
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={cn(
                        'w-full rounded-full border bg-white/5 px-5 py-3 text-center text-[15px] text-white placeholder:text-white/30 backdrop-blur-[1px] focus:outline-none transition-colors',
                        errors.name ? 'border-red-500/60' : 'border-white/10 focus:border-white/35',
                      )}
                    />
                  )}
                  {errors.name && <p className="text-[12px] text-red-400">{errors.name}</p>}

                  <div className="relative">
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn(
                        'w-full rounded-full border bg-white/5 px-5 py-3 text-center text-[15px] text-white placeholder:text-white/30 backdrop-blur-[1px] focus:outline-none transition-colors',
                        errors.email ? 'border-red-500/60' : 'border-white/10 focus:border-white/35',
                      )}
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 group"
                    >
                      <span className="relative block h-full w-full overflow-hidden">
                        <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-full">→</span>
                        <span className="absolute inset-0 flex items-center justify-center -translate-x-full transition-transform duration-300 group-hover:translate-x-0">→</span>
                      </span>
                    </button>
                  </div>
                  {errors.email && <p className="text-[12px] text-red-400">{errors.email}</p>}
                </form>

                <p className="pt-6 text-[11px] text-white/30">
                  By continuing you agree to our{' '}
                  <Link href="#" className="underline underline-offset-2 hover:text-white/50 transition-colors">Terms</Link>
                  {' & '}
                  <Link href="#" className="underline underline-offset-2 hover:text-white/50 transition-colors">Privacy Policy</Link>.
                </p>
              </motion.div>
            )}

            {/* ── STEP: password ── */}
            {step === 'password' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 80 }}
                transition={{ duration: 0.38, ease: 'easeOut' }}
                className="space-y-6 text-center"
              >
                <div className="space-y-1">
                  <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                    {mode === 'signin' ? 'Welcome back' : 'Set your password'}
                  </h1>
                  <p className="text-[1.1rem] font-light text-white/50 truncate">{email}</p>
                </div>

                {apiError && (
                  <div className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
                    {apiError}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  <div className="relative rounded-full border border-white/10 bg-transparent px-5 py-4">
                    <input
                      type="password"
                      placeholder="Password"
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-center text-[18px] tracking-[0.2em] text-white placeholder:text-white/30 placeholder:tracking-normal focus:outline-none"
                    />
                  </div>
                  {errors.password && <p className="text-[12px] text-red-400">{errors.password}</p>}

                  {mode === 'signup' && (
                    <>
                      <div className="relative rounded-full border border-white/10 bg-transparent px-5 py-4">
                        <input
                          type="password"
                          placeholder="Confirm password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          className="w-full bg-transparent text-center text-[18px] tracking-[0.2em] text-white placeholder:text-white/30 placeholder:tracking-normal focus:outline-none"
                        />
                      </div>
                      {errors.confirm && <p className="text-[12px] text-red-400">{errors.confirm}</p>}
                    </>
                  )}

                  <motion.p
                    className="cursor-pointer text-sm text-white/50 transition-colors hover:text-white/70"
                    whileHover={{ scale: 1.02 }}
                  >
                    {mode === 'signin' ? 'Forgot password?' : ''}
                  </motion.p>

                  <div className="flex w-full gap-3 pt-2">
                    <motion.button
                      type="button"
                      onClick={handleBack}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-[30%] rounded-full bg-white px-6 py-3 font-medium text-black transition-colors hover:bg-white/90"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={!loading ? { scale: 1.02 } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-full py-3 font-medium transition-all duration-300',
                        isComplete && !loading
                          ? 'bg-white text-black hover:bg-white/90'
                          : 'cursor-not-allowed border border-white/10 bg-[#111] text-white/50',
                      )}
                    >
                      {loading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border border-black/40 border-t-black" />
                      ) : (
                        mode === 'signin' ? 'Sign in' : 'Create account'
                      )}
                    </motion.button>
                  </div>
                </form>

                <p className="pt-10 text-[11px] text-white/30">
                  By continuing you agree to our{' '}
                  <Link href="#" className="underline underline-offset-2 hover:text-white/50 transition-colors">Terms</Link>
                  {' & '}
                  <Link href="#" className="underline underline-offset-2 hover:text-white/50 transition-colors">Privacy Policy</Link>.
                </p>
              </motion.div>
            )}

            {/* ── STEP: success ── */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
                className="space-y-6 text-center"
              >
                <div className="space-y-1">
                  <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                    {mode === 'signin' ? "You're in!" : 'Account created!'}
                  </h1>
                  <p className="text-[1.25rem] font-light text-white/50">Welcome, Human.</p>
                </div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="py-10"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-white to-white/70">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-sm text-white/40"
                >
                  Taking you to your memory...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
