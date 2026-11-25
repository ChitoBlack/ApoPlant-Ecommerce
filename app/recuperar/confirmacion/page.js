'use client'

import Link from 'next/link'

export default function RecuperacionConfirmacion() {
  return (
    <main className="min-h-screen bg-green-50 px-6 py-16">
      <div className="mx-auto max-w-md rounded-[2rem] border border-green-100 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700 text-3xl">✅</div>
        <h1 className="text-2xl font-bold text-green-900 mb-3">Revisa tu correo</h1>
        <p className="text-sm text-gray-500 mb-6">
          Te hemos enviado instrucciones para restablecer tu contraseña. Sigue el enlace del email para continuar.
        </p>
        <Link href="/login" className="inline-flex rounded-full bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800">
          Volver a iniciar sesión
        </Link>
      </div>
    </main>
  )
}
