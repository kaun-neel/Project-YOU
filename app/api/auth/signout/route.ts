import { NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/session'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.headers.set(
    'Set-Cookie',
    `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`,
  )
  return res
}
