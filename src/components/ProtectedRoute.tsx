import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'ok' | 'denied'>('loading')

  useEffect(() => {
    let alive = true
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return alive && setState('denied')
      const { data, error } = await supabase.from('admin_profiles').select('user_id').eq('user_id', session.user.id).maybeSingle()
      if (!alive) return
      setState(!error && data ? 'ok' : 'denied')
    }
    check()
    const { data: listener } = supabase.auth.onAuthStateChange(() => check())
    return () => { alive = false; listener.subscription.unsubscribe() }
  }, [])

  if (state === 'loading') return <div className="min-h-screen grid place-items-center text-[#64756A]">Carregando...</div>
  if (state === 'denied') return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
