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
      className="bg-green-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-800 transition"
    >
      {confirmado ? '✓ Añadido' : '🛒 Agregar al carrito'}
    </button>
  )
}