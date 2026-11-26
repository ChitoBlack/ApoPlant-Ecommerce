'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCarrito } from '../context/CarritoContext'
import AuthStatus from './AuthStatus'

export default function Navbar() {
  const { totalItems } = useCarrito()

  return (
    <nav className="bg-green-800 text-white p-4 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2 text-xl font-bold">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/15 shadow-lg backdrop-blur-sm">
          <Image
            src="/img/apoplantlogo.png"
            alt="ApoPlant"
            width={28}
            height={28}
            className="h-7 w-7 rounded-full object-cover"
          />
        </div>
        <span>ApoPlant</span>
      </Link>
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/catalogo">Catálogo</Link>
        <Link href="/carrito" className="relative flex items-center gap-2">
          <span>🛒</span>
          <span>Carrito</span>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-4 bg-yellow-400 text-green-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
        <AuthStatus />
      </div>
    </nav>
  )
}