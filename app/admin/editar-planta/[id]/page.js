'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ImagenPlanta from '../../../components/ImagenPlanta'
import { supabase } from '../../../lib/supabase'

export default function EditarPlanta() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const selectedImageFileRef = useRef(null)
  const [form, setForm] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    cuidado: '',
    imagen: '',
    categoria: 'interior',
    stock: '',
  })

  useEffect(() => {
    async function cargarPlanta() {
      if (!id) {
        setLoadingData(false)
        return
      }

      setLoadingData(true)

      try {
        let data = null
        let error = null

        if (supabase) {
          const response = await supabase.from('plantas').select('*').eq('id', id).single()
          data = response.data
          error = response.error
        }

        if (error || !data) {
          throw new Error(error?.message || 'No se encontró la planta')
        }

        setForm({
          nombre: data.nombre || '',
          precio: data.precio ?? '',
          descripcion: data.descripcion || '',
          cuidado: data.cuidado || '',
          imagen: data.imagen || '',
          categoria: data.categoria || 'interior',
          stock: data.stock ?? '',
        })
      } catch (err) {
        console.error(err)
        alert('No se pudo cargar la planta')
        router.push('/admin')
      } finally {
        setLoadingData(false)
      }
    }

    cargarPlanta()
  }, [id, router])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    selectedImageFileRef.current = file
    const reader = new FileReader()
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, imagen: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  async function readFileAsDataUrl(file) {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
      reader.readAsDataURL(file)
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    let imagenValue = form.imagen
    if (selectedImageFileRef.current) {
      imagenValue = await readFileAsDataUrl(selectedImageFileRef.current)
    }

    const response = await fetch(`/api/plantas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        imagen: imagenValue,
        precio: Number(form.precio),
        stock: Number(form.stock),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      alert('Error al guardar: ' + (data.error || 'No se pudo guardar la planta'))
    } else {
      router.push('/admin')
    }
    setLoading(false)
  }

  if (loadingData) {
    return <p className="p-8 text-green-700">Cargando planta...</p>
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/admin" className="text-green-700 hover:underline text-sm mb-6 inline-block">
        ← Volver al panel
      </Link>
      <h1 className="text-3xl font-bold text-green-900 mb-8">Editar planta</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required
              className="w-full border border-green-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"/>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Precio (CLP)</label>
            <input name="precio" type="number" value={form.precio} onChange={handleChange} required
              className="w-full border border-green-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"/>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-500 mb-1 block">Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} required
            className="w-full border border-green-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"/>
        </div>

        <div>
          <label className="text-sm text-gray-500 mb-1 block">Cuidados</label>
          <input name="cuidado" value={form.cuidado} onChange={handleChange} required
            className="w-full border border-green-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"/>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Foto de la planta</label>
            <input type="file" accept="image/*" onChange={handleImageChange}
              className="w-full border border-green-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"/>
            {form.imagen && (
              <div className="mt-3 h-24 w-24 rounded-xl overflow-hidden border border-green-100 bg-green-50">
                <ImagenPlanta src={form.imagen} alt={form.nombre || 'Previsualización'} className="h-full w-full" />
              </div>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Categoría</label>
            <select name="categoria" value={form.categoria} onChange={handleChange}
              className="w-full border border-green-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="interior">Interior</option>
              <option value="exterior">Exterior</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Stock</label>
            <input name="stock" type="number" value={form.stock} onChange={handleChange} required
              className="w-full border border-green-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"/>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="bg-green-700 text-white py-3 rounded-xl font-semibold hover:bg-green-800 transition disabled:opacity-50 mt-2">
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </main>
  )
}
