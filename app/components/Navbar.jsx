'use client'

import Link from 'next/link'
import { useCarrito } from '../context/CarritoContext'

export default function Navbar() {
  const { totalItems } = useCarrito()

  return (
    <nav className="bg-green-800 text-white p-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">🌿 Plantas Shop</Link>
      <div className="flex gap-6 items-center">
        <Link href="/catalogo">Catálogo</Link>
        <Link href="/carrito" className="relative">
          🛒 Carrito
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-4 bg-yellow-400 text-green-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}