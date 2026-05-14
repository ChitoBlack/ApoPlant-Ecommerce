'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function Admin() {
  const [plantas, setPlantas] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem('admin_auth') !== 'true') {
      router.push('/admin/login')
      return
    }
    cargarPlantas()
  }, [])

  async function cargarPlantas() {
    const { data } = await supabase.from('plantas').select('*').order('created_at')
    setPlantas(data || [])
    setLoading(false)
  }

  async function eliminarPlanta(id) {
    if (!confirm('¿Seguro que quieres eliminar esta planta?')) return
    await supabase.from('plantas').delete().eq('id', id)
    cargarPlantas()
  }

  function cerrarSesion() {
    localStorage.removeItem('admin_auth')
    router.push('/admin/login')
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
        {plantas.map((planta) => (
          <div
            key={planta.id}
            className="bg-white border border-green-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm"
          >
            <div className="text-4xl w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              {planta.imagen}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-green-900">{planta.nombre}</h3>
              <p className="text-sm text-gray-500">{planta.categoria} · Stock: {planta.stock}</p>
            </div>
            <p className="font-bold text-green-800">${planta.precio.toLocaleString('es-CL')}</p>
            <button
              onClick={() => eliminarPlanta(planta.id)}
              className="text-red-400 hover:text-red-600 transition text-sm border border-red-200 px-3 py-1 rounded-full"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}