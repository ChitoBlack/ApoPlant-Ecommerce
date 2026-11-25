'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function RecuperarClave() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState('email')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleRequestCode(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    if (!supabase) {
      setError('No se puede conectar con el servicio de autenticación.')
      setLoading(false)
      return
    }

    try {
      const { error: requestError } = await supabase.auth.resetPasswordForEmail(email.trim())
      if (requestError) {
        setError(requestError.message)
      } else {
        setStep('code')
        setMessage('Si existe una cuenta con ese correo, recibirás un código para restablecer la contraseña.')
      }
    } catch (requestError) {
      setError(requestError.message || 'No se pudo enviar el código.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    if (!supabase) {
      setError('No se puede conectar con el servicio de autenticación.')
      setLoading(false)
      return
    }

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'recovery',
      })

      if (verifyError) {
        setError('El código no es válido o expiró. Revisa el correo o solicita uno nuevo.')
      } else {
        setStep('password')
        setMessage('Correo verificado. Ahora elige una nueva contraseña.')
      }
    } catch (verifyError) {
      setError(verifyError.message || 'No se pudo verificar el código.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdatePassword(event) {
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
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }

      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        setError('La contraseña se actualizó, pero no se pudo cerrar la sesión. Cierra sesión manualmente antes de volver a entrar.')
        return
      }

      router.replace('/login?passwordUpdated=true')
    } catch (updateError) {
      setError(updateError.message || 'No se pudo actualizar la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResendCode() {
    setLoading(true)
    setMessage('')
    setError('')

    if (!supabase) {
      setError('No se puede conectar con el servicio de autenticación.')
      setLoading(false)
      return
    }

    try {
      const { error: requestError } = await supabase.auth.resetPasswordForEmail(email.trim())
      if (requestError) {
        setError(requestError.message)
      } else {
        setCode('')
        setMessage('Si existe una cuenta con ese correo, enviaremos un nuevo código.')
      }
    } catch (requestError) {
      setError(requestError.message || 'No se pudo reenviar el código.')
    } finally {
      setLoading(false)
    }
  }

  const titles = {
    email: 'Recuperar contraseña',
    code: 'Verificar correo',
    password: 'Crear nueva contraseña',
  }

  return (
    <main className="min-h-screen bg-green-50 px-6 py-16">
      <div className="mx-auto max-w-md rounded-[2rem] border border-green-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl text-green-700">🔒</div>
          <div>
            <h1 className="text-2xl font-bold text-green-900">{titles[step]}</h1>
            <p className="text-sm text-gray-500">
              {step === 'email' && 'Te enviaremos un código de verificación a tu correo.'}
              {step === 'code' && `Ingresa el código enviado a ${email}.`}
              {step === 'password' && 'Elige una contraseña segura para tu cuenta.'}
            </p>
          </div>
        </div>

        {message && (
          <div role="status" className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}
        {error && (
          <div role="alert" className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-green-900">Correo electrónico</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none focus:border-green-500"
                placeholder="tu@email.com"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-green-900">Código de verificación</span>
              <input
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\s/g, '').slice(0, 10))}
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={10}
                className="w-full rounded-2xl border border-green-200 px-4 py-3 text-center text-2xl tracking-[0.4em] outline-none focus:border-green-500"
                placeholder="Código del correo"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Verificar código'}
            </button>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="w-full py-2 text-sm font-semibold text-green-700 hover:underline disabled:opacity-50"
            >
              Reenviar código
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setMessage(''); setError('') }}
              className="w-full py-1 text-sm text-gray-500 hover:underline"
            >
              Usar otro correo
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-green-900">Nueva contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none focus:border-green-500"
                placeholder="Mínimo 6 caracteres"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-green-900">Confirmar contraseña</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none focus:border-green-500"
                placeholder="Repite la contraseña"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="font-semibold text-green-700 hover:underline">Volver a iniciar sesión</Link>
        </p>
      </div>
    </main>
  )
}
