import { CheckCircle2, CircleOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { EventHero } from '../../components/EventHero'
import { ParticipantForm } from '../../components/ParticipantForm'
import { supabase } from '../../lib/supabase'
import type { EventRecord, ParticipantInput } from '../../lib/types'

export default function RegistrationPage() {
  const { slug = '' } = useParams()
  const [event, setEvent] = useState<EventRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successName, setSuccessName] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.rpc('get_public_event', { p_slug: slug })
      if (error || !data) setError('Evento não encontrado.')
      else setEvent(data as EventRecord)
      setLoading(false)
    }
    load()
  }, [slug])

  const submit = async (form: ParticipantInput) => {
    setSubmitting(true); setError('')
    const { data, error } = await supabase.rpc('register_for_event', {
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
    if (error) return setError('Não foi possível concluir a inscrição. Tente novamente.')
    if (data?.code === 'duplicate') return setError('Este e-mail já possui uma inscrição para este evento.')
    if (data?.code === 'closed') return setError('As inscrições para este evento estão encerradas.')
    if (!data?.ok) return setError(data?.message || 'Não foi possível concluir a inscrição.')
    setSuccessName(form.full_name)
  }

  if (loading) return <div className="min-h-screen grid place-items-center text-[#64756A]">Carregando evento...</div>
  if (!event) return <div className="min-h-screen grid place-items-center p-6"><div className="status-panel max-w-lg"><CircleOff className="mx-auto mb-4"/><h1 className="section-title">Evento não encontrado</h1></div></div>

  return <div className="shell">
    <EventHero event={event}/>
    <main className="public-main"><div className="container-public">
      {successName ? (
        <div className="success-panel">
          <div className="status-icon"><CheckCircle2 size={34}/></div>
          <h2>Inscrição confirmada!</h2>
          <p className="mt-3 text-white/80 text-sm">{successName}, sua inscrição foi registrada com sucesso.</p>
          <div className="mt-5 rounded-2xl bg-white/8 border border-white/15 p-4 text-sm text-white/85">
            No dia do evento, utilize o QR Code de presença disponível no local para registrar sua participação.
          </div>
        </div>
      ) : !event.registration_open ? (
        <div className="status-panel"><CircleOff className="mx-auto mb-4 text-[#04301D]"/><h2 className="section-title">Inscrições encerradas</h2><p className="section-copy">O formulário de inscrição não está disponível neste momento.</p></div>
      ) : (
        <div className="form-card">
          <span className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#66806e]">Inscrição prévia</span>
          <h2 className="section-title mt-2">Faça sua inscrição</h2>
          <p className="section-copy">Preencha seus dados para confirmar seu interesse em participar. A inscrição nos ajuda a estimar o público esperado.</p>
          {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
          <ParticipantForm submitLabel="CONFIRMAR INSCRIÇÃO" loading={submitting} onSubmit={submit}/>
        </div>
      )}
    </div></main>
    <footer className="public-footer">UNIVC — Centro Universitário Vale do Cricaré</footer>
  </div>
}
