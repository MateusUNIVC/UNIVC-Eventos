import { useParams } from 'react-router-dom'
import { Modal } from '../../components/Modal'
import { StatCard } from '../../components/StatCard'
import { useEventData } from './useEventData'
import { useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDateBR, formatTime } from '../../lib/utils'

export default function AdminEventOverviewPage(){
  const {id}=useParams(); const {event,registrations,attendance,loading,reload}=useEventData(id)
  const [confirm,setConfirm]=useState<'attendance'|'registration'|null>(null)
  const stats=useMemo(()=>{
    const regEmails=new Set(registrations.map(r=>r.email.toLowerCase()))
    const attEmails=new Set(attendance.map(a=>a.email.toLowerCase()))
    const registeredPresent=[...attEmails].filter(e=>regEmails.has(e)).length
    const spontaneous=attendance.length-registeredPresent
    const absent=registrations.filter(r=>!attEmails.has(r.email.toLowerCase())).length
    return {registeredPresent,spontaneous,absent}
  },[registrations,attendance])
  if(loading||!event) return <div className="admin-page">Carregando...</div>
  const toggle=async(type:'attendance'|'registration')=>{
    const field=type==='attendance'?'attendance_open':'registration_open'; const current=type==='attendance'?event.attendance_open:event.registration_open
    await supabase.from('events').update({[field]:!current}).eq('id',event.id); setConfirm(null); reload()
  }
  return <div className="admin-page">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="admin-title">{event.name}</h1><p className="admin-subtitle">{formatDateBR(event.event_date)} • {formatTime(event.start_time)} • {event.location}</p></div><div className="flex gap-2"><span className={`badge ${event.registration_open?'badge-open':'badge-closed'}`}>Inscrição {event.registration_open?'aberta':'fechada'}</span><span className={`badge ${event.attendance_open?'badge-open':'badge-closed'}`}>Presença {event.attendance_open?'aberta':'fechada'}</span></div></div>
    <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4 mt-7"><StatCard value={registrations.length} label="Inscrições prévias"/><StatCard value={attendance.length} label="Presenças confirmadas"/><StatCard value={stats.registeredPresent} label="Inscritos presentes"/><StatCard value={stats.spontaneous} label="Presentes sem inscrição"/><StatCard value={stats.absent} label="Inscritos ausentes"/></div>
    <div className="card mt-5"><h2 className="font-extrabold text-[#04301D]">Controles do evento</h2><p className="text-sm text-[#64756A] mt-1">Abra ou encerre os formulários públicos manualmente.</p><div className="flex flex-wrap gap-3 mt-5"><button className="secondary-btn" onClick={()=>setConfirm('registration')}>{event.registration_open?'Encerrar inscrições':'Abrir inscrições'}</button><button className={event.attendance_open?'danger-btn':'primary-btn !w-auto'} onClick={()=>setConfirm('attendance')}>{event.attendance_open?'ENCERRAR PRESENÇA':'ABRIR PRESENÇA'}</button></div></div>
    {confirm && <Modal title={confirm==='attendance'?(event.attendance_open?'Encerrar confirmação de presença?':'Abrir confirmação de presença?'):(event.registration_open?'Encerrar inscrições?':'Abrir inscrições?')} onClose={()=>setConfirm(null)}><p className="text-sm text-[#64756A] leading-6">A alteração terá efeito imediato na página pública do evento.</p><div className="flex justify-end gap-3 mt-6"><button className="secondary-btn" onClick={()=>setConfirm(null)}>Cancelar</button><button className="primary-btn !w-auto" onClick={()=>toggle(confirm)}>Confirmar</button></div></Modal>}
  </div>
}
