'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImagenPlanta from '../components/ImagenPlanta'

export default function Admin() {
  const [plantas, setPlantas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const cargarPlantas = useCallback(async () => {
    setError('')
    try {
      const res = await fetch('/api/plantas')
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'No se pudieron cargar las plantas.')
      }

      setPlantas(json.plantas || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetch('/api/admin/login')
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok || !data.authenticated) {
          router.replace('/admin/login')
          return
        }
        if (active) cargarPlantas()
      })
      .catch(() => router.replace('/admin/login'))
    return () => {
      active = false
    }
  }, [router, cargarPlantas])

  async function eliminarPlanta(id) {
    if (!confirm('¿Seguro que quieres eliminar esta planta?')) return

    try {
      const response = await fetch(`/api/plantas/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'No se pudo eliminar la planta')
        return
      }

      await cargarPlantas()
    } catch (error) {
      alert('No se pudo eliminar la planta: ' + error.message)
    }
  }

  async function cerrarSesion() {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' })
    } finally {
      router.replace('/admin/login')
    }
  }

  if (loading) return <p className="p-8 text-green-700">Cargando...</p>

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-green-900">Panel Admin</h1>
          <p className="text-gray-500">{plantas.length} plantas en el catálogo</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/pedidos"
            className="border border-green-200 px-5 py-2 rounded-full text-green-700 hover:bg-green-50 transition"
          >
            Pedidos
          </Link>
          <Link
            href="/admin/nueva-planta"
            className="bg-green-700 text-white px-5 py-2 rounded-full font-semibold hover:bg-green-800 transition"
          >
            + Nueva planta
          </Link>
          <button
            onClick={cerrarSesion}
            className="border border-green-200 text-green-700 px-5 py-2 rounded-full hover:bg-green-50 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
            <button type="button" onClick={cargarPlantas} className="ml-3 font-semibold underline">
              Reintentar
            </button>
          </div>
        )}
        {plantas.map((planta) => (
          <div
            key={planta.id}
            className="bg-white border border-green-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm"
          >
            <div className="w-14 h-14 bg-green-50 rounded-xl overflow-hidden shrink-0">
              <ImagenPlanta src={planta.imagen} alt={planta.nombre} className="h-full w-full" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-green-900">{planta.nombre}</h3>
              <p className="text-sm text-gray-500">{planta.categoria} · Stock: {planta.stock}</p>
            </div>
            <p className="font-bold text-green-800">${planta.precio.toLocaleString('es-CL')}</p>
            <div className="flex gap-2">
              <Link
                href={`/admin/editar-planta/${planta.id}`}
                className="text-green-700 hover:text-green-900 transition text-sm border border-green-200 px-3 py-1 rounded-full"
              >
                Editar
              </Link>
              <button
                onClick={() => eliminarPlanta(planta.id)}
                className="text-red-400 hover:text-red-600 transition text-sm border border-red-200 px-3 py-1 rounded-full"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}