'use client'

import { useState } from 'react'
import Link from 'next/link'
import VisorMonstera3D from './VisorMonstera3D'

const plants = [
  {
    name: 'Monstera',
    model: '/models/monstera.glb',
  },
  {
    name: 'Philodendron',
    model: '/models/philodendron.glb',
  },
  {
    name: 'Ave del paraíso',
    model: '/models/bird-of-paradise.glb',
  },
  {
    name: 'Lavanda',
    model: '/models/lavender.glb',
  },
]

export default function HeroPlantSlider() {
  const [activePlant, setActivePlant] = useState(0)

  const showPrevious = () => {
    setActivePlant((current) => (current - 1 + plants.length) % plants.length)
  }

  const showNext = () => {
    setActivePlant((current) => (current + 1) % plants.length)
  }

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-green-200/70 shadow-[0_20px_60px_-20px_rgba(6,95,70,0.45)] min-h-[28rem] md:min-h-[36rem]">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: "url('/img/apoplant.png')" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%),linear-gradient(90deg,rgba(6,78,59,0.88)_0%,rgba(5,150,105,0.72)_45%,rgba(16,185,129,0.45)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.06)_50%,rgba(0,0,0,0.12)_100%)]" />

      <div className="relative z-10 grid min-h-[28rem] items-center gap-2 px-6 py-10 text-white md:min-h-[36rem] md:grid-cols-[1fr_0.82fr] md:px-10">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <div className="mb-4 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-medium uppercase tracking-[0.3em] backdrop-blur-sm">
            Colección premium
          </div>
          <h1 className="mb-4 text-4xl font-bold drop-shadow-lg md:text-5xl">
            Plantas para tu hogar 🌿
          </h1>
          <p className="mb-8 max-w-xl text-lg text-green-50/95 drop-shadow-md md:text-xl">
            Encuentra la planta perfecta para cada rincón de tu casa. Envíos a todo Chile.
          </p>
          <Link
            href="/catalogo"
            className="rounded-full bg-white px-8 py-3 text-lg font-semibold text-green-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-green-50"
          >
            Ver catálogo
          </Link>
        </div>

        <div className="h-[13.5rem] w-full md:h-[31rem]" aria-label={`Modelo 3D de ${plants[activePlant].name}`}>
          <VisorMonstera3D
            key={plants[activePlant].model}
            nombre={plants[activePlant].name}
            modelo={plants[activePlant].model}
            decorativa
            className="h-full"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={showPrevious}
        aria-label="Ver planta anterior"
        className="absolute left-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-2xl text-green-900 shadow-lg transition hover:scale-105 hover:bg-white"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={showNext}
        aria-label="Ver planta siguiente"
        className="absolute right-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-2xl text-green-900 shadow-lg transition hover:scale-105 hover:bg-white"
      >
        ›
      </button>

      <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-2">
        {plants.map((plant, index) => (
          <button
            type="button"
            key={plant.name}
            onClick={() => setActivePlant(index)}
            aria-label={`Ver ${plant.name}`}
            aria-current={index === activePlant}
            className={`h-2.5 rounded-full shadow-sm transition-all ${
              index === activePlant ? 'w-7 bg-white' : 'w-2.5 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
