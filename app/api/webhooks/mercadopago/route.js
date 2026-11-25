import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { sendOrderReceiptEmail } from '../../../lib/order-receipt-email'
import { createSupabaseServiceClient } from '../../../lib/supabase-server'

function isValidSignature(signatureHeader, requestId, paymentId, secret) {
  if (!signatureHeader || !requestId || !secret) return false

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const [key, ...value] = part.trim().split('=')
      return [key, value.join('=')]
    })
  )

  if (!parts.ts || !parts.v1) return false
  if (!/^[0-9a-f]{64}$/i.test(parts.v1)) return false
  const timestamp = Number(parts.ts)
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > 5 * 60) return false
  const manifest = `id:${paymentId};request-id:${requestId};ts:${parts.ts};`
  const expected = createHmac('sha256', secret).update(manifest).digest()
  let received

  try {
    received = Buffer.from(parts.v1, 'hex')
  } catch {
    return false
  }

  return expected.length === received.length && timingSafeEqual(expected, received)
}

function paymentStatus(status) {
  if (status === 'approved') return 'approved'
  if (status === 'rejected') return 'rejected'
  if (status === 'cancelled' || status === 'expired') return 'cancelled'
  if (status === 'refunded' || status === 'charged_back') return 'refunded'
  if (status === 'in_process' || status === 'pending' || status === 'authorized') return 'pending'
  return null
}

export async function POST(request) {
  const accessToken = process.env.MP_ACCESS_TOKEN
  const webhookSecret = process.env.MP_WEBHOOK_SECRET
  if (!accessToken || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook de pago no configurado.' }, { status: 503 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Notificación inválida.' }, { status: 400 })
  }

  if (body?.type && body.type !== 'payment') {
    return NextResponse.json({ received: true })
  }

  const requestUrl = new URL(request.url)
  const topic = requestUrl.searchParams.get('topic')
  if (topic && topic !== 'payment') {
    return NextResponse.json({ received: true })
  }

  const paymentId = String(requestUrl.searchParams.get('data.id') || body?.data?.id || '')
  if (!/^\d+$/.test(paymentId)) {
    return NextResponse.json({ error: 'Identificador de pago inválido.' }, { status: 400 })
  }

  if (!isValidSignature(
    request.headers.get('x-signature'),
    request.headers.get('x-request-id'),
    paymentId,
    webhookSecret
  )) {
    return NextResponse.json({ error: 'Firma inválida.' }, { status: 401 })
  }

  try {
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(10000),
    })
    if (!paymentResponse.ok) {
      console.error('No se pudo consultar el pago en Mercado Pago:', paymentResponse.status)
      return NextResponse.json({ error: 'No se pudo verificar el pago.' }, { status: 502 })
    }

    const payment = await paymentResponse.json()
    const nextStatus = paymentStatus(payment.status)
    if (!nextStatus || !payment.external_reference) {
      return NextResponse.json({ received: true })
    }

    const supabase = createSupabaseServiceClient()
    if (!supabase) {
      return NextResponse.json({ error: 'No hay configuración de Supabase.' }, { status: 503 })
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, customer_email, items, total_amount, currency, payment_status, stock_committed, stock_issue, receipt_email_status')
      .eq('id', payment.external_reference)
      .maybeSingle()

    if (orderError) {
      console.error('No se pudo buscar el pedido notificado:', orderError)
      return NextResponse.json({ error: 'No se pudo validar el pedido.' }, { status: 500 })
    }
    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 })
    }
    if (order.payment_status === 'refunded') {
      return NextResponse.json({ received: true })
    }
    if (
      order.payment_status === 'approved' &&
      nextStatus !== 'refunded' &&
      nextStatus !== 'approved'
    ) {
      return NextResponse.json({ received: true })
    }

    if (
      Number(payment.transaction_amount) !== Number(order.total_amount) ||
      payment.currency_id !== order.currency
    ) {
      console.error('El monto o la moneda del pago no coincide con el pedido:', order.id)
      return NextResponse.json({ error: 'El pago no coincide con el pedido.' }, { status: 409 })
    }

    let stockIssue = order.stock_issue
    if (nextStatus === 'approved' && !order.stock_committed && !stockIssue) {
      const { error: stockError } = await supabase.rpc('commit_order_stock', {
        p_order_id: order.id,
      })
      if (stockError) {
        console.error('No se pudo descontar el stock del pedido aprobado:', stockError)
        stockIssue = true
      }
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: nextStatus,
        mp_payment_id: paymentId,
        stock_issue: stockIssue,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('No se pudo actualizar el estado del pedido:', updateError)
      return NextResponse.json({ error: 'No se pudo actualizar el pedido.' }, { status: 500 })
    }

    if (nextStatus === 'approved' && order.receipt_email_status !== 'sent') {
      const { data: claimed, error: claimError } = await supabase.rpc('claim_order_receipt_email', {
        p_order_id: order.id,
      })

      if (claimError) {
        console.error('No se pudo reservar el envío del comprobante:', claimError)
        return NextResponse.json({ error: 'No se pudo preparar el comprobante por correo.' }, { status: 500 })
      }

      if (claimed) {
        try {
          await sendOrderReceiptEmail(order)
        } catch (emailError) {
          console.error('No se pudo enviar el comprobante del pedido:', emailError)
          const { error: emailStatusError } = await supabase
            .from('orders')
            .update({ receipt_email_status: 'failed' })
            .eq('id', order.id)

          if (emailStatusError) {
            console.error('No se pudo registrar el fallo del comprobante:', emailStatusError)
          }

          return NextResponse.json({ error: 'No se pudo enviar el comprobante por correo.' }, { status: 502 })
        }

        const { error: sentStatusError } = await supabase
          .from('orders')
          .update({ receipt_email_status: 'sent' })
          .eq('id', order.id)

        if (sentStatusError) {
          console.error('El comprobante se envió, pero no se pudo registrar el estado:', sentStatusError)
          return NextResponse.json({ error: 'No se pudo registrar el envío del comprobante.' }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error procesando notificación de Mercado Pago:', error)
    return NextResponse.json({ error: 'No se pudo procesar la notificación.' }, { status: 500 })
  }
}
