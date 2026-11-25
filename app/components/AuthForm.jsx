'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

function getSafeNextPath(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return '/catalogo'
  }
  const url = new URL(value, 'https://apoplant.invalid')
  return url.origin === 'https://apoplant.invalid' ? `${url.pathname}${url.search}${url.hash}` : '/catalogo'
}

export default function AuthForm({ mode = 'login', next = '/catalogo' }) {
  const router = useRouter()
  const safeNext = getSafeNextPath(next)
  const isSignup = mode === 'signup'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function checkSession() {
      if (!supabase) return
      const { data } = await supabase.auth.getSession()
      if (isMounted && data.session) {
        router.replace(safeNext)
      }
    }

    checkSession()

    return () => {
      isMounted = false
    }
  }, [safeNext, router])

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setSuccess(false)

    if (!supabase) {
      setMessage('No se pudo conectar con la autenticación en este momento.')
      setLoading(false)
      return
    }

    if (isSignup && password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.')
      setLoading(false)
      return
    }

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name || undefined,
          },
        },
      })

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      if (data.session) {
        setSuccess(true)
        setMessage('Cuenta creada correctamente. Redirigiendo...')
        router.push(safeNext)
        setLoading(false)
        return
      }

      const loginResult = await supabase.auth.signInWithPassword({ email, password })
      if (loginResult.error) {
        setSuccess(true)
        setMessage('Tu cuenta fue creada. Revisa tu correo si necesitas confirmar la dirección o inicia sesión después.')
      } else {
        setSuccess(true)
        setMessage('Cuenta creada correctamente. Redirigiendo...')
        router.push(safeNext)
      }

      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      setSuccess(true)
      setMessage('Sesión iniciada correctamente. Redirigiendo...')
      router.push(safeNext)
    }

    setLoading(false)
  }

  const switchHref = `/${isSignup ? 'login' : 'registro'}?next=${encodeURIComponent(safeNext)}`

  return (
    <main className="min-h-screen bg-green-50 px-6 py-16">
      <div className="mx-auto max-w-md rounded-[2rem] border border-green-100 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-700">ApoPlant</p>
          <h1 className="mt-2 text-3xl font-bold text-green-900">
            {isSignup ? 'Crea tu cuenta' : 'Inicia sesión'}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {isSignup
              ? 'Regístrate para guardar tu información y terminar tu compra con mayor facilidad.'
              : 'Accede a tu cuenta para seguir tu compra y ver tus pedidos.'}
          </p>
        </div>

        {message ? (
          <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${success ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
            {message}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-green-900">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none ring-0 focus:border-green-500"
                placeholder="Tu nombre"
              />
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-green-900">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none ring-0 focus:border-green-500"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-green-900">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none ring-0 focus:border-green-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {isSignup ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-green-900">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none ring-0 focus:border-green-500"
                placeholder="Repite tu contraseña"
              />
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : isSignup ? 'Crear cuenta' : 'Entrar'}
          </button>
        </form>

        {!isSignup && (
          <div className="mt-4 text-center">
            <Link href="/recuperar" className="text-sm text-green-700 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          {isSignup ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <Link href={switchHref} className="font-semibold text-green-700 hover:underline">
            {isSignup ? 'Inicia sesión' : 'Crea una cuenta'}
          </Link>
        </p>
      </div>
    </main>
  )
}
