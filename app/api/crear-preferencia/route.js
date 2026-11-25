import { MercadoPagoConfig, Preference } from 'mercadopago'
import { NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '../../lib/supabase-server'

const accessToken = process.env.MP_ACCESS_TOKEN
const client = accessToken
  ? new MercadoPagoConfig({ accessToken })
  : null

function getErrorDetails(error) {
  const source = error && typeof error === 'object' ? error : {}
  const details = {
    name: typeof source.name === 'string' ? source.name : 'Error',
    message: typeof source.message === 'string' ? source.message : String(error),
  }

  const status = Number(source.status ?? source.statusCode)
  if (Number.isFinite(status)) details.status = status

  if (Array.isArray(source.cause)) {
    details.cause = source.cause.map((item) => ({
      code: item?.code,
      description: item?.description,
    }))
  }

  return details
}

export async function POST(request) {
  try {
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'La solicitud de pago no es válida.' }, { status: 400 })
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'La solicitud de pago no es válida.' }, { status: 400 })
    }

    const { items, shipping } = body

    if (!client || !process.env.NEXT_PUBLIC_URL) {
      return NextResponse.json(
        { error: 'La configuración de pagos no está disponible en este momento.' },
        { status: 503 }
      )
    }

    const authHeader = request.headers.get('authorization') || ''
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    const supabase = createSupabaseServiceClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Falta configurar Supabase para procesar pagos en el servidor.' },
        { status: 503 }
      )
    }
    if (!accessToken) {
      return NextResponse.json({ error: 'Inicia sesión para continuar con la compra.' }, { status: 401 })
    }

    const { data: userData, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !userData.user) {
      return NextResponse.json({ error: 'La sesión expiró. Inicia sesión nuevamente.' }, { status: 401 })
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
      return NextResponse.json({ error: 'El carrito no es válido.' }, { status: 400 })
    }

    const shippingAddress = {
      recipient: typeof shipping?.recipient === 'string' ? shipping.recipient.trim() : '',
      phone: typeof shipping?.phone === 'string' ? shipping.phone.trim() : '',
      address: typeof shipping?.address === 'string' ? shipping.address.trim() : '',
      commune: typeof shipping?.commune === 'string' ? shipping.commune.trim() : '',
      region: typeof shipping?.region === 'string' ? shipping.region.trim() : '',
    }
    if (
      !shippingAddress.recipient || shippingAddress.recipient.length > 120 ||
      !/^[0-9+() -]{8,20}$/.test(shippingAddress.phone) ||
      !shippingAddress.address || shippingAddress.address.length > 200 ||
      !shippingAddress.commune || shippingAddress.commune.length > 100 ||
      !shippingAddress.region || shippingAddress.region.length > 100
    ) {
      return NextResponse.json({ error: 'Los datos de envío no son válidos.' }, { status: 400 })
    }

    const quantities = new Map()
    for (const item of items) {
      const id = Number(item?.id)
      const quantity = Number(item?.cantidad)
      if (!Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(quantity) || quantity <= 0 || quantity > 99) {
        return NextResponse.json({ error: 'Hay productos o cantidades no válidos en el carrito.' }, { status: 400 })
      }
      const totalQuantity = (quantities.get(id) || 0) + quantity
      if (totalQuantity > 99) {
        return NextResponse.json({ error: 'La cantidad máxima por producto es 99.' }, { status: 400 })
      }
      quantities.set(id, totalQuantity)
    }

    const { data: products, error: productsError } = await supabase
      .from('plantas')
      .select('id, nombre, precio, stock')
      .in('id', [...quantities.keys()])

    if (productsError) {
      console.error('Error validando productos para el pago:', productsError)
      return NextResponse.json({ error: 'No se pudieron validar los productos del carrito.' }, { status: 500 })
    }

    if (!products || products.length !== quantities.size) {
      return NextResponse.json({ error: 'Uno o más productos ya no están disponibles.' }, { status: 409 })
    }

    for (const product of products) {
      const quantity = quantities.get(Number(product.id))
      if (!Number.isSafeInteger(Number(product.precio)) || Number(product.precio) <= 0) {
        return NextResponse.json({ error: `El precio de ${product.nombre} no es válido.` }, { status: 409 })
      }
      if (!Number.isSafeInteger(Number(product.stock)) || Number(product.stock) < quantity) {
        return NextResponse.json({ error: `No hay suficiente stock de ${product.nombre}.` }, { status: 409 })
      }
    }

    const orderItems = products.map((product) => ({
      id: product.id,
      nombre: product.nombre,
      cantidad: quantities.get(Number(product.id)),
      precio: Number(product.precio),
    })).sort((a, b) => Number(a.id) - Number(b.id))
    const total = orderItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
    if (!Number.isSafeInteger(total)) {
      return NextResponse.json({ error: 'El total del carrito no es válido.' }, { status: 400 })
    }

    let baseUrl
    try {
      baseUrl = new URL(process.env.NEXT_PUBLIC_URL)
      if (!['http:', 'https:'].includes(baseUrl.protocol)) throw new Error('Invalid protocol')
    } catch {
      return NextResponse.json({ error: 'La URL del sitio no está configurada correctamente.' }, { status: 503 })
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userData.user.id,
        customer_email: userData.user.email || '',
        shipping_address: shippingAddress,
        items: orderItems,
        total_amount: total,
        currency: 'CLP',
      })
      .select('id')
      .single()

    if (orderError || !order) {
      console.error('Error guardando pedido en Supabase:', getErrorDetails(orderError))
      return NextResponse.json({ error: 'No se pudo registrar el pedido.' }, { status: 500 })
    }

    const preference = new Preference(client)
    let result
    try {
      const preferenceBody = {
        items: products.map((product) => ({
          title: product.nombre,
          quantity: quantities.get(Number(product.id)),
          unit_price: Number(product.precio),
          currency_id: 'CLP',
        })),
        back_urls: {
          success: new URL(`/gracias?pedido=${encodeURIComponent(order.id)}`, baseUrl).toString(),
          failure: new URL('/carrito', baseUrl).toString(),
          pending: new URL('/carrito', baseUrl).toString(),
        },
        external_reference: order.id,
        auto_return: 'approved',
      }

      if (process.env.MP_WEBHOOK_SECRET) {
        preferenceBody.notification_url = new URL('/api/webhooks/mercadopago', baseUrl).toString()
      }

      result = await preference.create({
        body: preferenceBody,
      })
    } catch (error) {
      const { error: cancelError } = await supabase
        .from('orders')
        .update({ payment_status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', order.id)
      if (cancelError) console.error('No se pudo cerrar el pedido sin preferencia:', cancelError)
      throw error
    }

    if (!result.init_point) {
      console.error('Mercado Pago no devolvió una URL de pago.')
      await supabase
        .from('orders')
        .update({ payment_status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', order.id)
      return NextResponse.json({ error: 'No se pudo iniciar el pago.' }, { status: 502 })
    }

    const { error: preferenceError } = await supabase
      .from('orders')
      .update({ mp_preference_id: result.id })
      .eq('id', order.id)

    if (preferenceError) {
      console.error('No se pudo asociar la preferencia al pedido:', preferenceError)
      await supabase
        .from('orders')
        .update({ payment_status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', order.id)
      return NextResponse.json({ error: 'No se pudo registrar el pago del pedido.' }, { status: 500 })
    }

    return NextResponse.json({ url: result.init_point })
  } catch (error) {
    const details = getErrorDetails(error)
    console.error('Error creando preferencia de pago:', details)
    return NextResponse.json({
      error: 'No se pudo iniciar el pago.',
      ...(process.env.NODE_ENV === 'development' ? { detail: details } : {}),
    }, { status: 500 })
  }
}