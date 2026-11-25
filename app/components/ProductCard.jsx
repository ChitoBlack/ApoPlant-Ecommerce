'use client'

import Link from 'next/link'
import { useCarrito } from '../context/CarritoContext'
import ImagenPlanta from './ImagenPlanta'
import FavoritosButton from './FavoritosButton'

export default function ProductCard({ planta }) {
  const { agregarAlCarrito } = useCarrito()
  const etiquetas = [
    planta.dificultad === 'facil' && 'Fácil de cuidar',
    planta.apta_mascotas === true && 'Apta para mascotas',
    planta.riego === 'bajo' && 'Poco riego',
    planta.categoria === 'interior' && 'Ideal interior',
    planta.categoria === 'exterior' && 'Ideal exterior',
  ].filter(Boolean).slice(0, 2)

  return (
    <div className="group overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transform-none">
      <div className="bg-green-50 h-40 flex items-center justify-center overflow-hidden">
        <div className="h-full w-full transition-transform duration-300 ease-out motion-safe:group-hover:scale-110 motion-safe:group-hover:rotate-1">
          <ImagenPlanta src={planta.imagen} alt={planta.nombre} className="h-full w-full" />
        </div>
      </div>
      <div className="p-4">
        {etiquetas.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5" aria-label="Características">
            {etiquetas.map((etiqueta) => (
              <span
                key={etiqueta}
                className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800"
              >
                {etiqueta}
              </span>
            ))}
          </div>
        )}
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-green-900 text-lg">{planta.nombre}</h3>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {planta.categoria}
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{planta.descripcion}</p>
        <div className="flex justify-between items-center gap-2">
          <span className="text-green-800 font-bold text-lg">
            ${planta.precio.toLocaleString('es-CL')}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => agregarAlCarrito(planta)}
              disabled={Number(planta.stock) <= 0}
              className="bg-green-700 text-white px-3 py-2 rounded-full text-sm hover:bg-green-800 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {Number(planta.stock) > 0 ? 'Agregar' : 'Agotado'}
            </button>
            <Link
              href={`/planta/${planta.id}`}
              className="bg-white border border-green-700 text-green-700 px-3 py-2 rounded-full text-sm hover:bg-green-50 transition"
            >
              Ver más
            </Link>
          </div>
        </div>
        <div className="mt-3">
          <FavoritosButton planta={planta} />
        </div>
      </div>
    </div>
  )
}