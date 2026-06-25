import { getPlantaById } from '../../lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import BotonCarrito from '../../components/BotonCarrito'
import ImagenPlanta from '../../components/ImagenPlanta'

export default async function DetallePlanta({ params }) {
  const { id } = await params
  const planta = await getPlantaById(id)

  if (!planta) return notFound()

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/catalogo" className="text-green-700 hover:underline text-sm mb-8 inline-block">
        ← Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-4">
        <div className="bg-green-50 rounded-3xl flex items-center justify-center h-80 overflow-hidden">
          <ImagenPlanta src={planta.imagen} alt={planta.nombre} className="h-full w-full" />
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full w-fit mb-3">
            {planta.categoria}
          </span>
          <h1 className="text-4xl font-bold text-green-900 mb-3">{planta.nombre}</h1>
          <p className="text-gray-500 mb-6">{planta.descripcion}</p>

          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-green-800 mb-1">🌿 Cuidados</p>
            <p className="text-sm text-green-700">{planta.cuidado}</p>
          </div>

          <p className="text-sm text-gray-400 mb-4">
            Stock disponible: <span className="text-green-700 font-semibold">{planta.stock} unidades</span>
          </p>

          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-green-800">
              ${planta.precio.toLocaleString('es-CL')}
            </span>
            <BotonCarrito planta={planta} />
          </div>
        </div>
      </div>
    </main>
  )
}