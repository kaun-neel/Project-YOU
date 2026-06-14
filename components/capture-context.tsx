'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

interface CaptureContextValue {
  open: boolean
  openCapture: () => void
  closeCapture: () => void
}

const CaptureContext = createContext<CaptureContextValue | null>(null)

export function CaptureProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const openCapture = useCallback(() => setOpen(true), [])
  const closeCapture = useCallback(() => setOpen(false), [])

  return (
    <CaptureContext.Provider value={{ open, openCapture, closeCapture }}>
      {children}
    </CaptureContext.Provider>
  )
}

export function useCapture() {
  const ctx = useContext(CaptureContext)
  if (!ctx) throw new Error('useCapture must be used within CaptureProvider')
  return ctx
}
