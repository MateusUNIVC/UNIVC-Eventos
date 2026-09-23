import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useEventData } from './useEventData'
import { effectiveCourse, effectivePeriod, formatDateTimeBR } from '../../lib/utils'

export default function AdminRegistrationsPage(){
  const {id}=useParams(); const {event,registrations,attendance,loading}=useEventData(id); const [q,setQ]=useState('')
  const attEmails=useMemo(()=>new Set(attendance.map(a=>a.email.toLowerCase())),[attendance])
  const rows=useMemo(()=>registrations.filter(r=>(r.full_name+' '+r.email).toLowerCase().includes(q.toLowerCase())),[registrations,q])
  if(loading||!event) return <div className="admin-page">Carregando...</div>
  return <div className="admin-page"><div><h1 className="admin-title">Inscrições</h1><p className="admin-subtitle">{event.name} • {registrations.length} inscrição(ões)</p></div>
    <div className="card mt-6"><div className="field max-w-md"><label>Buscar por nome ou e-mail</label><input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Pesquisar..."/></div></div>
    <div className="table-wrap mt-4"><table className="data-table"><thead><tr><th>Nome</th><th>E-mail</th><th>Aluno UNIVC</th><th>Curso</th><th>Período</th><th>Inscrição</th><th>Status</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td className="font-semibold">{r.full_name}</td><td>{r.email}</td><td>{r.is_univc_student?'Sim':'Não'}</td><td>{r.is_univc_student?effectiveCourse(r):'—'}</td><td>{r.is_univc_student?effectivePeriod(r):'—'}</td><td>{formatDateTimeBR(r.registered_at)}</td><td><span className={`badge ${attEmails.has(r.email.toLowerCase())?'badge-open':'badge-closed'}`}>{attEmails.has(r.email.toLowerCase())?'Presente':'Não compareceu'}</span></td></tr>)}</tbody></table></div>
  </div>
}
