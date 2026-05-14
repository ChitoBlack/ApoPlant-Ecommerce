import Link from 'next/link'

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-green-50 py-20 px-6 text-center">
        <h1 className="text-5xl font-bold text-green-900 mb-4">
          Plantas para tu hogar 🌿
        </h1>
        <p className="text-green-700 text-xl mb-8 max-w-xl mx-auto">
          Encuentra la planta perfecta para cada rincón de tu casa. Envíos a todo Chile.
        </p>
        <Link
          href="/catalogo"
          className="bg-green-700 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-800 transition"
        >
          Ver catálogo
        </Link>
      </section>

      {/* Beneficios */}
      <section className="py-16 px-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-green-100">
          <div className="text-4xl mb-3">🚚</div>
          <h3 className="font-bold text-green-900 text-lg mb-2">Envío rápido</h3>
          <p className="text-gray-500 text-sm">Despachamos en 24–48 horas a todo Chile</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-green-100">
          <div className="text-4xl mb-3">🌱</div>
          <h3 className="font-bold text-green-900 text-lg mb-2">Plantas sanas</h3>
          <p className="text-gray-500 text-sm">Cultivadas con cuidado y garantía de calidad</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-green-100">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="font-bold text-green-900 text-lg mb-2">Asesoría gratis</h3>
          <p className="text-gray-500 text-sm">Te ayudamos a elegir la planta ideal para ti</p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-800 text-white text-center py-16 px-6">
        <h2 className="text-3xl font-bold mb-4">¿No sabes qué planta elegir?</h2>
        <p className="text-green-200 mb-8">Explora nuestro catálogo y encuentra tu favorita</p>
        <Link
          href="/catalogo"
          className="bg-white text-green-800 px-8 py-3 rounded-full font-semibold hover:bg-green-100 transition"
        >
          Explorar ahora
        </Link>
      </section>
    </main>
  )
}