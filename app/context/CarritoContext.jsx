'use client'

import { createContext, useContext, useState } from 'react'

const CarritoContext = createContext()

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState([])

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

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0)

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