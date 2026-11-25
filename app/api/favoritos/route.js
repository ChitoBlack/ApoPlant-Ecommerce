import { NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '../../lib/supabase-server'

async function authenticate(request) {
  const authorization = request.headers.get('authorization') || ''
  if (!authorization.startsWith('Bearer ')) {
    return { response: NextResponse.json({ error: 'Inicia sesión para gestionar tus favoritos.' }, { status: 401 }) }
  }

  const supabase = createSupabaseServiceClient()
  if (!supabase) {
    return { response: NextResponse.json({ error: 'No hay configuración de Supabase en el servidor.' }, { status: 503 }) }
  }

  const { data, error } = await supabase.auth.getUser(authorization.slice(7))
  if (error || !data.user) {
    return { response: NextResponse.json({ error: 'Tu sesión expiró. Inicia sesión nuevamente.' }, { status: 401 }) }
  }

  return { supabase, user: data.user }
}

function validPlantId(value) {
  const id = String(value ?? '')
  if (!/^[1-9]\d*$/.test(id)) return null
  const numberId = Number(id)
  return Number.isSafeInteger(numberId) ? { id, numberId } : null
}

export async function GET(request) {
  const auth = await authenticate(request)
  if (auth.response) return auth.response

  const { data, error } = await auth.supabase
    .from('favoritos')
    .select('planta_id')
    .eq('user_id', auth.user.id)

  if (error) {
    console.error('Error cargando favoritos:', error)
    return NextResponse.json({ error: 'No se pudieron cargar tus favoritos.' }, { status: 500 })
  }

  const ids = [...new Set((data || []).map((favorite) => validPlantId(favorite.planta_id)?.numberId).filter(Boolean))]
  let plantsById = {}

  if (ids.length > 0) {
    const { data: plants, error: plantsError } = await auth.supabase
      .from('plantas')
      .select('*')
      .in('id', ids)

    if (plantsError) {
      console.error('Error cargando datos de plantas favoritas:', plantsError)
      return NextResponse.json({ error: 'No se pudieron cargar los datos de tus plantas favoritas.' }, { status: 500 })
    }

    plantsById = Object.fromEntries((plants || []).map((plant) => [String(plant.id), plant]))
  }

  return NextResponse.json(
    {
      favoritos: (data || []).map((favorite) => String(favorite.planta_id)),
      plantas: (data || [])
        .map((favorite) => plantsById[String(favorite.planta_id)] || null)
        .filter(Boolean),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

export async function POST(request) {
  const auth = await authenticate(request)
  if (auth.response) return auth.response

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'La solicitud no es válida.' }, { status: 400 })
  }

  const plantId = validPlantId(body?.planta_id)
  if (!plantId) {
    return NextResponse.json({ error: 'El identificador de planta no es válido.' }, { status: 400 })
  }

  const { data: plant, error: plantError } = await auth.supabase
    .from('plantas')
    .select('id')
    .eq('id', plantId.numberId)
    .maybeSingle()

  if (plantError) {
    console.error('Error validando planta favorita:', plantError)
    return NextResponse.json({ error: 'No se pudo validar la planta.' }, { status: 500 })
  }
  if (!plant) {
    return NextResponse.json({ error: 'La planta ya no existe en el catálogo.' }, { status: 404 })
  }

  const { error } = await auth.supabase
    .from('favoritos')
    .upsert(
      { user_id: auth.user.id, planta_id: plantId.id },
      { onConflict: 'user_id,planta_id', ignoreDuplicates: true }
    )

  if (error) {
    console.error('Error guardando favorito:', error)
    return NextResponse.json({ error: 'No se pudo guardar la planta en favoritos.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request) {
  const auth = await authenticate(request)
  if (auth.response) return auth.response

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'La solicitud no es válida.' }, { status: 400 })
  }

  const plantId = validPlantId(body?.planta_id)
  if (!plantId) {
    return NextResponse.json({ error: 'El identificador de planta no es válido.' }, { status: 400 })
  }

  const { error } = await auth.supabase
    .from('favoritos')
    .delete()
    .eq('user_id', auth.user.id)
    .eq('planta_id', plantId.id)

  if (error) {
    console.error('Error quitando favorito:', error)
    return NextResponse.json({ error: 'No se pudo quitar la planta de favoritos.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
