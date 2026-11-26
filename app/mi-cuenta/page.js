'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ImagenPlanta from '../components/ImagenPlanta'
import CustomerReviewForm from '../components/CustomerReviewForm'
import { supabase } from '../lib/supabase'

const paymentLabels = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
}

const fulfillmentLabels = {
  pending: 'Pendiente',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const paymentStatusStyles = {
  pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  approved: 'bg-green-100 text-green-800 ring-green-200',
  rejected: 'bg-red-50 text-red-700 ring-red-200',
  cancelled: 'bg-gray-100 text-gray-700 ring-gray-200',
  refunded: 'bg-blue-50 text-blue-700 ring-blue-200',
}

const fulfillmentStatusStyles = {
  pending: 'bg-gray-100 text-gray-700 ring-gray-200',
  preparing: 'bg-amber-50 text-amber-800 ring-amber-200',
  shipped: 'bg-blue-50 text-blue-700 ring-blue-200',
  delivered: 'bg-green-100 text-green-800 ring-green-200',
  cancelled: 'bg-red-50 text-red-700 ring-red-200',
}

export default function MiCuentaPage() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pedidos, setPedidos] = useState([])
  const [pedidosLoading, setPedidosLoading] = useState(false)
  const [pedidosError, setPedidosError] = useState('')
  const [favoritos, setFavoritos] = useState([])
  const [favoritosLoading, setFavoritosLoading] = useState(false)
  const [favoritosError, setFavoritosError] = useState('')
  const router = useRouter()

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      if (!supabase) {
        if (isMounted) setLoading(false)
        return
      }

      const { data } = await supabase.auth.getSession()
      if (isMounted) {
        setSession(data.session)
        setLoading(false)
      }
    }

    loadSession()

    const { data: authListener } = supabase?.auth.onAuthStateChange((_event, newSession) => {
      if (isMounted) setSession(newSession)
    }) ?? { data: null }

    return () => {
      isMounted = false
      authListener?.subscription?.unsubscribe?.()
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadPedidos() {
      if (!session?.access_token) {
        setPedidos([])
        setPedidosLoading(false)
        setPedidosError('')
        return
      }

      setPedidosLoading(true)
      setPedidosError('')

      try {
        const response = await fetch('/api/mi-cuenta/pedidos', {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        })
        const result = await response.json()

        if (!isMounted) return
        if (!response.ok) throw new Error(result.error || 'No pudimos cargar tus pedidos.')
        setPedidos(Array.isArray(result.pedidos) ? result.pedidos : [])
      } catch (error) {
        if (isMounted) {
          console.error('Error cargando pedidos del perfil:', error)
          setPedidosError(error.message || 'No pudimos cargar tus pedidos.')
        }
      } finally {
        if (isMounted) setPedidosLoading(false)
      }
    }

    loadPedidos()
    return () => {
      isMounted = false
    }
  }, [session])

  useEffect(() => {
    let isMounted = true

    async function loadFavoritos() {
      if (!supabase || !session?.user?.id) {
        if (isMounted) {
          setFavoritos([])
          setFavoritosLoading(false)
        }
        return
      }

      setFavoritosLoading(true)
      setFavoritosError('')

      try {
        const response = await fetch('/api/favoritos', {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        })
        const result = await response.json()

        if (!isMounted) return

        if (!response.ok) {
          setFavoritosError(result.error || 'No pudimos cargar tus favoritos en este momento.')
          setFavoritosLoading(false)
          return
        }

        if (isMounted) {
          setFavoritos((result.plantas || []).map((plant) => ({ ...plant, id: String(plant.id) })))
          setFavoritosLoading(false)
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error cargando favoritos del perfil:', error)
          setFavoritosError(error.message || 'No pudimos cargar tus favoritos en este momento.')
          setFavoritosLoading(false)
        }
      }
    }

    if (!session) {
      queueMicrotask(() => {
        if (!isMounted) return
        setFavoritos([])
        setFavoritosLoading(false)
      })
      return
    }

    loadFavoritos()

    return () => {
      isMounted = false
    }
  }, [session])

  async function handleSignOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleRemoveFavorite(id) {
    if (!supabase || !session?.user?.id) return

    setFavoritosError('')
    try {
      const response = await fetch('/api/favoritos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ planta_id: String(id) }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'No pudimos quitar esta planta de tus favoritos.')
      setFavoritos((current) => current.filter((planta) => String(planta.id) !== String(id)))
    } catch (error) {
      setFavoritosError(error.message || 'No pudimos quitar esta planta de tus favoritos.')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-green-50 px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-green-100 bg-white p-8 text-center shadow-sm">
          <p className="text-green-700">Cargando tu cuenta...</p>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-green-50 px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-green-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-green-900">Tu cuenta</h1>
          <p className="mt-3 text-gray-500">Inicia sesión para ver tu información y gestionar tus compras.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/login?next=/mi-cuenta" className="rounded-full bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800">
              Iniciar sesión
            </Link>
            <Link href="/registro?next=/mi-cuenta" className="rounded-full border border-green-700 px-6 py-3 font-semibold text-green-700 hover:bg-green-100">
              Registrarme
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-green-50 px-6 py-16">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-green-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-700">Mi cuenta</p>
            <h1 className="mt-2 text-3xl font-bold text-green-900">Hola, {session.user?.email?.split('@')[0] || 'cliente'}</h1>
            <p className="mt-2 text-gray-500">Gestiona tu experiencia de compra en ApoPlant.</p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-full border border-green-700 px-5 py-2 font-semibold text-green-700 transition hover:bg-green-100"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
            <p className="text-sm font-semibold text-green-800">Correo electrónico</p>
            <p className="mt-2 text-lg text-green-900">{session.user?.email}</p>
          </div>
          <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
            <p className="text-sm font-semibold text-green-800">Estado</p>
            <p className="mt-2 text-lg text-green-900">Sesión activa</p>
          </div>
        </div>

        <details className="mt-8 overflow-hidden rounded-3xl border border-green-200 bg-white shadow-sm">
          <summary className="cursor-pointer bg-green-800 px-6 py-5 text-white transition-colors hover:bg-green-900">
            <span className="ml-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl">
              🌿
            </span>
            <span className="ml-3 inline-block align-middle">
              <span className="block text-xl font-bold">Mis compras</span>
              <span className="mt-1 block text-sm text-green-100">
                Consulta tus pedidos, productos y estados de envío.
              </span>
            </span>
          </summary>

          <div className="bg-gradient-to-b from-green-50/70 to-white px-4 py-5 sm:px-6">
            {pedidosLoading ? (
              <p className="py-3 text-sm text-green-700">Cargando tus pedidos...</p>
            ) : pedidosError ? (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {pedidosError}
              </p>
            ) : pedidos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-green-200 bg-white p-5 text-sm text-gray-600">
                Aún no tienes compras registradas.
                <Link href="/catalogo" className="ml-1 font-semibold text-green-700 hover:underline">
                  Explorar catálogo
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pedidos.map((pedido) => {
                  const items = Array.isArray(pedido.items) ? pedido.items : []
                  const shipping = pedido.shipping_address && typeof pedido.shipping_address === 'object'
                    ? pedido.shipping_address
                    : {}

                  return (
                    <details key={pedido.id} className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-4 bg-white p-5 transition-colors hover:bg-green-50">
                        <div>
                          <h3 className="font-bold text-green-900">Pedido {pedido.id.slice(0, 8)}</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {new Date(pedido.created_at).toLocaleString('es-CL')}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                            <span className={`rounded-full px-3 py-1 ring-1 ${paymentStatusStyles[pedido.payment_status] || 'bg-gray-100 text-gray-700 ring-gray-200'}`}>
                              Pago: {paymentLabels[pedido.payment_status] || pedido.payment_status}
                            </span>
                            <span className={`rounded-full px-3 py-1 ring-1 ${fulfillmentStatusStyles[pedido.fulfillment_status] || 'bg-gray-100 text-gray-700 ring-gray-200'}`}>
                              Envío: {fulfillmentLabels[pedido.fulfillment_status] || pedido.fulfillment_status}
                            </span>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-green-800">
                          ${Number(pedido.total_amount).toLocaleString('es-CL')} {pedido.currency}
                        </p>
                      </summary>

                      <div className="border-t border-green-100 bg-green-50/60 px-5 pb-5 pt-4">
                        <h4 className="text-sm font-bold text-green-900">Detalle de la compra</h4>
                        {items.length > 0 ? (
                          <ul className="mt-2 divide-y divide-green-100">
                            {items.map((item, index) => (
                              <li key={`${pedido.id}-${item.id || index}`} className="flex justify-between gap-4 py-3 text-sm">
                                <span className="text-gray-700">{item.nombre} × {item.cantidad}</span>
                                <span className="shrink-0 font-semibold text-green-900">
                                  ${(Number(item.precio) * Number(item.cantidad)).toLocaleString('es-CL')}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-sm text-gray-500">No hay productos detallados en este pedido.</p>
                        )}

                        <div className="mt-3 rounded-xl border border-green-100 bg-white p-4 text-sm text-gray-600">
                          <h4 className="font-bold text-green-900">Datos de envío</h4>
                          <p className="mt-1">
                            {shipping.recipient}, {shipping.phone}
                          </p>
                          <p>
                            {shipping.address}, {shipping.commune}, {shipping.region}
                          </p>
                        </div>
                      </div>
                    </details>
                  )
                })}
              </div>
            )}
          </div>
        </details>

        <div className="mt-8 rounded-2xl border border-green-100 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-green-900">Tus favoritos</h2>
              <p className="mt-2 text-gray-500">Guarda plantas que te gusten y vuelve a ellas cuando quieras.</p>
            </div>
            <Link href="/catalogo" className="inline-flex rounded-full bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800">
              Explorar catálogo
            </Link>
          </div>

          {favoritosLoading ? (
            <p className="mt-5 text-sm text-green-700">Cargando favoritos...</p>
          ) : favoritosError ? (
            <p className="mt-5 text-sm text-red-600">{favoritosError}</p>
          ) : favoritos.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-green-200 bg-green-50 p-5 text-sm text-gray-600">
              Aún no tienes plantas guardadas. Descubre el catálogo y marca tus favoritas.
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {favoritos.map((planta) => (
                <div key={planta.id} className="rounded-2xl border border-green-100 bg-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-2xl bg-white">
                      <ImagenPlanta src={planta.imagen} alt={planta.nombre} className="h-full w-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-green-900">{planta.nombre}</p>
                      <p className="text-sm text-green-700">${planta.precio?.toLocaleString('es-CL')}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/planta/${planta.id}`} className="flex-1 rounded-full bg-white px-3 py-2 text-center text-sm font-semibold text-green-700 transition hover:bg-green-100">
                      Ver planta
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemoveFavorite(planta.id)}
                      className="rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <CustomerReviewForm accessToken={session.access_token} />
      </div>
    </main>
  )
}
