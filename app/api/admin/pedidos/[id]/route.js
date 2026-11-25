import { NextResponse } from 'next/server'
import { hasAdminSession } from '../../../../lib/admin-auth'
import { createSupabaseServiceClient } from '../../../../lib/supabase-server'

const ORDER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const FULFILLMENT_STATUSES = ['pending', 'preparing', 'shipped', 'delivered', 'cancelled']

export async function PATCH(request, { params }) {
  if (!hasAdminSession(request)) {
    return NextResponse.json({ error: 'Debes iniciar sesión como administrador.' }, { status: 401 })
  }

  const { id } = await params
  if (!ORDER_ID_PATTERN.test(id)) {
    return NextResponse.json({ error: 'El identificador del pedido no es válido.' }, { status: 400 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'La solicitud no es válida.' }, { status: 400 })
  }

  const status = body?.fulfillment_status
  if (!FULFILLMENT_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'El estado de envío no es válido.' }, { status: 400 })
  }

  const supabase = createSupabaseServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'No hay configuración de Supabase.' }, { status: 503 })
  }

  const { data: order, error: readError } = await supabase
    .from('orders')
    .select('id, payment_status')
    .eq('id', id)
    .maybeSingle()

  if (readError) {
    console.error('Error buscando pedido:', readError)
    return NextResponse.json({ error: 'No se pudo validar el pedido.' }, { status: 500 })
  }
  if (!order) {
    return NextResponse.json({ error: 'No se encontró el pedido.' }, { status: 404 })
  }
  if (status === 'cancelled' && order.payment_status === 'approved') {
    return NextResponse.json(
      { error: 'Un pago aprobado no se puede cancelar desde aquí; gestiona el reembolso en Mercado Pago.' },
      { status: 409 }
    )
  }
  if (status !== 'cancelled' && order.payment_status !== 'approved') {
    return NextResponse.json(
      { error: 'Solo se puede preparar o enviar un pedido con pago aprobado.' },
      { status: 409 }
    )
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ fulfillment_status: status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error actualizando estado del pedido:', error)
    return NextResponse.json({ error: 'No se pudo actualizar el pedido.' }, { status: 500 })
  }

  return NextResponse.json({ pedido: data })
}
