'use client'

import { useRef, useState } from 'react'
import ProductCard from './ProductCard'
import { PLANT_CARE_OPTIONS } from '../lib/plantas-care'

export default function CatalogoCarruseles({ plantas }) {
  const carruselesRef = useRef(new Map())
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas')
  const [filtros, setFiltros] = useState({
    luz: '',
    riego: '',
    dificultad: '',
    apta_mascotas: '',
  })

  const plantasVisibles = plantas.filter((planta) => (
    (!filtros.luz || planta.luz === filtros.luz) &&
    (!filtros.riego || planta.riego === filtros.riego) &&
    (!filtros.dificultad || planta.dificultad === filtros.dificultad) &&
    (!filtros.apta_mascotas || String(planta.apta_mascotas) === filtros.apta_mascotas) &&
    (categoriaSeleccionada === 'Todas' || planta.categoria === categoriaSeleccionada)
  ))
  const plantasPorCategoria = new Map()

  for (const planta of plantasVisibles) {
    const categoria = String(planta.categoria || 'Sin categoría').trim() || 'Sin categoría'
    const grupo = plantasPorCategoria.get(categoria) || []
    grupo.push(planta)
    plantasPorCategoria.set(categoria, grupo)
  }

  const categorias = [...new Set(plantas.map((planta) => (
    String(planta.categoria || 'Sin categoría').trim() || 'Sin categoría'
  )))].sort((a, b) => {
    const prioridad = (categoria) => {
      const posicion = ['interior', 'exterior'].indexOf(categoria.toLowerCase())
      return posicion === -1 ? 2 : posicion
    }

    return prioridad(a) - prioridad(b) || a.localeCompare(b, 'es')
  })
  const categoriasVisibles = [...plantasPorCategoria.keys()].sort((a, b) => (
    categorias.indexOf(a) - categorias.indexOf(b)
  ))

  function limpiarFiltros() {
    setCategoriaSeleccionada('Todas')
    setFiltros({ luz: '', riego: '', dificultad: '', apta_mascotas: '' })
  }

  function desplazarCarrusel(categoria, direccion) {
    const carrusel = carruselesRef.current.get(categoria)
    if (!carrusel) return

    carrusel.scrollBy({
      left: carrusel.clientWidth * 0.8 * direccion,
      behavior: 'smooth',
    })
  }

  if (plantas.length === 0) {
    return (
      <div id="plantas">
        <p className="rounded-2xl border border-green-100 bg-white p-6 text-gray-600">
          Aún no hay plantas disponibles en el catálogo.
        </p>
      </div>
    )
  }

  return (
    <div id="plantas">
      <div role="group" aria-label="Filtrar por categoría" className="mb-6 flex flex-wrap gap-2">
        {['Todas', ...categorias].map((categoria) => {
          const seleccionada = categoriaSeleccionada === categoria
          const nombreCategoria = categoria === 'Todas'
            ? 'Todas'
            : categoria.charAt(0).toUpperCase() + categoria.slice(1)

          return (
            <button
              key={categoria}
              type="button"
              onClick={() => setCategoriaSeleccionada(categoria)}
              aria-pressed={seleccionada}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                seleccionada
                  ? 'border-green-800 bg-green-800 text-white'
                  : 'border-green-200 bg-white text-green-800 hover:bg-green-50'
              }`}
            >
              {nombreCategoria}
            </button>
          )
        })}
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(PLANT_CARE_OPTIONS).map(([campo, opciones]) => (
          <label key={campo} className="text-sm font-medium text-green-900">
            {campo === 'luz' ? 'Luz' : campo === 'riego' ? 'Frecuencia de riego' : 'Dificultad'}
            <select
              value={filtros[campo]}
              onChange={(event) => setFiltros((actuales) => ({ ...actuales, [campo]: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-green-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">Cualquiera</option>
              {opciones.map((opcion) => (
                <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
              ))}
            </select>
          </label>
        ))}
        <label className="text-sm font-medium text-green-900">
          Compatibilidad con mascotas
          <select
            value={filtros.apta_mascotas}
            onChange={(event) => setFiltros((actuales) => ({ ...actuales, apta_mascotas: event.target.value }))}
            className="mt-1 w-full rounded-xl border border-green-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="">Cualquiera</option>
            <option value="true">Apta para mascotas</option>
            <option value="false">No apta para mascotas</option>
          </select>
        </label>
      </div>

      {plantasVisibles.length === 0 ? (
        <div className="rounded-2xl border border-green-100 bg-green-50 p-6 text-center">
          <p className="text-green-900">No encontramos plantas con esos filtros.</p>
          <button
            type="button"
            onClick={limpiarFiltros}
            className="mt-3 font-semibold text-green-800 underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
      <div className="space-y-10">
        {categoriasVisibles.map((categoria, index) => {
          const plantasCategoria = plantasPorCategoria.get(categoria)
          const nombreCategoria = categoria.charAt(0).toUpperCase() + categoria.slice(1)
          const headingId = `catalogo-categoria-${index}`

          return (
            <section key={categoria} aria-labelledby={headingId}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 id={headingId} className="text-2xl font-bold text-green-900">
                    {nombreCategoria}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {plantasCategoria.length} {plantasCategoria.length === 1 ? 'planta' : 'plantas'}
                  </p>
                </div>
                {plantasCategoria.length > 1 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => desplazarCarrusel(categoria, -1)}
                      aria-label={`Ver plantas anteriores de ${nombreCategoria}`}
                      className="h-10 w-10 rounded-full border border-green-200 text-green-700 transition hover:bg-green-50"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => desplazarCarrusel(categoria, 1)}
                      aria-label={`Ver más plantas de ${nombreCategoria}`}
                      className="h-10 w-10 rounded-full border border-green-200 text-green-700 transition hover:bg-green-50"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>

              <div
                ref={(element) => {
                  if (element) carruselesRef.current.set(categoria, element)
                  else carruselesRef.current.delete(categoria)
                }}
                aria-label={`Plantas de ${nombreCategoria}`}
                className="catalogo-carrusel flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4"
              >
                {plantasCategoria.map((planta) => (
                  <div key={planta.id} className="w-[min(85vw,320px)] shrink-0 snap-start">
                    <ProductCard planta={planta} />
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
      )}
    </div>
  )
}
