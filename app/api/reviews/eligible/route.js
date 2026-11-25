import { NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '../../../lib/supabase-server'

export async function GET(request) {
  const supabase = createSupabaseServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'No hay configuración de Supabase en el servidor.' }, { status: 503 })
  }

  const authorization = request.headers.get('authorization') || ''
  if (!authorization.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Inicia sesión para consultar tus compras.' }, { status: 401 })
  }

  const { data: userData, error: authError } = await supabase.auth.getUser(authorization.slice(7))
  if (authError || !userData.user) {
    return NextResponse.json({ error: 'Tu sesión expiró. Inicia sesión nuevamente.' }, { status: 401 })
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, items, created_at')
    .eq('user_id', userData.user.id)
    .eq('payment_status', 'approved')
    .order('created_at', { ascending: false })

  if (ordersError) {
    console.error('Error cargando compras para reseñas:', ordersError)
    return NextResponse.json({ error: 'No se pudieron consultar tus compras.' }, { status: 500 })
  }

  const eligible = new Map()
  for (const order of orders || []) {
    if (!Array.isArray(order.items)) continue
    for (const item of order.items) {
      const plantId = Number(item?.id)
      if (!Number.isSafeInteger(plantId) || plantId <= 0 || eligible.has(plantId)) continue
      eligible.set(plantId, {
        order_id: order.id,
        plant_id: plantId,
        plant_name: typeof item.nombre === 'string' ? item.nombre : 'Planta',
      })
    }
  }

  const plantIds = [...eligible.keys()]
  if (plantIds.length === 0) {
    return NextResponse.json({ compras: [] }, { headers: { 'Cache-Control': 'no-store' } })
  }

  const { data: existingReviews, error: reviewsError } = await supabase
    .from('plant_reviews')
    .select('plant_id')
    .eq('user_id', userData.user.id)
    .in('plant_id', plantIds)

  if (reviewsError) {
    console.error('Error consultando reseñas existentes:', reviewsError)
    return NextResponse.json({ error: 'No se pudo consultar el estado de tus reseñas.' }, { status: 500 })
  }

  const alreadyReviewed = new Set((existingReviews || []).map((review) => Number(review.plant_id)))
  return NextResponse.json(
    { compras: [...eligible.values()].filter((item) => !alreadyReviewed.has(item.plant_id)) },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
