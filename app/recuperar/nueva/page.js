'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

function parseRecoveryParams(hash = '', search = '') {
  const hashParams = new URLSearchParams(hash.replace(/^#/, ''))
  const queryParams = new URLSearchParams(search)

  return {
    accessToken: hashParams.get('access_token'),
    refreshToken: hashParams.get('refresh_token'),
    code: queryParams.get('code') || hashParams.get('code'),
    type: queryParams.get('type') || hashParams.get('type'),
    error: hashParams.get('error'),
    errorDescription: hashParams.get('error_description'),
  }
}

export default function NuevaClave() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sessionReady, setSessionReady] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true

    async function initializeRecovery() {
      if (!supabase) {
        if (isMounted) setSessionReady(true)
        return
      }

      const { accessToken, refreshToken, code, error, errorDescription } = parseRecoveryParams(
        window.location.hash,
        window.location.search,
      )

      if (error) {
        if (isMounted) {
          setError(decodeURIComponent(errorDescription || 'El enlace de recuperación no es válido.'))
          setSessionReady(true)
        }
        return
      }

      try {
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError && isMounted) {
            setError(sessionError.message)
          }
        } else if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError && isMounted) {
            setError(exchangeError.message)
          }
        }

        const { data } = await supabase.auth.getSession()
        if (!isMounted) return

        setHasSession(Boolean(data.session))
        setSessionReady(true)
      } catch (err) {
        if (isMounted) {
          setError(err.message || String(err))
          setSessionReady(true)
        }
      }
    }

    initializeRecovery()

    const { data: authListener } = supabase?.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return

      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setHasSession(Boolean(session))
        setSessionReady(true)
      }
    }) || { data: null }

    return () => {
      isMounted = false
      authListener?.subscription?.unsubscribe?.()
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    if (!supabase) {
      setError('No se puede conectar con el servicio de autenticación.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Contraseña actualizada correctamente. Redirigiendo al inicio de sesión...')
        setTimeout(() => router.push('/login'), 2000)
      }
    } catch (err) {
      setError(err.message || String(err))
    }

    setLoading(false)
  }

  if (!sessionReady) {
    return (
      <main className="min-h-screen bg-green-50 px-6 py-16">
        <div className="mx-auto max-w-md rounded-[2rem] border border-green-100 bg-white p-8 shadow-sm text-center">
          <p className="text-green-700">Verificando el enlace de recuperación...</p>
        </div>
      </main>
    )
  }

  if (!hasSession) {
    return (
      <main className="min-h-screen bg-green-50 px-6 py-16">
        <div className="mx-auto max-w-md rounded-[2rem] border border-green-100 bg-white p-8 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-green-900 mb-3">Enlace inválido o expirado</h1>
          <p className="text-sm text-gray-500 mb-6">
            Abre nuevamente el enlace que te llegó por correo o solicita otro para restablecer tu contraseña.
          </p>
          <a href="/recuperar" className="inline-flex rounded-full bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800">
            Solicitar enlace
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-green-50 px-6 py-16">
      <div className="mx-auto max-w-md rounded-[2rem] border border-green-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-green-900 mb-3">Nueva contraseña</h1>
        <p className="text-sm text-gray-500 mb-6">Escribe una nueva contraseña y confírmala para actualizar tu cuenta.</p>

        {message && <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}
        {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-green-900">Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none ring-0 focus:border-green-500"
              placeholder="Ingresa nueva contraseña"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-green-900">Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none ring-0 focus:border-green-500"
              placeholder="Repite la contraseña"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </main>
  )
}
