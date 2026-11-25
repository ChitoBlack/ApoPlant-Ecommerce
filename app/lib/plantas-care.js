export const PLANT_CARE_OPTIONS = {
  luz: [
    { value: 'directa', label: 'Luz directa' },
    { value: 'indirecta', label: 'Luz indirecta' },
    { value: 'sombra', label: 'Sombra' },
  ],
  riego: [
    { value: 'bajo', label: 'Poco frecuente' },
    { value: 'moderado', label: 'Moderado' },
    { value: 'frecuente', label: 'Frecuente' },
  ],
  dificultad: [
    { value: 'facil', label: 'Fácil' },
    { value: 'intermedia', label: 'Intermedia' },
    { value: 'avanzada', label: 'Avanzada' },
  ],
}

export function getPlantCareLabel(field, value) {
  return PLANT_CARE_OPTIONS[field]?.find((option) => option.value === value)?.label || ''
}
