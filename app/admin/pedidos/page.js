'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const fulfillmentLabels = {
  pending: 'Pendiente',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const paymentLabels = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
}

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)
  const router = useRouter()

  const cargarPedidos = useCallback(async () => {
    setError('')
    try {
      const response = await fetch('/api/admin/pedidos')
      const data = await response.json()
      if (response.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!response.ok) throw new Error(data.error || 'No se pudieron cargar los pedidos.')
      setPedidos(data.pedidos || [])
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los pedidos.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    let active = true
    queueMicrotask(() => {
      if (active) cargarPedidos()
    })
    return () => {
      active = false
    }
  }, [cargarPedidos])

  async function cambiarEstado(pedido, fulfillment_status) {
    setSavingId(pedido.id)
    setError('')
    try {
      const response = await fetch(`/api/admin/pedidos/${pedido.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfillment_status }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo actualizar el pedido.')
      setPedidos((current) => current.map((item) => item.id === pedido.id ? data.pedido : item))
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el pedido.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/admin" className="mb-6 inline-block text-sm text-green-700 hover:underline">
        ← Volver al panel
      </Link>
      <h1 className="mb-2 text-3xl font-bold text-green-900">Pedidos</h1>
      <p className="mb-8 text-gray-500">Mostrando los últimos 100 pedidos.</p>

      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {loading ? (
        <p className="text-green-700">Cargando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <p className="rounded-2xl border border-green-100 bg-white p-6 text-gray-500">Aún no hay pedidos.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {pedidos.map((pedido) => {
            const pagoAprobado = pedido.payment_status === 'approved'
            return (
              <article key={pedido.id} className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-green-900">Pedido {pedido.id.slice(0, 8)}</h2>
                    <p className="text-sm text-gray-500">{pedido.customer_email}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(pedido.created_at).toLocaleString('es-CL')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-800">
                      ${Number(pedido.total_amount).toLocaleString('es-CL')} {pedido.currency}
                    </p>
                    <p className="text-sm text-gray-600">
                      Pago: {paymentLabels[pedido.payment_status] || pedido.payment_status}
                    </p>
                  </div>
                </div>

                {pedido.stock_issue && (
                  <p role="alert" className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Pago aprobado, pero el inventario no pudo descontarse. Revisa y resuelve este pedido manualmente.
                  </p>
                )}

                <address className="mb-4 not-italic text-sm text-gray-600">
                  <span className="font-semibold text-green-900">Envío:</span>{' '}
                  {pedido.shipping_address?.recipient}, {pedido.shipping_address?.phone},{' '}
                  {pedido.shipping_address?.address}, {pedido.shipping_address?.commune},{' '}
                  {pedido.shipping_address?.region}
                </address>

                <ul className="my-4 list-inside list-disc text-sm text-gray-600">
                  {(Array.isArray(pedido.items) ? pedido.items : []).map((item) => (
                    <li key={`${pedido.id}-${item.id}`}>
                      {item.nombre} × {item.cantidad} — ${Number(item.precio).toLocaleString('es-CL')}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center gap-3 border-t border-green-100 pt-4">
                  <label htmlFor={`estado-${pedido.id}`} className="text-sm font-semibold text-green-900">
                    Estado del envío
                  </label>
                  <select
                    id={`estado-${pedido.id}`}
                    value={pedido.fulfillment_status}
                    onChange={(event) => cambiarEstado(pedido, event.target.value)}
                    disabled={savingId === pedido.id}
                    className="rounded-xl border border-green-200 px-3 py-2 text-sm disabled:opacity-60"
                  >
                    {Object.entries(fulfillmentLabels).map(([value, label]) => (
                      <option
                        key={value}
                        value={value}
                        disabled={(value !== 'cancelled' && !pagoAprobado) || (value === 'cancelled' && pagoAprobado)}
                      >
                        {label}
                      </option>
                    ))}
                  </select>
                  {savingId === pedido.id && <span className="text-sm text-green-700">Guardando...</span>}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}
