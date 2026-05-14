import { MercadoPagoConfig, Preference } from 'mercadopago'
import { NextResponse } from 'next/server'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
})

export async function POST(request) {
  try {
    const { items } = await request.json()

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