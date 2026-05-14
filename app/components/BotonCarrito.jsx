'use client'

import { useCarrito } from '../context/CarritoContext'

export default function BotonCarrito({ planta }) {
  const { agregarAlCarrito } = useCarrito()

  return (
    <button
      onClick={() => agregarAlCarrito(planta)}
      className="bg-green-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-800 transition"
    >
      🛒 Agregar al carrito
    </button>
  )
}