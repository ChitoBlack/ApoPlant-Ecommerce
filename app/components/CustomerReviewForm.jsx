'use client'

import { useEffect, useState } from 'react'

export default function CustomerReviewForm({ accessToken }) {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submittingPlant, setSubmittingPlant] = useState(null)

  useEffect(() => {
    let active = true

    fetch('/api/reviews/eligible', {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'No se pudieron consultar tus compras.')
        if (active) setPurchases(result.compras || [])
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [accessToken])

  async function submitReview(event, purchase) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setError('')
    setSuccess('')
    setSubmittingPlant(purchase.plant_id)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          order_id: purchase.order_id,
          plant_id: purchase.plant_id,
          display_name: formData.get('display_name'),
          rating: Number(formData.get('rating')),
          comment: formData.get('comment'),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'No se pudo enviar la reseña.')
      setPurchases((current) => current.filter((item) => item.plant_id !== purchase.plant_id))
      setSuccess(`Gracias por compartir tu experiencia con ${purchase.plant_name}.`)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmittingPlant(null)
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6" aria-labelledby="review-form-title">
      <h2 id="review-form-title" className="text-xl font-bold text-green-950">Comparte tu experiencia</h2>
      <p className="mt-2 text-sm text-gray-600">
        Puedes reseñar plantas de pedidos con pago aprobado. La reseña aparecerá en el inicio.
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-amber-900">Buscando compras elegibles...</p>
      ) : purchases.length === 0 && !error ? (
        <p className="mt-4 rounded-xl bg-white/70 p-4 text-sm text-amber-950">
          Cuando tengas una compra aprobada, aquí podrás dejar una reseña.
        </p>
      ) : (
        <div className="mt-5 grid gap-4">
          {purchases.map((purchase) => (
            <form
              key={purchase.plant_id}
              onSubmit={(event) => submitReview(event, purchase)}
              className="grid gap-3 rounded-xl bg-white p-4 sm:grid-cols-2"
            >
              <h3 className="font-semibold text-green-900 sm:col-span-2">{purchase.plant_name}</h3>
              <label className="text-sm font-medium text-green-900">
                Tu nombre público
                <input
                  name="display_name"
                  required
                  maxLength={40}
                  defaultValue="Cliente ApoPlant"
                  className="mt-1 w-full rounded-lg border border-green-200 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-green-900">
                Calificación
                <select name="rating" defaultValue="5" className="mt-1 w-full rounded-lg border border-green-200 bg-white px-3 py-2">
                  <option value="5">5 estrellas</option>
                  <option value="4">4 estrellas</option>
                  <option value="3">3 estrellas</option>
                  <option value="2">2 estrellas</option>
                  <option value="1">1 estrella</option>
                </select>
              </label>
              <label className="text-sm font-medium text-green-900 sm:col-span-2">
                Tu reseña
                <textarea
                  name="comment"
                  required
                  minLength={15}
                  maxLength={500}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-green-200 px-3 py-2"
                  placeholder="¿Cómo ha sido tu experiencia con esta planta?"
                />
              </label>
              <button
                type="submit"
                disabled={submittingPlant === purchase.plant_id}
                className="w-fit rounded-full bg-green-800 px-5 py-2 font-semibold text-white transition hover:bg-green-900 disabled:opacity-60 sm:col-span-2"
              >
                {submittingPlant === purchase.plant_id ? 'Enviando...' : 'Publicar reseña'}
              </button>
            </form>
          ))}
        </div>
      )}

      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="mt-4 text-sm font-medium text-green-800">{success}</p>}
    </section>
  )
}
