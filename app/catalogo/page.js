import { getPlantas } from '../lib/supabase'
import CatalogoCarruseles from '../components/CatalogoCarruseles'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Catalogo() {
  const plantas = await getPlantas()

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <section
        className="group relative mb-8 min-h-72 overflow-hidden rounded-[2rem] bg-green-900 shadow-lg md:min-h-80"
        style={{ backgroundImage: "url('/img/apoplant.png')", backgroundPosition: 'center', backgroundSize: 'cover' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-950/90 via-green-900/75 to-green-800/35" />
        <div className="relative flex min-h-72 max-w-3xl flex-col items-start justify-center px-7 py-10 text-white md:min-h-80 md:px-12">
          <p className="mb-3 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            Un espacio más verde empieza aquí
          </p>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight md:text-5xl">
            Encuentra la planta ideal para tu espacio
          </h1>
          <p className="mt-4 max-w-xl text-green-50 md:text-lg">
            Explora opciones para interior y exterior, y descubre los cuidados de cada una.
          </p>
          <Link
            href="#plantas"
            className="mt-6 rounded-full bg-white px-6 py-3 font-semibold text-green-900 transition hover:bg-green-50"
          >
            Explorar plantas
          </Link>
        </div>
      </section>

      <section aria-label="Información del catálogo" className="mb-10 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
          <span className="text-2xl" aria-hidden="true">🪴</span>
          <div>
            <h2 className="font-semibold text-green-900">Para cada espacio</h2>
            <p className="text-sm text-gray-500">Opciones de interior y exterior</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
          <span className="text-2xl" aria-hidden="true">🔎</span>
          <div>
            <h2 className="font-semibold text-green-900">Conoce cada planta</h2>
            <p className="text-sm text-gray-500">Revisa sus detalles y disponibilidad</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
          <span className="text-2xl" aria-hidden="true">🌿</span>
          <div>
            <h2 className="font-semibold text-green-900">Cuidados incluidos</h2>
            <p className="text-sm text-gray-500">Consulta recomendaciones en su ficha</p>
          </div>
        </div>
      </section>

      <div className="mb-5">
        <h2 className="text-2xl font-bold text-green-900">Nuestro catálogo</h2>
        <p className="mt-1 text-gray-500">
          {plantas.length} {plantas.length === 1 ? 'planta disponible' : 'plantas disponibles'}
        </p>
      </div>
      <CatalogoCarruseles plantas={plantas} />

      <section className="mt-12 rounded-3xl bg-green-50 p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">Antes de elegir</p>
        <h2 className="mt-1 text-2xl font-bold text-green-900">Un buen comienzo para tu planta</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div>
            <h3 className="font-semibold text-green-900">Observa la luz</h3>
            <p className="mt-1 text-sm text-gray-600">
              Considera cuánta luz recibe el lugar donde quieres ponerla.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-green-900">Elige por tu espacio</h3>
            <p className="mt-1 text-sm text-gray-600">
              Revisa la categoría y los detalles para encontrar una opción adecuada.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-green-900">Consulta sus cuidados</h3>
            <p className="mt-1 text-sm text-gray-600">
              Cada planta tiene necesidades distintas; revisa su ficha antes de comprar.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}