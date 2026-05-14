import Link from 'next/link'

export default function Gracias() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-green-100 text-center max-w-md">
        <div className="text-6xl mb-4">🌿</div>
        <h1 className="text-3xl font-bold text-green-900 mb-3">¡Gracias por tu compra!</h1>
        <p className="text-gray-500 mb-6">Tu pedido fue confirmado. Te contactaremos pronto con los detalles del envío.</p>
        <Link
          href="/"
          className="bg-green-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-800 transition"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}