import Link from 'next/link'
import HeroPlantSlider from './components/HeroPlantSlider'
import HomePlantFinder from './components/HomePlantFinder'
import CustomerReviews from './components/CustomerReviews'
import { getPlantas } from './lib/supabase'

const consejosPorTemporada = {
  primavera: {
    titulo: 'Prepara tus plantas para los nuevos brotes',
    consejo: 'Con más horas de luz, observa cómo responde cada planta y ajusta el riego según la humedad del sustrato.',
  },
  verano: {
    titulo: 'Cuida la humedad cuando sube la temperatura',
    consejo: 'Revisa el sustrato con más frecuencia, pero evita regar por rutina: cada planta tiene necesidades distintas.',
  },
  otoño: {
    titulo: 'Acompaña el cambio de estación',
    consejo: 'A medida que baja la temperatura y la luz, comprueba el sustrato antes de volver a regar.',
  },
  invierno: {
    titulo: 'Un rincón protegido para los días fríos',
    consejo: 'Evita las corrientes de aire frío y consulta la ficha de cada planta antes de cambiar su rutina.',
  },
}

function getSeasonInChile() {
  const month = Number(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Santiago',
    month: 'numeric',
  }).format(new Date()))

  if ([9, 10, 11].includes(month)) return 'primavera'
  if ([12, 1, 2].includes(month)) return 'verano'
  if ([3, 4, 5].includes(month)) return 'otoño'
  return 'invierno'
}

function getWeeklyTipIndex() {
  const date = new Date()
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1)
  const currentDay = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  return Math.floor((currentDay - yearStart) / 604800000)
}

const consejosSemanales = [
  'Antes de regar, revisa la humedad del sustrato: la frecuencia puede cambiar según la estación y el lugar.',
  'Retira las hojas secas con cuidado para mantener tu planta ordenada y observar mejor sus nuevos brotes.',
  'Rota la maceta de vez en cuando para que distintos lados de la planta reciban luz.',
  'Si cambias una planta de lugar, observa cómo responde antes de hacer nuevos ajustes.',
]

export default async function Home() {
  const plantas = await getPlantas()
  const temporada = getSeasonInChile()
  const consejoSemanal = consejosSemanales[getWeeklyTipIndex() % consejosSemanales.length]

  return (
    <main>
      {/* Hero */}
      <section className="bg-green-50 py-20 px-6 text-center">
        <div className="max-w-6xl mx-auto">
          <HeroPlantSlider />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <CustomerReviews />
      </div>

      <HomePlantFinder plantas={plantas} />

      <section className="mx-auto grid max-w-6xl gap-5 px-6 pb-14 md:grid-cols-2" aria-label="Inspiración y cuidados">
        <div className="rounded-[2rem] bg-gradient-to-br from-emerald-800 to-green-950 p-7 text-white shadow-sm md:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-200">
            Inspiración de temporada · Chile
          </p>
          <h2 className="mt-3 text-2xl font-bold capitalize md:text-3xl">
            {consejosPorTemporada[temporada].titulo}
          </h2>
          <p className="mt-3 leading-relaxed text-green-50">
            {consejosPorTemporada[temporada].consejo}
          </p>
          <Link
            href="/catalogo"
            className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 font-semibold text-green-900 transition hover:bg-green-50"
          >
            Explorar plantas
          </Link>
        </div>

        <div className="rounded-[2rem] border border-green-100 bg-green-50 p-7 md:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-700">
            Consejo de la semana
          </p>
          <h2 className="mt-3 text-2xl font-bold text-green-950 md:text-3xl">
            Pequeños cuidados, grandes cambios
          </h2>
          <p className="mt-3 leading-relaxed text-gray-700">{consejoSemanal}</p>
          <p className="mt-4 text-sm text-green-800">
            Revisa los cuidados específicos de cada especie antes de hacer cambios.
          </p>
        </div>
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