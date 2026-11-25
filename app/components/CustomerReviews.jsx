'use client'

import { useEffect, useState } from 'react'

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    fetch('/api/reviews', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'No se pudieron cargar las reseñas.')
        if (active) setReviews(result.reseñas || [])
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
  }, [])

  return (
    <section className="mt-6 rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 md:p-8" aria-labelledby="reviews-title">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
            Experiencias de compradores
          </p>
          <h2 id="reviews-title" className="mt-1 text-2xl font-bold text-green-950">
            La comunidad comparte
          </h2>
        </div>
        <p className="text-sm text-amber-900">Opiniones de compras con pago confirmado</p>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-amber-900">Cargando reseñas...</p>
      ) : error ? (
        <p role="status" className="mt-5 rounded-xl bg-white/70 p-4 text-sm text-amber-950">{error}</p>
      ) : reviews.length === 0 ? (
        <p className="mt-5 rounded-xl bg-white/70 p-4 text-sm text-amber-950">
          Todavía no hay reseñas. Después de una compra aprobada, podrás compartir tu experiencia desde Mi cuenta.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {reviews.slice(0, 4).map((review) => (
            <article key={review.id} className="rounded-2xl border border-white bg-white/80 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-green-950">{review.plantas?.nombre || 'Planta ApoPlant'}</p>
                  <p className="mt-1 text-sm text-gray-600">{review.display_name}</p>
                </div>
                <span className="shrink-0 text-amber-600" aria-label={`${review.rating} de 5 estrellas`}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">{review.comment}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
