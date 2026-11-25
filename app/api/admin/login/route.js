import { NextResponse } from 'next/server'
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createAdminSession,
  hasAdminSession,
} from '../../../lib/admin-auth'

export async function GET(request) {
  return NextResponse.json({ authenticated: hasAdminSession(request) })
}

export async function POST(request) {
  try {
    const body = await request.json()
    const password = body?.password
    const expectedPassword = process.env.ADMIN_PASSWORD || ''

    if (!expectedPassword) {
      return NextResponse.json(
        { error: 'No hay una contraseña de administrador configurada.' },
        { status: 500 }
      )
    }

    if (typeof password === 'string' && password === expectedPassword) {
      const session = createAdminSession()
      if (!session) {
        return NextResponse.json(
          { error: 'No se pudo crear la sesión de administrador.' },
          { status: 500 }
        )
      }

      const response = NextResponse.json({ success: true })
      response.cookies.set(ADMIN_COOKIE_NAME, session, adminCookieOptions)
      return response
    }

    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'La solicitud de acceso no es válida.' }, { status: 400 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_COOKIE_NAME, '', { ...adminCookieOptions, maxAge: 0 })
  return response
}
