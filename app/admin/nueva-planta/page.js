'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImagenPlanta from '../../components/ImagenPlanta'
import PlantaCareFields from '../../components/PlantaCareFields'

export default function NuevaPlanta() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [error, setError] = useState('')
  const selectedImageFileRef = useRef(null)
  const [form, setForm] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    cuidado: '',
    imagen: '',
    categoria: 'interior',
    stock: '',
    luz: '',
    riego: '',
    dificultad: '',
    apta_mascotas: '',
  })

  useEffect(() => {
    let active = true
    fetch('/api/admin/login')
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok || !data.authenticated) {
          router.replace('/admin/login')
          return
        }
        if (active) setCheckingAuth(false)
      })
      .catch(() => router.replace('/admin/login'))
    return () => {
      active = false
    }
  }, [router])

  function handleChange(e) {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }))
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError('Elige una imagen PNG, JPG, WEBP o GIF de máximo 2 MB.')
      e.target.value = ''
      return
    }

    setError('')
    selectedImageFileRef.current = file
    const reader = new FileReader()
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, imagen: reader.result }))
    }
    reader.onerror = () => setError('No se pudo leer la imagen seleccionada.')
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
    setError('')
    try {
      const imagenValue = selectedImageFileRef.current
        ? await readFileAsDataUrl(selectedImageFileRef.current)
        : form.imagen
      const response = await fetch('/api/plantas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          imagen: imagenValue,
          precio: Number(form.precio),
          stock: Number(form.stock),
          apta_mascotas: form.apta_mascotas === '' ? null : form.apta_mascotas === 'true',
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo guardar la planta.')
      router.push('/admin')
    } catch (err) {
      setError(err.message || 'No se pudo guardar la planta.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) return <p className="p-8 text-green-700">Verificando acceso...</p>

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/admin" className="text-green-700 hover:underline text-sm mb-6 inline-block">
        ← Volver al panel
      </Link>
      <h1 className="text-3xl font-bold text-green-900 mb-8">Nueva planta</h1>

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

        <PlantaCareFields form={form} onChange={handleChange} />

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Foto de la planta</label>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImageChange}
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

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading}
          className="bg-green-700 text-white py-3 rounded-xl font-semibold hover:bg-green-800 transition disabled:opacity-50 mt-2">
          {loading ? 'Guardando...' : 'Agregar planta'}
        </button>
      </form>
    </main>
  )
}