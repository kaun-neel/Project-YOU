import { SignJWT, jwtVerify } from 'jose'
import { Session } from './auth-types'

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'project-you-dev-secret-change-in-prod-32ch',
)
const COOKIE_NAME = 'py_session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export async function createSessionToken(session: Session): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET)
}

export async function verifySessionToken(
  token: string,
): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as Session
  } catch {
    return null
  }
}

export function setSessionCookie(response: Response, token: string): void {
  response.headers.set(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax`,
  )
}

export function clearSessionCookie(response: Response): void {
  response.headers.set(
    'Set-Cookie',
    `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`,
  )
}

export { COOKIE_NAME }
