import Link from 'next/link'

export default function ProductCard({ planta }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden hover:shadow-md transition">
      <div className="bg-green-50 h-40 flex items-center justify-center text-7xl">
        {planta.imagen}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-green-900 text-lg">{planta.nombre}</h3>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {planta.categoria}
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{planta.descripcion}</p>
        <div className="flex justify-between items-center">
          <span className="text-green-800 font-bold text-lg">
            ${planta.precio.toLocaleString('es-CL')}
          </span>
          <Link
            href={`/planta/${planta.id}`}
            className="bg-green-700 text-white px-4 py-2 rounded-full text-sm hover:bg-green-800 transition"
          >
            Ver más
          </Link>
        </div>
      </div>
    </div>
  )
}