import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

export const ADMIN_COOKIE_NAME = 'apoplant_admin'
const SESSION_DURATION_SECONDS = 60 * 60 * 8

function getSigningSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || ''
}

function sign(value) {
  return createHmac('sha256', getSigningSecret()).update(value).digest('base64url')
}

export function createAdminSession() {
  const secret = getSigningSecret()
  if (!secret) return null

  const payload = Buffer.from(
    JSON.stringify({ expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000 })
  ).toString('base64url')

  return `${payload}.${sign(payload)}`
}

export function isValidAdminSession(token) {
  const secret = getSigningSecret()
  if (!secret || typeof token !== 'string') return false

  const [payload, signature, extra] = token.split('.')
  if (!payload || !signature || extra) return false

  const expected = Buffer.from(sign(payload))
  const received = Buffer.from(signature)
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return false
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return Number.isFinite(data.expiresAt) && data.expiresAt > Date.now()
  } catch {
    return false
  }
}

export function hasAdminSession(request) {
  return isValidAdminSession(request.cookies.get(ADMIN_COOKIE_NAME)?.value)
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: SESSION_DURATION_SECONDS,
}
