import { NextResponse } from 'next/server'
import { hasAdminSession } from '../../../lib/admin-auth'
import { validatePlantaPayload } from '../../../lib/plantas-validation'
import { createSupabaseServerClient, createSupabaseServiceClient } from '../../../lib/supabase-server'

function normalizeId(id) {
  if (!/^\d+$/.test(id)) return null
  const numberId = Number(id)
  return Number.isSafeInteger(numberId) && numberId > 0 ? numberId : null
}

export async function GET(request, { params }) {
  const id = normalizeId((await params).id)
  if (id === null) {
    return NextResponse.json({ error: 'El identificador no es válido.' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'No hay configuración de Supabase.' }, { status: 503 })
  }

  const { data, error } = await supabase.from('plantas').select('*').eq('id', id).maybeSingle()
  if (error) {
    console.error('Error buscando planta en Supabase:', error)
    return NextResponse.json({ error: 'No se pudo cargar la planta.' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'No se encontró la planta.' }, { status: 404 })
  }

  return NextResponse.json({ planta: data })
}

export async function PUT(request, { params }) {
  try {
    if (!hasAdminSession(request)) {
      return NextResponse.json({ error: 'Debes iniciar sesión como administrador.' }, { status: 401 })
    }

    const id = normalizeId((await params).id)
    if (id === null) {
      return NextResponse.json({ error: 'El identificador no es válido.' }, { status: 400 })
    }

    const validation = validatePlantaPayload(await request.json())
    if (validation.error) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'No hay configuración de Supabase para actualizar la planta.' },
        { status: 500 }
      )
    }

    const { data, error } = await supabase
      .from('plantas')
      .update(validation.payload)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Error actualizando planta en Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: 'No se encontró la planta.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, planta: data })
  } catch (error) {
    console.error('Error procesando actualización de planta:', error)
    return NextResponse.json({ error: 'No se pudo actualizar la planta.' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!hasAdminSession(request)) {
      return NextResponse.json({ error: 'Debes iniciar sesión como administrador.' }, { status: 401 })
    }

    const id = normalizeId((await params).id)
    if (id === null) {
      return NextResponse.json({ error: 'El identificador no es válido.' }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'No hay configuración de Supabase para eliminar la planta.' },
        { status: 500 }
      )
    }

    const { data, error } = await supabase.from('plantas').delete().eq('id', id).select('id').maybeSingle()

    if (error) {
      console.error('Error eliminando planta de Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: 'No se encontró la planta.' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error procesando eliminación de planta:', error)
    return NextResponse.json({ error: 'No se pudo eliminar la planta.' }, { status: 500 })
  }
}
