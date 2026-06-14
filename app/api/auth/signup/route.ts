import { NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/db-auth'
import { createSessionToken, setSessionCookie } from '@/lib/session'

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json()

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name and password are required.' },
        { status: 400 },
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 },
      )
    }

    const existing = await getUserByEmail(email)
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 },
      )
    }

    const user = await createUser(email, name, password)

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    })

    const res = NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 },
    )
    setSessionCookie(res as unknown as Response, token)
    return res
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg.includes('TransactionCanceledException') || msg.includes('ConditionalCheckFailed')) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 },
      )
    }
    console.error('[auth/signup]', err)
    return NextResponse.json({ error: 'Sign up failed. Please try again.' }, { status: 500 })
  }
}
