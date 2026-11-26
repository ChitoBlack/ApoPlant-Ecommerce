import { NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '../../../lib/supabase-server'

export async function GET(request) {
  const authorization = request.headers.get('authorization') || ''
  if (!authorization.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Inicia sesión para ver tus pedidos.' }, { status: 401 })
  }

  const supabase = createSupabaseServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'No hay configuración de Supabase.' }, { status: 503 })
  }

  const { data: userData, error: authError } = await supabase.auth.getUser(authorization.slice(7))
  if (authError || !userData.user) {
    return NextResponse.json({ error: 'Tu sesión expiró. Inicia sesión nuevamente.' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('orders')
    .select('id, created_at, items, total_amount, currency, payment_status, fulfillment_status, shipping_address')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error cargando pedidos del usuario:', error)
    return NextResponse.json({ error: 'No se pudieron cargar tus pedidos.' }, { status: 500 })
  }

  return NextResponse.json(
    { pedidos: data },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
