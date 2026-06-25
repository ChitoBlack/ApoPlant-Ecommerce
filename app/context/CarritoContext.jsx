'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CarritoContext = createContext()

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState([])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const guardado = window.localStorage.getItem('apoplant-carrito')
      if (guardado) {
        setCarrito(JSON.parse(guardado))
      }
    } catch {
      setCarrito([])
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('apoplant-carrito', JSON.stringify(carrito))
    }
  }, [carrito])

  function agregarAlCarrito(planta) {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === planta.id)
      if (existe) {
        return prev.map((item) =>
          item.id === planta.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }
      return [...prev, { ...planta, cantidad: 1 }]
    })
  }

  function eliminarDelCarrito(id) {
    setCarrito((prev) => prev.filter((item) => item.id !== id))
  }

  function cambiarCantidad(id, cantidad) {
    if (cantidad < 1) return
    setCarrito((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cantidad } : item))
    )
  }

  const total = useMemo(
    () => carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
    [carrito]
  )
  const totalItems = useMemo(
    () => carrito.reduce((acc, item) => acc + item.cantidad, 0),
    [carrito]
  )

  return (
    <CarritoContext.Provider value={{
      carrito,
      agregarAlCarrito,
      eliminarDelCarrito,
      cambiarCantidad,
      total,
      totalItems
    }}>
      {children}
    </CarritoContext.Provider>
  )
}

export function useCarrito() {
  return useContext(CarritoContext)
}