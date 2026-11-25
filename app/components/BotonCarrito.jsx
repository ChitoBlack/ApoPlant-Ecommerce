'use client'

import { useEffect, useRef, useState } from 'react'
import { useCarrito } from '../context/CarritoContext'

export default function BotonCarrito({ planta }) {
  const { agregarAlCarrito } = useCarrito()
  const [confirmado, setConfirmado] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  function handleClick() {
    agregarAlCarrito(planta)
    setConfirmado(true)

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => setConfirmado(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={Number(planta.stock) <= 0}
      className="bg-green-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-800 transition disabled:cursor-not-allowed disabled:opacity-50"
    >
      {Number(planta.stock) <= 0 ? 'Agotado' : confirmado ? '✓ Añadido' : '🛒 Agregar al carrito'}
    </button>
  )
}