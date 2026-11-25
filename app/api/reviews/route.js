import { NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '../../lib/supabase-server'

const ORDER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function authenticate(request, supabase) {
  const authorization = request.headers.get('authorization') || ''
  if (!authorization.startsWith('Bearer ')) {
    return { error: NextResponse.json({ error: 'Inicia sesión para dejar una reseña.' }, { status: 401 }) }
  }

  const { data, error } = await supabase.auth.getUser(authorization.slice(7))
  if (error || !data.user) {
    return { error: NextResponse.json({ error: 'Tu sesión expiró. Inicia sesión nuevamente.' }, { status: 401 }) }
  }

  return { user: data.user }
}

export async function GET() {
  const supabase = createSupabaseServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'No hay configuración de Supabase en el servidor.' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('plant_reviews')
    .select('id, plant_id, display_name, rating, comment, created_at, plantas(nombre)')
    .order('created_at', { ascending: false })
    .limit(12)

  if (error) {
    console.error('Error cargando reseñas:', error)
    return NextResponse.json({ error: 'No se pudieron cargar las reseñas.' }, { status: 500 })
  }

  return NextResponse.json(
    { reseñas: data || [] },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

export async function POST(request) {
  const supabase = createSupabaseServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'No hay configuración de Supabase en el servidor.' }, { status: 503 })
  }

  const auth = await authenticate(request, supabase)
  if (auth.error) return auth.error

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'La reseña no es válida.' }, { status: 400 })
  }

  const orderId = typeof body?.order_id === 'string' ? body.order_id : ''
  const plantId = Number(body?.plant_id)
  const rating = Number(body?.rating)
  const displayName = typeof body?.display_name === 'string' ? body.display_name.trim() : ''
  const comment = typeof body?.comment === 'string' ? body.comment.trim() : ''

  if (
    !ORDER_ID_PATTERN.test(orderId) ||
    !Number.isSafeInteger(plantId) || plantId <= 0 ||
    !Number.isInteger(rating) || rating < 1 || rating > 5 ||
    displayName.length < 1 || displayName.length > 40 ||
    comment.length < 15 || comment.length > 500
  ) {
    return NextResponse.json({ error: 'Revisa el nombre, la calificación y el texto de la reseña.' }, { status: 400 })
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, items')
    .eq('id', orderId)
    .eq('user_id', auth.user.id)
    .eq('payment_status', 'approved')
    .maybeSingle()

  if (orderError) {
    console.error('Error verificando compra para reseña:', orderError)
    return NextResponse.json({ error: 'No se pudo verificar tu compra.' }, { status: 500 })
  }
  if (!order) {
    return NextResponse.json({ error: 'Solo puedes reseñar plantas de compras con pago aprobado.' }, { status: 403 })
  }

  const purchasedPlant = Array.isArray(order.items)
    && order.items.some((item) => Number(item?.id) === plantId)
  if (!purchasedPlant) {
    return NextResponse.json({ error: 'Esta planta no aparece en el pedido seleccionado.' }, { status: 403 })
  }

  const { error: insertError } = await supabase
    .from('plant_reviews')
    .insert({
      user_id: auth.user.id,
      plant_id: plantId,
      order_id: orderId,
      display_name: displayName,
      rating,
      comment,
    })

  if (insertError?.code === '23505') {
    return NextResponse.json({ error: 'Ya enviaste una reseña para esta planta.' }, { status: 409 })
  }
  if (insertError) {
    console.error('Error guardando reseña:', insertError)
    return NextResponse.json({ error: 'No se pudo guardar la reseña.' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
