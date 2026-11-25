import { PLANT_CARE_OPTIONS } from '../lib/plantas-care'

const fieldLabels = {
  luz: 'Luz',
  riego: 'Riego',
  dificultad: 'Dificultad de cuidado',
}

export default function PlantaCareFields({ form, onChange }) {
  return (
    <fieldset className="rounded-2xl border border-green-100 p-4">
      <legend className="px-2 font-semibold text-green-900">Características de cuidado</legend>
      <p className="mb-4 text-sm text-gray-500">
        Son opcionales; completa solo los datos que hayas confirmado para esta planta.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(PLANT_CARE_OPTIONS).map(([field, options]) => (
          <label key={field} className="text-sm text-gray-600">
            {fieldLabels[field]}
            <select
              name={field}
              value={form[field] || ''}
              onChange={onChange}
              className="mt-1 w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">Sin especificar</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        ))}
        <label className="text-sm text-gray-600">
          Compatibilidad con mascotas
          <select
            name="apta_mascotas"
            value={form.apta_mascotas || ''}
            onChange={onChange}
            className="mt-1 w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="">Sin especificar</option>
            <option value="true">Apta para mascotas</option>
            <option value="false">No apta para mascotas</option>
          </select>
        </label>
      </div>
    </fieldset>
  )
}
