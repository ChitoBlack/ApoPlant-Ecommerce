import { MercadoPagoConfig, Preference } from 'mercadopago'
import { NextResponse } from 'next/server'

const accessToken = process.env.MP_ACCESS_TOKEN

const client = accessToken
  ? new MercadoPagoConfig({ accessToken })
  : null

export async function POST(request) {
  try {
    const { items } = await request.json()

    if (!client || !process.env.NEXT_PUBLIC_URL) {
      return NextResponse.json(
        { error: 'La configuración de pagos no está disponible en este momento.' },
        { status: 503 }
      )
    }

    const preference = new Preference(client)

    const result = await preference.create({
      body: {
        items: items.map((item) => ({
          title: item.nombre,
          quantity: item.cantidad,
          unit_price: item.precio,
          currency_id: 'CLP',
        })),
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL}/gracias`,
          failure: `${process.env.NEXT_PUBLIC_URL}/carrito`,
          pending: `${process.env.NEXT_PUBLIC_URL}/carrito`,
        },
        auto_return: 'approved',
      }
    })

    return NextResponse.json({ url: result.init_point })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}