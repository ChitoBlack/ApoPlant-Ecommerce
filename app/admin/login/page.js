'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  function handleLogin(e) {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem('admin_auth', 'true')
      router.push('/admin')
    } else {
      setError('Contraseña incorrecta')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-green-100 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🌿</div>
          <h1 className="text-2xl font-bold text-green-900">Panel Admin</h1>
          <p className="text-gray-500 text-sm mt-1">ApoPlant</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-green-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-green-700 text-white py-3 rounded-xl font-semibold hover:bg-green-800 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  )
}