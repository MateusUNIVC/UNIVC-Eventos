import { CalendarDays, ClipboardCheck, FileSpreadsheet, LayoutDashboard, LogOut, QrCode, Settings, UsersRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { Brand } from './Brand'
import { supabase } from '../lib/supabase'

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean }

export function AdminLayout() {
  const navigate = useNavigate()
  const { id } = useParams()

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login', { replace: true })
  }

  const nav: NavItem[] = id
    ? [
        { to: '/admin', label: 'Eventos', icon: CalendarDays, end: true },
        { to: `/admin/eventos/${id}`, label: 'Visão geral', icon: LayoutDashboard, end: true },
        { to: `/admin/eventos/${id}/inscricoes`, label: 'Inscrições', icon: UsersRound },
        { to: `/admin/eventos/${id}/presencas`, label: 'Presenças', icon: ClipboardCheck },
        { to: `/admin/eventos/${id}/certificados`, label: 'Lista para certificados', icon: FileSpreadsheet },
        { to: `/admin/eventos/${id}/qrcodes`, label: 'QR Codes', icon: QrCode },
        { to: `/admin/eventos/${id}/configuracoes`, label: 'Configurações', icon: Settings },
      ]
    : [{ to: '/admin', label: 'Eventos', icon: CalendarDays, end: true }]

  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <Brand compact />
        <div className="mt-7 text-[10px] uppercase tracking-[.15em] text-white/45 font-bold">Administração</div>
        <nav className="admin-nav mt-3 grid gap-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="mt-auto absolute bottom-5 left-5 right-5 flex items-center gap-2 text-white/65 hover:text-white text-sm font-semibold">
          <LogOut size={17} /> Sair
        </button>
      </aside>
      <div className="admin-content">
        <div className="admin-mobilebar">
          <span className="font-extrabold tracking-tight">UNIVC Eventos</span>
          <button onClick={logout} aria-label="Sair"><LogOut size={20} /></button>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
