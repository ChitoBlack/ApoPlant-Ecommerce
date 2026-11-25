import { NextResponse } from 'next/server'
import { hasAdminSession } from '../../lib/admin-auth'
import { validatePlantaPayload } from '../../lib/plantas-validation'
import { createSupabaseServerClient, createSupabaseServiceClient } from '../../lib/supabase-server'

export async function POST(request) {
  try {
    if (!hasAdminSession(request)) {
      return NextResponse.json({ error: 'Debes iniciar sesión como administrador.' }, { status: 401 })
    }

    const validation = validatePlantaPayload(await request.json())
    if (validation.error) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'No hay configuración de Supabase para crear la planta.' },
        { status: 500 }
      )
    }

    const { data, error } = await supabase
      .from('plantas')
      .insert([validation.payload])
      .select()
      .single()

    if (error) {
      console.error('Error creando planta en Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, planta: data })
  } catch (error) {
    console.error('Error procesando creación de planta:', error)
    return NextResponse.json({ error: 'No se pudo crear la planta.' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: 'No hay configuración de Supabase.' }, { status: 500 })
    }

    const { data, error } = await supabase.from('plantas').select('*').order('created_at', { ascending: true })

    if (error) {
      console.error('Error cargando plantas desde Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ plantas: data })
  } catch (error) {
    console.error('Error procesando consulta de plantas:', error)
    return NextResponse.json({ error: 'No se pudieron cargar las plantas.' }, { status: 500 })
  }
}
