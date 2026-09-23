import { CalendarDays, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '../../components/Modal'
import { supabase } from '../../lib/supabase'
import type { EventRecord } from '../../lib/types'
import { formatDateBR, slugify } from '../../lib/utils'

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ name:'', subtitle:'', event_type:'Encontro Acadêmico-Cultural', event_date:'', start_time:'19:00', end_time:'', location:'Auditório Principal — UNIVC', slug:'' })

  const load = async () => {
    const { data } = await supabase.from('events').select('*').order('event_date', { ascending:false })
    setEvents((data || []) as EventRecord[]); setLoading(false)
  }
  useEffect(()=>{ load() },[])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    const slug = form.slug || slugify(form.name)
    const { error } = await supabase.from('events').insert({ ...form, slug, description:null, registration_open:true, attendance_open:false, end_time: form.end_time || null })
    if (!error) { setShowNew(false); setForm({ name:'', subtitle:'', event_type:'Encontro Acadêmico-Cultural', event_date:'', start_time:'19:00', end_time:'', location:'Auditório Principal — UNIVC', slug:'' }); load() }
  }

  return <div className="admin-page">
    <div className="flex flex-wrap gap-4 items-end justify-between">
      <div><h1 className="admin-title">Eventos</h1><p className="admin-subtitle">Gerencie os eventos e acesse inscrições, presença e QR Codes.</p></div>
      <button className="primary-btn !w-auto px-5 flex items-center gap-2" onClick={()=>setShowNew(true)}><Plus size={17}/> Novo evento</button>
    </div>
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-7">
      {loading ? <div className="text-sm text-[#64756A]">Carregando...</div> : events.map((event)=><Link to={`/admin/eventos/${event.id}`} className="card hover:shadow-md transition-shadow" key={event.id}>
        <div className="flex items-start justify-between gap-3"><div className="w-10 h-10 rounded-xl bg-[#EDF6DF] grid place-items-center text-[#04301D]"><CalendarDays size={19}/></div><span className={`badge ${event.attendance_open?'badge-open':'badge-closed'}`}>{event.attendance_open?'Presença aberta':'Presença fechada'}</span></div>
        <h2 className="mt-5 font-extrabold text-lg text-[#04301D] leading-tight">{event.name}</h2>
        <p className="text-sm text-[#64756A] mt-1">{formatDateBR(event.event_date)} • {event.location}</p>
      </Link>)}
    </div>
    {showNew && <Modal title="Novo evento" onClose={()=>setShowNew(false)}><form onSubmit={create} className="grid gap-4">
      <div className="field"><label>Nome</label><input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/></div>
      <div className="field"><label>Subtítulo</label><input value={form.subtitle} onChange={(e)=>setForm({...form,subtitle:e.target.value})}/></div>
      <div className="grid sm:grid-cols-2 gap-4"><div className="field"><label>Data</label><input type="date" required value={form.event_date} onChange={(e)=>setForm({...form,event_date:e.target.value})}/></div><div className="field"><label>Horário</label><input type="time" required value={form.start_time} onChange={(e)=>setForm({...form,start_time:e.target.value})}/></div></div>
      <div className="field"><label>Local</label><input required value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})}/></div>
      <div className="field"><label>Slug (opcional)</label><input placeholder="gerado automaticamente" value={form.slug} onChange={(e)=>setForm({...form,slug:e.target.value})}/></div>
      <button className="primary-btn">Criar evento</button>
    </form></Modal>}
  </div>
}
