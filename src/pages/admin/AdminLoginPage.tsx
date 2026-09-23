import { LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brand } from '../../components/Brand'
import { supabase } from '../../lib/supabase'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error || !data.user) { setLoading(false); return setError('E-mail ou senha inválidos.') }
    const { data: profile } = await supabase.from('admin_profiles').select('user_id').eq('user_id', data.user.id).maybeSingle()
    if (!profile) { await supabase.auth.signOut(); setLoading(false); return setError('Este usuário não possui acesso administrativo.') }
    navigate('/admin', { replace: true })
  }

  return <div className="login-shell">
    <div className="login-visual">
      <div className="text-center max-w-md">
        <img src="/brand/univc-vertical.png" alt="UNIVC" className="w-[290px] max-w-full mx-auto"/>
        <p className="text-white/65 text-sm mt-7">Gestão de inscrições, presenças e listas para certificados.</p>
      </div>
    </div>
    <div className="login-card-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="sm:hidden mb-6"><Brand /></div>
        <div className="w-12 h-12 rounded-2xl bg-[#EDF6DF] text-[#04301D] grid place-items-center mb-5"><LockKeyhole size={22}/></div>
        <h1 className="text-2xl font-black tracking-tight text-[#04301D]">Área administrativa</h1>
        <p className="text-sm text-[#64756A] mt-2">Entre com uma conta administrativa cadastrada no Supabase.</p>
        {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
        <div className="grid gap-4 mt-6">
          <div className="field"><label>E-mail</label><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} autoComplete="email"/></div>
          <div className="field"><label>Senha</label><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="current-password"/></div>
          <button className="primary-btn" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </div>
      </form>
    </div>
  </div>
}
