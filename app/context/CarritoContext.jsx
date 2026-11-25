'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CarritoContext = createContext()

function normalizeCart(value) {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const id = item.id
    const price = Number(item.precio)
    const stock = Number(item.stock)
    const quantity = Number(item.cantidad)
    if (
      (typeof id !== 'string' && typeof id !== 'number') ||
      !String(id) ||
      typeof item.nombre !== 'string' ||
      !Number.isSafeInteger(price) || price <= 0 ||
      !Number.isSafeInteger(stock) || stock <= 0 ||
      !Number.isSafeInteger(quantity) || quantity <= 0
    ) return []

    return [{
      ...item,
      precio: price,
      stock,
      cantidad: Math.min(quantity, stock),
      imagen: typeof item.imagen === 'string' ? item.imagen : '',
    }]
  })
}

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState([])

  useEffect(() => {
    if (typeof window === 'undefined') return

    let active = true
    try {
      const guardado = window.localStorage.getItem('apoplant-carrito')
      if (guardado) {
        const carritoGuardado = normalizeCart(JSON.parse(guardado))
        queueMicrotask(() => {
          if (active && Array.isArray(carritoGuardado)) setCarrito(carritoGuardado)
        })
      }
    } catch {}

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('apoplant-carrito', JSON.stringify(carrito))
    }
  }, [carrito])

  function agregarAlCarrito(planta) {
    setCarrito((prev) => {
      const stock = Number(planta.stock)
      if (
        !Number.isSafeInteger(stock) || stock <= 0 ||
        !Number.isSafeInteger(Number(planta.precio)) || Number(planta.precio) <= 0
      ) return prev

      const existe = prev.find((item) => String(item.id) === String(planta.id))
      if (existe) {
        return prev.map((item) =>
          String(item.id) === String(planta.id)
            ? { ...item, cantidad: Math.min(item.cantidad + 1, stock) }
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
      prev.map((item) => (
        String(item.id) === String(id)
          ? { ...item, cantidad: Math.min(cantidad, Number(item.stock) || 0) }
          : item
      ))
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