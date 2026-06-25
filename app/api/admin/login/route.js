import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { password } = await request.json()
    const expectedPassword = (process.env.ADMIN_PASSWORD || '').trim()

    if (!expectedPassword) {
      return NextResponse.json(
        { error: 'No hay una contraseña de administrador configurada.' },
        { status: 500 }
      )
    }

    if (password === expectedPassword) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
