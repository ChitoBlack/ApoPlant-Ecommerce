'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function AuthStatus() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      if (!supabase) {
        if (isMounted) setLoading(false)
        return
      }

      const { data } = await supabase.auth.getSession()
      if (isMounted) {
        setSession(data.session)
        setLoading(false)
      }
    }

    loadSession()

    const { data: authListener } = supabase?.auth.onAuthStateChange((_event, newSession) => {
      if (isMounted) {
        setSession(newSession)
      }
    }) ?? { data: null }

    return () => {
      isMounted = false
      authListener?.subscription?.unsubscribe?.()
    }
  }, [])

  async function handleSignOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    router.refresh()
  }

  if (loading) {
    return null
  }

  if (!session) {
    return (
      <Link href="/login?next=/catalogo" className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
        Iniciar sesión
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/mi-cuenta" className="rounded-full bg-white/15 px-3 py-2 text-sm font-medium transition hover:bg-white/20">
        {session.user?.email || 'Mi cuenta'}
      </Link>
      <button
        onClick={handleSignOut}
        className="rounded-full border border-white/30 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        Salir
      </button>
    </div>
  )
}
