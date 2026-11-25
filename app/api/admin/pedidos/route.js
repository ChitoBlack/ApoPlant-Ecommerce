import { NextResponse } from 'next/server'
import { hasAdminSession } from '../../../lib/admin-auth'
import { createSupabaseServiceClient } from '../../../lib/supabase-server'

export async function GET(request) {
  if (!hasAdminSession(request)) {
    return NextResponse.json({ error: 'Debes iniciar sesión como administrador.' }, { status: 401 })
  }

  const supabase = createSupabaseServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'No hay configuración de Supabase.' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error cargando pedidos:', error)
    return NextResponse.json({ error: 'No se pudieron cargar los pedidos.' }, { status: 500 })
  }

  return NextResponse.json({ pedidos: data })
}
