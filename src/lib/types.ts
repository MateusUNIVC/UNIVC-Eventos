export type EventRecord = {
  id: string
  name: string
  slug: string
  subtitle: string | null
  description: string | null
  event_type: string | null
  event_date: string
  start_time: string
  end_time: string | null
  location: string
  registration_open: boolean
  attendance_open: boolean
  created_at?: string
  updated_at?: string
}

export type ParticipantInput = {
  full_name: string
  email: string
  is_univc_student: boolean | null
  course: string
  custom_course: string
  period: string
  custom_period: string
}

export type RegistrationRecord = ParticipantInput & {
  id: string
  event_id: string
  registered_at: string
}

export type AttendanceRecord = ParticipantInput & {
  id: string
  event_id: string
  registration_id: string | null
  checked_in_at: string
}
