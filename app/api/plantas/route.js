import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })
  : null

export async function POST(request) {
  try {
    const body = await request.json()

    if (!supabase) {
      return NextResponse.json(
        { error: 'No hay configuración de Supabase para crear la planta.' },
        { status: 500 }
      )
    }

    const payload = {
      nombre: body.nombre,
      precio: Number(body.precio),
      descripcion: body.descripcion,
      cuidado: body.cuidado,
      imagen: body.imagen || '',
      categoria: body.categoria || 'interior',
      stock: Number(body.stock),
    }

    const { data, error } = await supabase.from('plantas').insert([payload]).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, planta: data })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
