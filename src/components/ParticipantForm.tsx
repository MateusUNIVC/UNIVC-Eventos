import { useMemo, useState } from 'react'
import { COURSES, PERIODS } from '../lib/constants'
import type { ParticipantInput } from '../lib/types'

const initialState: ParticipantInput = {
  full_name: '',
  email: '',
  is_univc_student: null,
  course: '',
  custom_course: '',
  period: '',
  custom_period: '',
}

export function ParticipantForm({
  submitLabel,
  loading,
  onSubmit,
}: {
  submitLabel: string
  loading: boolean
  onSubmit: (data: ParticipantInput) => Promise<void>
}) {
  const [data, setData] = useState<ParticipantInput>(initialState)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validEmail = useMemo(() => /^\S+@\S+\.\S+$/.test(data.email.trim()), [data.email])

  const set = <K extends keyof ParticipantInput>(key: K, value: ParticipantInput[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (data.full_name.trim().length < 3) next.full_name = 'Informe seu nome completo.'
    if (!validEmail) next.email = 'Informe um e-mail válido.'
    if (data.is_univc_student === null) next.is_univc_student = 'Selecione uma opção.'
    if (data.is_univc_student) {
      if (!data.course) next.course = 'Selecione seu curso.'
      if (!data.period) next.period = 'Selecione seu período.'
      if (data.course === 'Outros' && !data.custom_course.trim()) next.custom_course = 'Informe seu curso.'
      if (data.period === 'Outro' && !data.custom_period.trim()) next.custom_period = 'Informe seu período.'
    }
    setErrors(next)
    if (Object.keys(next).length) return
    await onSubmit(data)
  }

  return (
    <form onSubmit={submit} className="mt-7 grid gap-5" noValidate>
      <div className="field">
        <label>Nome completo</label>
        <input value={data.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="Digite seu nome completo" autoComplete="name" />
        {errors.full_name && <span className="field-error">{errors.full_name}</span>}
      </div>
      <div className="field">
        <label>E-mail</label>
        <input type="email" value={data.email} onChange={(e) => set('email', e.target.value)} placeholder="voce@email.com" autoComplete="email" />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>
      <div className="field">
        <label>Você é aluno do UNIVC?</label>
        <div className="segmented">
          <button type="button" className={data.is_univc_student === true ? 'active' : ''} onClick={() => set('is_univc_student', true)}>Sim</button>
          <button type="button" className={data.is_univc_student === false ? 'active' : ''} onClick={() => set('is_univc_student', false)}>Não</button>
        </div>
        {errors.is_univc_student && <span className="field-error">{errors.is_univc_student}</span>}
      </div>

      {data.is_univc_student && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="field">
            <label>Curso</label>
            <select value={data.course} onChange={(e) => set('course', e.target.value)}>
              <option value="">Selecione</option>
              {COURSES.map((course) => <option key={course} value={course}>{course}</option>)}
            </select>
            {errors.course && <span className="field-error">{errors.course}</span>}
          </div>
          <div className="field">
            <label>Período</label>
            <select value={data.period} onChange={(e) => set('period', e.target.value)}>
              <option value="">Selecione</option>
              {PERIODS.map((period) => <option key={period} value={period}>{period}</option>)}
            </select>
            {errors.period && <span className="field-error">{errors.period}</span>}
          </div>
          {data.course === 'Outros' && (
            <div className="field sm:col-span-2">
              <label>Qual é o seu curso?</label>
              <input value={data.custom_course} onChange={(e) => set('custom_course', e.target.value)} />
              {errors.custom_course && <span className="field-error">{errors.custom_course}</span>}
            </div>
          )}
          {data.period === 'Outro' && (
            <div className="field sm:col-span-2">
              <label>Qual é o seu período?</label>
              <input value={data.custom_period} onChange={(e) => set('custom_period', e.target.value)} />
              {errors.custom_period && <span className="field-error">{errors.custom_period}</span>}
            </div>
          )}
        </div>
      )}
      <button className="primary-btn mt-1" type="submit" disabled={loading}>{loading ? 'Enviando...' : submitLabel}</button>
    </form>
  )
}
