import { CheckCircle2, Clock3 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { EventHero } from '../../components/EventHero'
import { ParticipantForm } from '../../components/ParticipantForm'
import { supabase } from '../../lib/supabase'
import type { EventRecord, ParticipantInput } from '../../lib/types'
import { formatDateTimeBR } from '../../lib/utils'

export default function AttendancePage() {
  const { slug = '' } = useParams()
  const [event, setEvent] = useState<EventRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ name: string; checkedAt: string; duplicate?: boolean } | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.rpc('get_public_event', { p_slug: slug })
      if (!error && data) setEvent(data as EventRecord)
      setLoading(false)
    }
    load()
  }, [slug])

  const submit = async (form: ParticipantInput) => {
    setSubmitting(true); setError('')
    const { data, error } = await supabase.rpc('confirm_event_attendance', {
      p_event_slug: slug,
      p_full_name: form.full_name,
      p_email: form.email,
      p_is_univc_student: form.is_univc_student,
      p_course: form.is_univc_student ? form.course : null,
      p_custom_course: form.is_univc_student ? form.custom_course || null : null,
      p_period: form.is_univc_student ? form.period : null,
      p_custom_period: form.is_univc_student ? form.custom_period || null : null,
    })
    setSubmitting(false)
    if (error) return setError('Não foi possível registrar sua presença. Tente novamente.')
    if (data?.code === 'closed') return setError('A confirmação de presença está encerrada neste momento.')
    if (data?.code === 'duplicate') return setSuccess({ name: data.full_name || form.full_name, checkedAt: data.checked_in_at, duplicate: true })
    if (!data?.ok) return setError(data?.message || 'Não foi possível registrar sua presença.')
    setSuccess({ name: form.full_name, checkedAt: data.checked_in_at })
  }

  if (loading) return <div className="min-h-screen grid place-items-center text-[#64756A]">Carregando evento...</div>
  if (!event) return <div className="min-h-screen grid place-items-center p-6"><div className="status-panel"><h1 className="section-title">Evento não encontrado</h1></div></div>

  return <div className="shell">
    <EventHero event={event}/>
    <main className="public-main"><div className="container-public">
      {success ? (
        <div className="success-panel">
          <div className="status-icon"><CheckCircle2 size={34}/></div>
          <h2>{success.duplicate ? 'Presença já confirmada.' : 'Presença confirmada!'}</h2>
          <p className="mt-3 text-white/80 text-sm">{success.name}</p>
          <p className="mt-1 text-white/65 text-xs">{formatDateTimeBR(success.checkedAt)}</p>
          <div className="mt-5 rounded-2xl bg-white/8 border border-white/15 p-4 text-sm text-white/85">Sua participação foi registrada para fins de certificação.</div>
        </div>
      ) : !event.attendance_open ? (
        <div className="status-panel">
          <div className="status-icon"><Clock3 size={30}/></div>
          <h2 className="section-title">Confirmação de presença ainda não disponível.</h2>
          <p className="section-copy">A presença será liberada no início das palestras.</p>
        </div>
      ) : (
        <div className="form-card">
          <span className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#66806e]">Registro de presença</span>
          <h2 className="section-title mt-2">Confirmar presença</h2>
          <p className="section-copy">Preencha seus dados para registrar sua participação. Não é necessário ter realizado inscrição prévia.</p>
          {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
          <ParticipantForm submitLabel="CONFIRMAR PRESENÇA" loading={submitting} onSubmit={submit}/>
        </div>
      )}
    </div></main>
    <footer className="public-footer">UNIVC — Centro Universitário Vale do Cricaré</footer>
  </div>
}
