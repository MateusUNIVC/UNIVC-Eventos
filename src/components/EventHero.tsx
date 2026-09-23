import { CalendarDays, Clock3, MapPin } from 'lucide-react'
import { Brand } from './Brand'
import type { EventRecord } from '../lib/types'
import { formatDateBR, formatTime } from '../lib/utils'

export function EventHero({ event }: { event: EventRecord }) {
  return (
    <>
      <section className="public-hero">
        <div className="container-public py-7 sm:py-9 relative z-10">
          <Brand />
          <div className="mt-6">
            {event.event_type && <span className="event-kicker">{event.event_type}</span>}
            <h1 className="event-title">{event.name}</h1>
            {event.subtitle && <p className="event-subtitle">{event.subtitle}</p>}
          </div>
        </div>
      </section>
      <section className="event-meta-strip">
        <div className="container-public event-meta-grid">
          <div className="meta-item"><CalendarDays size={18}/><div><div className="meta-label">Data</div><div className="meta-value">{formatDateBR(event.event_date)}</div></div></div>
          <div className="meta-item"><Clock3 size={18}/><div><div className="meta-label">Horário</div><div className="meta-value">{formatTime(event.start_time)}</div></div></div>
          <div className="meta-item"><MapPin size={18}/><div><div className="meta-label">Local</div><div className="meta-value">{event.location}</div></div></div>
        </div>
      </section>
    </>
  )
}
