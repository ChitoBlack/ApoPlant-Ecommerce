'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function FavoritosButton({ planta }) {
  const [loading, setLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadFavoriteState() {
      if (!supabase) {
        if (isMounted) setSessionReady(true)
        return
      }

      const { data, error: sessionError } = await supabase.auth.getSession()
      if (!isMounted) return

      if (sessionError) {
        setError(sessionError.message)
        setSessionReady(true)
        return
      }

      if (!data.session) {
        setIsAuthenticated(false)
        setSessionReady(true)
        return
      }

      setIsAuthenticated(true)
      const response = await fetch('/api/favoritos', {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
        cache: 'no-store',
      })
      const result = await response.json()

      if (!isMounted) return

      if (!response.ok) {
        setError(result.error || 'No se pudieron cargar tus favoritos.')
      } else {
        setIsFavorite(result.favoritos?.includes(String(planta.id)) ?? false)
      }

      setSessionReady(true)
    }

    loadFavoriteState().catch((loadError) => {
      if (!isMounted) return
      setError(loadError.message || 'No se pudieron cargar tus favoritos.')
      setSessionReady(true)
    })

    return () => {
      isMounted = false
    }
  }, [planta.id])

  async function toggleFavorite() {
    if (!supabase) return

    const { data, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !data.session) {
      setError(sessionError?.message || 'No se encontró la sesión.')
      return
    }

    setLoading(true)
    setError('')
    const plantaId = String(planta.id)

    try {
      const response = await fetch('/api/favoritos', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({ planta_id: plantaId }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'No se pudo actualizar el favorito.')
      setIsFavorite(!isFavorite)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  if (!sessionReady) {
    return null
  }

  return (
    <div className="space-y-2">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {isAuthenticated ? (
        <button
          type="button"
          onClick={toggleFavorite}
          disabled={loading}
          className={`rounded-full px-3 py-2 text-sm font-semibold transition ${isFavorite ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-white border border-green-700 text-green-700 hover:bg-green-50'}`}
        >
          {loading ? '...' : isFavorite ? '❤️ Guardado' : '♡ Guardar'}
        </button>
      ) : (
        <Link href="/login" className="text-sm font-semibold text-green-700 hover:underline">
          Inicia sesión para guardar
        </Link>
      )}
    </div>
  )
}
