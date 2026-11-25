'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ImagenPlanta from '../components/ImagenPlanta'
import CustomerReviewForm from '../components/CustomerReviewForm'
import { supabase } from '../lib/supabase'

export default function MiCuentaPage() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
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
