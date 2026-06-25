import { createClient } from '@supabase/supabase-js'
import { plantas as datosPlantas } from '../data/plantas'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

export async function getPlantas() {
  if (supabase) {
    const { data, error } = await supabase
      .from('plantas')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error && data) {
      return data
    }

    console.error('Error cargando plantas desde Supabase:', error)
  }

  return datosPlantas
}

export async function getPlantaById(id) {
  if (supabase) {
    const { data, error } = await supabase
      .from('plantas')
      .select('*')
      .eq('id', id)
      .single()

    if (!error && data) {
      return data
    }

    console.error('Error cargando planta desde Supabase:', error)
  }

  return datosPlantas.find((planta) => String(planta.id) === String(id)) ?? null
}