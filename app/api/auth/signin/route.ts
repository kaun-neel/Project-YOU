import { NextResponse } from 'next/server'
import { getUserByEmail, verifyPassword } from '@/lib/db-auth'
import { createSessionToken, setSessionCookie } from '@/lib/session'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 },
      )
    }

    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 },
      )
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 },
      )
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    })

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    })
    setSessionCookie(res as unknown as Response, token)
    return res
  } catch (err) {
    console.error('[auth/signin]', err)
    return NextResponse.json({ error: 'Sign in failed.' }, { status: 500 })
  }
}
