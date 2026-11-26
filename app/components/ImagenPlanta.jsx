'use client'

import Image from 'next/image'

export default function ImagenPlanta({ src, alt, className = '', fallback = '🌿' }) {
  const value = typeof src === 'string' ? src.trim() : ''
  const isImageValue = Boolean(value) && /^(data:image\/|https?:\/\/)/i.test(value)

  if (isImageValue) {
    return (
      <Image
        src={value}
        alt={alt}
        width={500}
        height={500}
        unoptimized
        className={`w-full h-full object-cover ${className}`.trim()}
      />
    )
  }

  return (
    <span className={`text-5xl ${className}`.trim()} role="img" aria-label={alt}>
      {value || fallback}
    </span>
  )
}
