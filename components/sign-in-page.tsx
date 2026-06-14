'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { WaveText } from '@/components/ui/wave-text'

// ─── Types ────────────────────────────────────────────────────────────────────

type Uniforms = {
  [key: string]: { value: number[] | number[][] | number; type: string }
}
interface ShaderProps {
  source: string
  uniforms: Uniforms
  maxFps?: number
}

// ─── Canvas Reveal Effect ─────────────────────────────────────────────────────

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
        colors={colors ?? [[0, 255, 255]]}
        dotSize={dotSize ?? 3}
        opacities={opacities ?? [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1]}
        shader={`
          ${reverse ? 'u_reverse_active' : 'false'}_;
          animation_speed_factor_${animationSpeed.toFixed(1)}_;
        `}
        center={['x', 'y']}
      />
    </div>
    {showGradient && (
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
    )}
  </div>
)

// ─── Dot Matrix ───────────────────────────────────────────────────────────────

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
  const uniforms = React.useMemo(() => {
    let colorsArray = [colors[0], colors[0], colors[0], colors[0], colors[0], colors[0]]
    if (colors.length === 2)
      colorsArray = [colors[0], colors[0], colors[0], colors[1], colors[1], colors[1]]
    else if (colors.length === 3)
      colorsArray = [colors[0], colors[0], colors[1], colors[1], colors[2], colors[2]]
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
          float current_timing_offset;
          if(u_reverse==1){
            current_timing_offset=timing_offset_outro;
            opacity*=1.0-step(current_timing_offset,u_time*animation_speed_factor);
            opacity*=clamp((step(current_timing_offset+0.1,u_time*animation_speed_factor))*1.25,1.0,1.25);
          }else{
            current_timing_offset=timing_offset_intro;
            opacity*=step(current_timing_offset,u_time*animation_speed_factor);
            opacity*=clamp((1.0-step(current_timing_offset+0.1,u_time*animation_speed_factor))*1.25,1.0,1.25);
          }
          fragColor=vec4(color,opacity);
          fragColor.rgb*=fragColor.a;
        }`}
      uniforms={uniforms}
      maxFps={60}
    />
  )
}

// ─── Shader / Three.js ────────────────────────────────────────────────────────

const ShaderMaterial = ({
  source,
  uniforms,
  maxFps = 60,
}: {
  source: string
  maxFps?: number
  uniforms: Uniforms
}) => {
  const { size } = useThree()
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const material = ref.current.material as THREE.ShaderMaterial & { uniforms: Record<string, { value: unknown }> }
    material.uniforms.u_time.value = clock.getElapsedTime()
  })

  const getUniforms = () => {
    const prepared: Record<string, { value: unknown }> = {}
    for (const name in uniforms) {
      const u = uniforms[name]
      switch (u.type) {
        case 'uniform1f': prepared[name] = { value: u.value }; break
        case 'uniform1i': prepared[name] = { value: u.value }; break
        case 'uniform1fv': prepared[name] = { value: u.value }; break
        case 'uniform3fv':
          prepared[name] = { value: (u.value as number[][]).map((v) => new THREE.Vector3().fromArray(v)) }
          break
        case 'uniform3f': prepared[name] = { value: new THREE.Vector3().fromArray(u.value as number[]) }; break
        case 'uniform2f': prepared[name] = { value: new THREE.Vector2().fromArray(u.value as number[]) }; break
        default: break
      }
    }
    prepared['u_time'] = { value: 0 }
    prepared['u_resolution'] = { value: new THREE.Vector2(size.width * 2, size.height * 2) }
    return prepared
  }

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `
          precision mediump float;
          uniform vec2 u_resolution;
          out vec2 fragCoord;
          void main(){
            gl_Position=vec4(position.xy,0.0,1.0);
            fragCoord=(position.xy+vec2(1.0))*0.5*u_resolution;
            fragCoord.y=u_resolution.y-fragCoord.y;
          }`,
        fragmentShader: source,
        uniforms: getUniforms() as THREE.ShaderMaterial['uniforms'],
        glslVersion: THREE.GLSL3,
        blending: THREE.CustomBlending,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneFactor,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size.width, size.height, source],
  )

  return (
    <mesh ref={ref}>
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

// ─── Sign-In Page ─────────────────────────────────────────────────────────────

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
  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true)
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false)

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setStep('code')
  }

  useEffect(() => {
    if (step === 'code') {
      setTimeout(() => codeInputRefs.current[0]?.focus(), 500)
    }
  }, [step])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    const next = [...code]
    next[index] = value
    setCode(next)
    if (value && index < 5) codeInputRefs.current[index + 1]?.focus()
    if (index === 5 && value && next.every((d) => d.length === 1)) {
      setReverseCanvasVisible(true)
      setTimeout(() => setInitialCanvasVisible(false), 50)
      setTimeout(() => setStep('success'), 2000)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0)
      codeInputRefs.current[index - 1]?.focus()
  }

  const handleBack = () => {
    setStep('email')
    setCode(['', '', '', '', '', ''])
    setReverseCanvasVisible(false)
    setInitialCanvasVisible(true)
  }

  return (
    <div className={cn('relative flex min-h-screen w-full flex-col bg-black', className)}>
      {/* Background canvas */}
      <div className="absolute inset-0 z-0">
        {initialCanvasVisible && (
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
        {reverseCanvasVisible && (
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,1)_0%,_transparent_100%)]" />
        <div className="absolute left-0 right-0 top-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pt-24">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="space-y-6 text-center"
              >
                <div className="space-y-1">
                  <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                    <WaveText text="Welcome Human" className="text-[2.5rem] font-bold tracking-tight text-white" />
                  </h1>
                  <p className="text-[1.4rem] font-light text-white/60">
                    <WaveText text="Your memory awaits" className="text-[1.4rem] font-light text-white/60" />
                  </p>
                </div>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-sm transition-colors hover:bg-white/10">
                    <span className="text-lg font-semibold">G</span>
                    <WaveText text="Sign in with Google" className="text-sm" />
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-sm text-white/40">or</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                  <form onSubmit={handleEmailSubmit}>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-full border border-white/10 bg-transparent py-3 px-4 text-center text-white backdrop-blur-sm focus:border-white/30 focus:outline-none"
                        required
                      />
                      <button
                        type="submit"
                        className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 group overflow-hidden"
                      >
                        <span className="relative block h-full w-full overflow-hidden">
                          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-full">→</span>
                          <span className="absolute inset-0 flex items-center justify-center -translate-x-full transition-transform duration-300 group-hover:translate-x-0">→</span>
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
                <p className="pt-8 text-xs text-white/40">
                  By signing up, you agree to our{' '}
                  <Link href="#" className="underline hover:text-white/60 transition-colors">Terms</Link> &amp;{' '}
                  <Link href="#" className="underline hover:text-white/60 transition-colors">Privacy</Link>.
                </p>
              </motion.div>
            ) : step === 'code' ? (
              <motion.div
                key="code"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="space-y-6 text-center"
              >
                <div className="space-y-1">
                  <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                    <WaveText text="We sent you a code" className="text-[2.5rem] font-bold tracking-tight text-white" />
                  </h1>
                  <p className="text-[1.25rem] font-light text-white/50">
                    <WaveText text="Please enter it below" className="text-[1.25rem] font-light text-white/50" />
                  </p>
                </div>
                <div className="relative rounded-full border border-white/10 px-5 py-4">
                  <div className="flex items-center justify-center">
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
                            className="w-8 appearance-none border-none bg-transparent text-center text-xl text-white focus:outline-none focus:ring-0"
                            style={{ caretColor: 'transparent' }}
                          />
                          {!digit && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                              <span className="text-xl text-white/30">0</span>
                            </div>
                          )}
                        </div>
                        {i < 5 && <span className="text-xl text-white/20">|</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <motion.p
                  className="cursor-pointer text-sm text-white/50 transition-colors hover:text-white/70"
                  whileHover={{ scale: 1.02 }}
                >
                  Resend code
                </motion.p>
                <div className="flex w-full gap-3">
                  <motion.button
                    onClick={handleBack}
                    className="w-[30%] rounded-full bg-white px-6 py-3 font-medium text-black transition-colors hover:bg-white/90"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    className={cn(
                      'flex-1 rounded-full py-3 font-medium border transition-all duration-300',
                      code.every((d) => d !== '')
                        ? 'bg-white text-black border-transparent hover:bg-white/90 cursor-pointer'
                        : 'bg-[#111] text-white/50 border-white/10 cursor-not-allowed',
                    )}
                    disabled={!code.every((d) => d !== '')}
                    whileHover={code.every((d) => d !== '') ? { scale: 1.02 } : {}}
                    whileTap={code.every((d) => d !== '') ? { scale: 0.98 } : {}}
                  >
                    Continue
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
                className="space-y-6 text-center"
              >
                <div className="space-y-1">
                  <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                    <WaveText text="You're in!" className="text-[2.5rem] font-bold tracking-tight text-white" />
                  </h1>
                  <p className="text-[1.25rem] font-light text-white/50">
                    <WaveText text="Welcome" className="text-[1.25rem] font-light text-white/50" />
                  </p>
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
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  onClick={onSuccess}
                  className="w-full rounded-full bg-white py-3 font-medium text-black transition-colors hover:bg-white/90"
                >
                  <WaveText text="Enter your memory" className="font-medium text-black" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
