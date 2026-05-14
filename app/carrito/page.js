'use client'

import { useCarrito } from '../context/CarritoContext'
import Link from 'next/link'

export default function Carrito() {
  const { carrito, eliminarDelCarrito, cambiarCantidad, total } = useCarrito()

  if (carrito.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="text-8xl mb-6">🛒</div>
        <h1 className="text-3xl font-bold text-green-900 mb-3">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-8">Agrega algunas plantas para comenzar</p>
        <Link
          href="/catalogo"
          className="bg-green-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-800 transition"
        >
          Ver catálogo
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-green-900 mb-8">Tu carrito</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {carrito.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-green-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm"
            >
              {/* Emoji */}
              <div className="bg-green-50 rounded-xl w-16 h-16 flex items-center justify-center text-4xl shrink-0">
                {item.imagen}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="font-bold text-green-900">{item.nombre}</h3>
                <p className="text-green-700 font-semibold text-sm">
                  ${item.precio.toLocaleString('es-CL')} c/u
                </p>
              </div>

              {/* Cantidad */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                  className="w-8 h-8 rounded-full bg-green-100 text-green-800 font-bold hover:bg-green-200 transition"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold">{item.cantidad}</span>
                <button
                  onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                  className="w-8 h-8 rounded-full bg-green-100 text-green-800 font-bold hover:bg-green-200 transition"
                >
                  +
                </button>
              </div>

              {/* Subtotal */}
              <p className="font-bold text-green-900 w-20 text-right">
                ${(item.precio * item.cantidad).toLocaleString('es-CL')}
              </p>

              {/* Eliminar */}
              <button
                onClick={() => eliminarDelCarrito(item.id)}
                className="text-red-400 hover:text-red-600 transition text-xl ml-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Resumen */}
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

          <button className="w-full bg-green-700 text-white py-3 rounded-full font-semibold hover:bg-green-800 transition">
            Ir a pagar
          </button>

          <Link
            href="/catalogo"
            className="block text-center text-green-700 text-sm mt-4 hover:underline"
          >
            ← Seguir comprando
          </Link>
        </div>
      </div>
    </main>
  )
}