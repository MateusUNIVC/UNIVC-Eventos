import { Download, Printer } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useEventData } from './useEventData'
import { effectiveCourse, effectivePeriod, exportAttendanceExcel, exportAttendancePdf } from '../../lib/utils'

export default function AdminCertificatesPage(){
  const {id}=useParams(); const {event,attendance,loading}=useEventData(id)
  if(loading||!event) return <div className="admin-page">Carregando...</div>
  return <div className="admin-page"><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="admin-title">Lista para certificados</h1><p className="admin-subtitle">Somente participantes que confirmaram presença.</p></div><div className="flex gap-2"><button className="secondary-btn flex items-center gap-2" onClick={()=>exportAttendanceExcel(event,attendance)}><Download size={16}/> Exportar Excel</button><button className="primary-btn !w-auto flex items-center gap-2" onClick={()=>exportAttendancePdf(event,attendance)}><Printer size={16}/> Exportar PDF</button></div></div>
    <div className="card mt-6"><div className="text-3xl font-black text-[#04301D]">{attendance.length}</div><div className="text-xs uppercase tracking-wider font-bold text-[#64756A] mt-1">participantes presentes</div></div>
    <div className="table-wrap mt-4"><table className="data-table"><thead><tr><th>Nome</th><th>E-mail</th><th>Curso</th><th>Período</th></tr></thead><tbody>{attendance.map(r=><tr key={r.id}><td className="font-semibold">{r.full_name}</td><td>{r.email}</td><td>{r.is_univc_student?effectiveCourse(r):'—'}</td><td>{r.is_univc_student?effectivePeriod(r):'—'}</td></tr>)}</tbody></table></div>
  </div>
}
