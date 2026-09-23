import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useEventData } from './useEventData'
import { effectiveCourse, effectivePeriod, formatDateTimeBR } from '../../lib/utils'

export default function AdminAttendancePage(){
  const {id}=useParams(); const {event,attendance,loading}=useEventData(id); const [q,setQ]=useState('')
  const rows=useMemo(()=>attendance.filter(r=>(r.full_name+' '+r.email).toLowerCase().includes(q.toLowerCase())),[attendance,q])
  if(loading||!event) return <div className="admin-page">Carregando...</div>
  return <div className="admin-page"><div><h1 className="admin-title">Presenças</h1><p className="admin-subtitle">{event.name} • {attendance.length} presença(s)</p></div>
    <div className="card mt-6"><div className="field max-w-md"><label>Buscar por nome ou e-mail</label><input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Pesquisar..."/></div></div>
    <div className="table-wrap mt-4"><table className="data-table"><thead><tr><th>Nome</th><th>E-mail</th><th>Aluno UNIVC</th><th>Curso</th><th>Período</th><th>Presença</th><th>Inscrição prévia</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td className="font-semibold">{r.full_name}</td><td>{r.email}</td><td>{r.is_univc_student?'Sim':'Não'}</td><td>{r.is_univc_student?effectiveCourse(r):'—'}</td><td>{r.is_univc_student?effectivePeriod(r):'—'}</td><td>{formatDateTimeBR(r.checked_in_at)}</td><td>{r.registration_id?<span className="badge badge-open">Sim</span>:<span className="badge badge-closed">Não</span>}</td></tr>)}</tbody></table></div>
  </div>
}
