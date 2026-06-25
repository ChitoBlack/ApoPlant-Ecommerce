import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })
  : null

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    if (!supabase) {
      return NextResponse.json(
        { error: 'No hay configuración de Supabase para eliminar la planta.' },
        { status: 500 }
      )
    }

    const normalizedId = Number.isNaN(Number(id)) ? id : Number(id)
    const { error } = await supabase.from('plantas').delete().eq('id', normalizedId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
