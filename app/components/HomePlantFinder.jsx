'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import ImagenPlanta from './ImagenPlanta'

export default function HomePlantFinder({ plantas }) {
  const [luz, setLuz] = useState('')
  const [riego, setRiego] = useState('')
  const [mascotas, setMascotas] = useState(false)

  const resultados = useMemo(() => plantas
    .filter((planta) => Number(planta.stock) > 0)
    .filter((planta) => !luz || planta.luz === luz)
    .filter((planta) => !riego || planta.riego === riego)
    .filter((planta) => !mascotas || planta.apta_mascotas === true)
    .slice(0, 3), [plantas, luz, riego, mascotas])

  return (
    <section className="mx-auto max-w-6xl px-6 py-16" aria-labelledby="finder-title">
      <div className="grid gap-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm md:grid-cols-[0.8fr_1.2fr] md:p-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-700">
            Encuentra tu planta ideal
          </p>
          <h2 id="finder-title" className="mt-2 text-3xl font-bold text-green-950">
            ¿Qué necesita tu espacio?
          </h2>
          <p className="mt-3 text-gray-600">
            Cuéntanos un poco sobre el lugar y te mostramos opciones disponibles.
          </p>

          <div className="mt-6 grid gap-4">
            <label className="text-sm font-semibold text-green-900">
              ¿Cuánta luz recibe?
              <select
                value={luz}
                onChange={(event) => setLuz(event.target.value)}
                className="mt-1 w-full rounded-xl border border-green-200 bg-white px-3 py-2.5 font-normal text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="">Cualquier iluminación</option>
                <option value="directa">Luz directa</option>
                <option value="indirecta">Luz indirecta</option>
                <option value="sombra">Sombra</option>
              </select>
            </label>

            <label className="text-sm font-semibold text-green-900">
              ¿Con qué frecuencia prefieres regar?
              <select
                value={riego}
                onChange={(event) => setRiego(event.target.value)}
                className="mt-1 w-full rounded-xl border border-green-200 bg-white px-3 py-2.5 font-normal text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="">Sin preferencia</option>
                <option value="bajo">Poco frecuente</option>
                <option value="moderado">Moderado</option>
                <option value="frecuente">Frecuente</option>
              </select>
            </label>

            <label className="flex items-center gap-3 text-sm font-medium text-green-900">
              <input
                type="checkbox"
                checked={mascotas}
                onChange={(event) => setMascotas(event.target.checked)}
                className="h-4 w-4 accent-green-700"
              />
              Necesito que sea apta para mascotas
            </label>
          </div>
        </div>

        <div aria-live="polite">
          <h3 className="mb-4 text-lg font-semibold text-green-900">
            {resultados.length ? 'Estas opciones podrían gustarte' : 'Aún no encontramos coincidencias'}
          </h3>
          {resultados.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {resultados.map((planta) => (
                <Link
                  key={planta.id}
                  href={`/planta/${planta.id}`}
                  className="group rounded-2xl border border-green-100 bg-green-50/60 p-3 transition hover:-translate-y-1 hover:border-green-300 hover:bg-white hover:shadow-md motion-reduce:transform-none"
                >
                  <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl bg-white">
                    <ImagenPlanta
                      src={planta.imagen}
                      alt={planta.nombre}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="mt-3 font-semibold text-green-950">{planta.nombre}</p>
                  <p className="mt-1 text-sm font-bold text-green-800">
                    ${Number(planta.precio).toLocaleString('es-CL')}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-green-50 p-5 text-sm text-green-900">
              Prueba cambiar algún criterio o explora todas las plantas en el catálogo.
              <Link href="/catalogo" className="ml-1 font-semibold underline">
                Ver catálogo
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
