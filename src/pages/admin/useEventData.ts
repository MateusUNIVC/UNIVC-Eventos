import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { AttendanceRecord, EventRecord, RegistrationRecord } from '../../lib/types'

export function useEventData(id?: string) {
  const [event,setEvent] = useState<EventRecord|null>(null)
  const [registrations,setRegistrations] = useState<RegistrationRecord[]>([])
  const [attendance,setAttendance] = useState<AttendanceRecord[]>([])
  const [loading,setLoading] = useState(true)

  const load = useCallback(async()=>{
    if (!id) return
    setLoading(true)
    const [e,r,a] = await Promise.all([
      supabase.from('events').select('*').eq('id',id).single(),
      supabase.from('registrations').select('*').eq('event_id',id).order('registered_at',{ascending:false}),
      supabase.from('attendance').select('*').eq('event_id',id).order('checked_in_at',{ascending:false}),
    ])
    setEvent(e.data as EventRecord || null)
    setRegistrations((r.data || []) as RegistrationRecord[])
    setAttendance((a.data || []) as AttendanceRecord[])
    setLoading(false)
  },[id])
  useEffect(()=>{ load() },[load])
  return { event, registrations, attendance, loading, reload: load, setEvent }
}
