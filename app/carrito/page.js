
'use client'

import { useCarrito } from '../context/CarritoContext'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ImagenPlanta from '../components/ImagenPlanta'
import { supabase } from '../lib/supabase'

export default function Carrito() {
  const { carrito, eliminarDelCarrito, cambiarCantidad, total } = useCarrito()
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [paymentError, setPaymentError] = useState('')
  const [shipping, setShipping] = useState({
    recipient: '',
    phone: '',
    address: '',
    commune: '',
    region: '',
  })
  useEffect(() => {
    async function checkAuth() {
      if (!supabase) {
        setAuthLoading(false)
        return
      }

      const { data } = await supabase.auth.getSession()
      setIsAuthenticated(Boolean(data.session))
      setAuthLoading(false)
    }

    checkAuth()
  }, [])

  async function handlePagar(event) {
    event.preventDefault()
    setLoading(true)
    setPaymentError('')
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData.session) {
        throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
      }

      const res = await fetch('/api/crear-preferencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({ items: carrito, shipping }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo iniciar el pago.')
      if (!data.url) throw new Error('La pasarela no devolvió un enlace de pago.')
      window.location.assign(data.url)
    } catch (error) {
      setPaymentError(error.message || 'No se pudo iniciar el pago.')
    } finally {
      setLoading(false)
    }
  }

  if (carrito.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="text-8xl mb-6">🛒</div>
        <h1 className="text-3xl font-bold text-green-900 mb-3">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-8">Agrega algunas plantas para comenzar</p>
        <Link href="/catalogo" className="bg-green-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-800 transition">
          Ver catálogo
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-green-900 mb-8">Tu carrito</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-4">
          {carrito.map((item) => (
            <div key={item.id} className="bg-white border border-green-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className="bg-green-50 rounded-xl w-16 h-16 overflow-hidden shrink-0">
                <ImagenPlanta src={item.imagen} alt={item.nombre} className="h-full w-full" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-green-900">{item.nombre}</h3>
                <p className="text-green-700 font-semibold text-sm">${item.precio.toLocaleString('es-CL')} c/u</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => cambiarCantidad(item.id, item.cantidad - 1)} className="w-8 h-8 rounded-full bg-green-100 text-green-800 font-bold hover:bg-green-200 transition">−</button>
                <span className="w-6 text-center font-semibold">{item.cantidad}</span>
                <button
                  onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                  disabled={item.cantidad >= Number(item.stock)}
                  className="w-8 h-8 rounded-full bg-green-100 text-green-800 font-bold hover:bg-green-200 transition disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Aumentar cantidad de ${item.nombre}`}
                >+</button>
              </div>
              <p className="font-bold text-green-900 w-20 text-right">${(item.precio * item.cantidad).toLocaleString('es-CL')}</p>
              <button onClick={() => eliminarDelCarrito(item.id)} className="text-red-400 hover:text-red-600 transition text-xl ml-2">✕</button>
            </div>
          ))}
        </div>

        <div className="bg-green-50 rounded-2xl p-6 h-fit sticky top-6">
          <h2 className="text-xl font-bold text-green-900 mb-4">Resumen</h2>
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Subtotal</span>
            <span>${total.toLocaleString('es-CL')}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <span>Envío</span>
            <span className="text-green-600 font-semibold">Gratis</span>
          </div>
          <div className="border-t border-green-200 pt-4 flex justify-between font-bold text-green-900 text-lg mb-6">
            <span>Total</span>
            <span>${total.toLocaleString('es-CL')}</span>
          </div>
          {authLoading ? (
            <div className="mb-4 rounded-2xl border border-green-100 bg-white px-4 py-3 text-sm text-green-700">
              Comprobando sesión...
            </div>
          ) : !isAuthenticated ? (
            <div className="mb-4 rounded-2xl border border-green-200 bg-white px-4 py-4 text-sm text-green-800">
              <p className="font-semibold">¿Quieres terminar tu compra?</p>
              <p className="mt-1 text-gray-500">Inicia sesión o crea una cuenta para continuar.</p>
              <div className="mt-3 flex flex-col gap-2">
                <Link href="/login?next=/carrito" className="rounded-full bg-green-700 px-4 py-2 text-center font-semibold text-white hover:bg-green-800">
                  Iniciar sesión
                </Link>
                <Link href="/registro?next=/carrito" className="rounded-full border border-green-700 px-4 py-2 text-center font-semibold text-green-700 hover:bg-green-100">
                  Registrarme
                </Link>
              </div>
            </div>
          ) : null}
          <form onSubmit={handlePagar} className="space-y-3">
            <h3 className="font-semibold text-green-900">Datos de envío</h3>
            <label className="block text-sm text-gray-600">
              Recibe
              <input
                required
                maxLength={120}
                autoComplete="name"
                value={shipping.recipient}
                onChange={(event) => setShipping({ ...shipping, recipient: event.target.value })}
                className="mt-1 w-full rounded-xl border border-green-200 bg-white px-3 py-2"
              />
            </label>
            <label className="block text-sm text-gray-600">
              Teléfono
              <input
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                pattern="[0-9+() -]{8,20}"
                value={shipping.phone}
                onChange={(event) => setShipping({ ...shipping, phone: event.target.value })}
                className="mt-1 w-full rounded-xl border border-green-200 bg-white px-3 py-2"
              />
            </label>
            <label className="block text-sm text-gray-600">
              Dirección y número
              <input
                required
                maxLength={200}
                autoComplete="street-address"
                value={shipping.address}
                onChange={(event) => setShipping({ ...shipping, address: event.target.value })}
                className="mt-1 w-full rounded-xl border border-green-200 bg-white px-3 py-2"
              />
            </label>
            <label className="block text-sm text-gray-600">
              Comuna
              <input
                required
                maxLength={100}
                autoComplete="address-level2"
                value={shipping.commune}
                onChange={(event) => setShipping({ ...shipping, commune: event.target.value })}
                className="mt-1 w-full rounded-xl border border-green-200 bg-white px-3 py-2"
              />
            </label>
            <label className="block text-sm text-gray-600">
              Región
              <input
                required
                maxLength={100}
                autoComplete="address-level1"
                value={shipping.region}
                onChange={(event) => setShipping({ ...shipping, region: event.target.value })}
                className="mt-1 w-full rounded-xl border border-green-200 bg-white px-3 py-2"
              />
            </label>
            {paymentError && (
              <p role="alert" className="text-sm text-red-600">{paymentError}</p>
            )}
            <button
              type="submit"
              disabled={loading || authLoading || !isAuthenticated}
              className="w-full bg-green-700 text-white py-3 rounded-full font-semibold hover:bg-green-800 transition disabled:opacity-50"
            >
              {loading ? 'Procesando...' : isAuthenticated ? 'Ir a pagar' : 'Necesitas iniciar sesión'}
            </button>
          </form>
          <Link href="/catalogo" className="block text-center text-green-700 text-sm mt-4 hover:underline">
            ← Seguir comprando
          </Link>
        </div>
      </div>
    </main>
  )
}