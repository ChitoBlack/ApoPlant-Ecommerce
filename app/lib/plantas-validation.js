import { PLANT_CARE_OPTIONS } from './plantas-care'

const MAX_IMAGE_LENGTH = 3_000_000

function optionalCareValue(value, options) {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string') return undefined
  return options.some((option) => option.value === value) ? value : undefined
}

function isValidImage(value) {
  if (!value) return true
  if (value.length > MAX_IMAGE_LENGTH) return false

  if (value.startsWith('data:')) {
    return /^data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol)
    } catch {
      return false
    }
  }

  return value.length <= 32
}

export function validatePlantaPayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Los datos de la planta no son válidos.' }
  }

  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : ''
  const descripcion = typeof body.descripcion === 'string' ? body.descripcion.trim() : ''
  const cuidado = typeof body.cuidado === 'string' ? body.cuidado.trim() : ''
  const categoria = body.categoria
  const luz = optionalCareValue(body.luz, PLANT_CARE_OPTIONS.luz)
  const riego = optionalCareValue(body.riego, PLANT_CARE_OPTIONS.riego)
  const dificultad = optionalCareValue(body.dificultad, PLANT_CARE_OPTIONS.dificultad)
  const aptaMascotas = body.apta_mascotas === undefined || body.apta_mascotas === null || body.apta_mascotas === ''
    ? null
    : body.apta_mascotas === true || body.apta_mascotas === 'true'
      ? true
      : body.apta_mascotas === false || body.apta_mascotas === 'false'
        ? false
        : undefined
  const integerPattern = /^(0|[1-9]\d*)$/
  const precioValue = typeof body.precio === 'number' || typeof body.precio === 'string'
    ? String(body.precio).trim()
    : ''
  const stockValue = typeof body.stock === 'number' || typeof body.stock === 'string'
    ? String(body.stock).trim()
    : ''
  const precio = integerPattern.test(precioValue) ? Number(precioValue) : NaN
  const stock = integerPattern.test(stockValue) ? Number(stockValue) : NaN
  const imagen = typeof body.imagen === 'string' ? body.imagen.trim() : ''

  if (!nombre || nombre.length > 160) {
    return { error: 'El nombre es obligatorio y debe tener máximo 160 caracteres.' }
  }
  if (!descripcion || descripcion.length > 5000) {
    return { error: 'La descripción es obligatoria y debe tener máximo 5000 caracteres.' }
  }
  if (!cuidado || cuidado.length > 2000) {
    return { error: 'Los cuidados son obligatorios y deben tener máximo 2000 caracteres.' }
  }
  if (!Number.isSafeInteger(precio) || precio <= 0) {
    return { error: 'El precio debe ser un entero mayor que cero.' }
  }
  if (!Number.isSafeInteger(stock) || stock < 0) {
    return { error: 'El stock debe ser un entero igual o mayor que cero.' }
  }
  if (!['interior', 'exterior'].includes(categoria)) {
    return { error: 'La categoría debe ser interior o exterior.' }
  }
  if (luz === undefined || riego === undefined || dificultad === undefined || aptaMascotas === undefined) {
    return { error: 'Los datos de cuidado de la planta no son válidos.' }
  }
  if (body.imagen !== undefined && typeof body.imagen !== 'string') {
    return { error: 'El formato de imagen no es válido.' }
  }
  if (!isValidImage(imagen)) {
    return { error: 'La imagen debe ser una URL válida o una imagen de hasta 2 MB.' }
  }

  return {
    payload: {
      nombre,
      precio,
      descripcion,
      cuidado,
      imagen,
      categoria,
      stock,
      luz,
      riego,
      dificultad,
      apta_mascotas: aptaMascotas,
    },
  }
}
