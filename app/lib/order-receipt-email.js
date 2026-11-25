import 'server-only'

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatPrice(value, currency) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value))
}

export async function sendOrderReceiptEmail(order) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) {
    throw new Error('Falta configurar RESEND_API_KEY o RESEND_FROM_EMAIL.')
  }

  if (!order.customer_email || !Array.isArray(order.items) || order.items.length === 0) {
    throw new Error('El pedido no contiene un correo o productos válidos para el comprobante.')
  }

  const currency = order.currency || 'CLP'
  const items = order.items.map((item) => {
    const name = String(item.nombre || 'Planta')
    const quantity = Number(item.cantidad)
    const unitPrice = Number(item.precio)
    if (
      !Number.isSafeInteger(quantity) || quantity <= 0 ||
      !Number.isSafeInteger(unitPrice) || unitPrice <= 0
    ) {
      throw new Error('El pedido contiene cantidades o precios inválidos.')
    }

    return {
      name,
      quantity,
      unitPrice,
      subtotal: quantity * unitPrice,
    }
  })

  const orderId = escapeHtml(order.id)
  const safeCurrency = escapeHtml(currency)
  const rowsHtml = items.map((item) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #e5eee7">${escapeHtml(item.name)}</td>
      <td style="padding:12px;border-bottom:1px solid #e5eee7;text-align:center">${item.quantity}</td>
      <td style="padding:12px;border-bottom:1px solid #e5eee7;text-align:right">${escapeHtml(formatPrice(item.unitPrice, currency))}</td>
      <td style="padding:12px;border-bottom:1px solid #e5eee7;text-align:right">${escapeHtml(formatPrice(item.subtotal, currency))}</td>
    </tr>
  `).join('')

  const rowsText = items.map((item) =>
    `${item.name} | Cantidad: ${item.quantity} | Unitario: ${formatPrice(item.unitPrice, currency)} | Subtotal: ${formatPrice(item.subtotal, currency)}`
  ).join('\n')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [order.customer_email],
      subject: `Pago confirmado · Pedido ${String(order.id).slice(0, 8)}`,
      html: `
        <div style="margin:0;background:#f3f8f3;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#173b2a">
          <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #dceade;border-radius:20px;overflow:hidden">
            <div style="background:#166534;padding:28px 32px;color:#fff">
              <p style="margin:0 0 8px;font-size:13px;letter-spacing:2px;text-transform:uppercase">ApoPlant</p>
              <h1 style="margin:0;font-size:26px">¡Gracias por tu compra!</h1>
            </div>
            <div style="padding:28px 32px">
              <p>Tu pago fue aprobado. Este es el detalle de tu pedido:</p>
              <p style="color:#53665a;font-size:14px">Pedido: <strong>${orderId}</strong></p>
              <table style="width:100%;border-collapse:collapse;font-size:14px">
                <thead>
                  <tr style="background:#f0f7f1">
                    <th style="padding:12px;text-align:left">Producto</th>
                    <th style="padding:12px;text-align:center">Cant.</th>
                    <th style="padding:12px;text-align:right">Precio</th>
                    <th style="padding:12px;text-align:right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
              </table>
              <p style="margin:24px 0 0;text-align:right;font-size:20px;font-weight:bold">
                Total pagado: ${escapeHtml(formatPrice(order.total_amount, currency))}
              </p>
              <p style="margin:24px 0 0;color:#53665a;font-size:13px">
                La información sobre la preparación y el envío se comunicará por separado.
              </p>
            </div>
          </div>
        </div>
      `,
      text: [
        '¡Gracias por tu compra en ApoPlant!',
        'Tu pago fue aprobado.',
        `Pedido: ${order.id}`,
        '',
        rowsText,
        '',
        `Total pagado: ${formatPrice(order.total_amount, currency)}`,
      ].join('\n'),
    }),
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(`Resend respondió con estado ${response.status}.`)
  }

  return response.json()
}
