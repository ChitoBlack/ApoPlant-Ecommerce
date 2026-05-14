import { plantas } from '../data/plantas'
import ProductCard from '../components/ProductCard'

export default function Catalogo() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-green-900 mb-2">Catálogo</h1>
      <p className="text-gray-500 mb-8">Tenemos {plantas.length} plantas disponibles para ti</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {plantas.map((planta) => (
          <ProductCard key={planta.id} planta={planta} />
        ))}
      </div>
    </main>
  )
}