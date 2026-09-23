import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { EventRecord } from '../../lib/types'
import { useEventData } from './useEventData'

export default function AdminSettingsPage(){
  const {id}=useParams(); const {event,loading,reload}=useEventData(id); const [form,setForm]=useState<Partial<EventRecord>>({}); const [saved,setSaved]=useState(false)
  useEffect(()=>{if(event)setForm(event)},[event])
  if(loading||!event)return <div className="admin-page">Carregando...</div>
  const save=async(e:React.FormEvent)=>{e.preventDefault();setSaved(false);const {id:_,created_at,updated_at,...payload}=form as EventRecord;await supabase.from('events').update(payload).eq('id',event.id);setSaved(true);reload()}
  return <div className="admin-page"><h1 className="admin-title">Configurações</h1><p className="admin-subtitle">Edite as informações públicas do evento.</p><form onSubmit={save} className="card mt-6 grid gap-4 max-w-3xl"><div className="field"><label>Nome</label><input value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})}/></div><div className="field"><label>Subtítulo</label><input value={form.subtitle||''} onChange={e=>setForm({...form,subtitle:e.target.value})}/></div><div className="grid sm:grid-cols-2 gap-4"><div className="field"><label>Data</label><input type="date" value={form.event_date||''} onChange={e=>setForm({...form,event_date:e.target.value})}/></div><div className="field"><label>Horário</label><input type="time" value={(form.start_time||'').slice(0,5)} onChange={e=>setForm({...form,start_time:e.target.value})}/></div></div><div className="field"><label>Local</label><input value={form.location||''} onChange={e=>setForm({...form,location:e.target.value})}/></div><div className="field"><label>Slug</label><input value={form.slug||''} onChange={e=>setForm({...form,slug:e.target.value})}/></div>{saved&&<div className="rounded-xl bg-green-50 border border-green-200 text-green-800 px-4 py-3 text-sm">Alterações salvas.</div>}<button className="primary-btn">Salvar alterações</button></form></div>
}
