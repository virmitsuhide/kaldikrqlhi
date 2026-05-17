'use client'
import { KaldikEvent, DAYS_ID, MONTHS_ID } from '@/types'

interface MonthCardProps {
  year: number
  month: number   // 0-based
  events: KaldikEvent[]
  onDayClick?: (dateStr: string) => void  // admin only
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()  // 0=Sun
}

export default function MonthCard({ year, month, events, onDayClick }: MonthCardProps) {
  const today     = new Date()
  const todayStr  = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  const daysTotal = getDaysInMonth(year, month)
  const firstDay  = getFirstDayOfWeek(year, month)

  // Group events by day
  const byDay: Record<number, KaldikEvent[]> = {}
  events.forEach(ev => {
    const d = parseInt(ev.date.split('-')[2])
    if (!byDay[d]) byDay[d] = []
    byDay[d].push(ev)
  })

  // Legend: events sorted by date, deduplicated
  const legendEvents = events
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((ev, idx, arr) => arr.findIndex(e => e.date === ev.date && e.title === ev.title) === idx)

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysTotal }, (_, i) => i + 1),
  ]
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden fade-in">
      {/* Month header */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-3">
        <h3 className="font-display font-bold text-white text-sm">
          {MONTHS_ID[month]} {year}
        </h3>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 bg-emerald-50">
        {DAYS_ID.map(d => (
          <div key={d}
            className={`text-center text-[10px] font-semibold py-1.5
              ${d === 'Min' || d === 'Sab' ? 'text-red-400' : 'text-slate-400'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px bg-slate-100 p-px">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} className="bg-white min-h-[44px]" />
          const dayOfWeek = idx % 7
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
          const dateStr   = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const isToday   = dateStr === todayStr
          const dayEvents = byDay[day] || []
          const hasLibur  = dayEvents.some(e => ['libur_nasional','libur_semester','ramadhan'].includes(e.type))

          return (
            <div
              key={idx}
              onClick={() => onDayClick?.(dateStr)}
              className={`bg-white min-h-[44px] px-1 pt-1 flex flex-col items-center
                ${onDayClick ? 'cursor-pointer hover:bg-emerald-50' : ''}
                ${isToday ? 'ring-2 ring-inset ring-emerald-400' : ''}`}
            >
              <span className={`text-[11px] font-semibold w-6 h-6 flex items-center justify-center rounded-full
                ${hasLibur  ? 'bg-red-100 text-red-600'
                : isWeekend ? 'text-slate-400'
                : isToday   ? 'bg-emerald-600 text-white'
                : 'text-slate-700'}`}>
                {day}
              </span>
              {/* Event dots (max 3) */}
              <div className="flex flex-wrap gap-px justify-center mt-0.5">
                {dayEvents.slice(0, 3).map((ev, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: ev.color }} />
                ))}
                {dayEvents.length > 3 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      {legendEvents.length > 0 && (
        <div className="px-3 py-2 border-t border-slate-100 space-y-1 max-h-48 overflow-y-auto">
          {legendEvents.map((ev, i) => {
            const [, , dd] = ev.date.split('-')
            return (
              <div key={i} className="flex items-start gap-2 text-xs">
                <div className="w-2 h-2 rounded-full mt-0.5 flex-shrink-0" style={{ background: ev.color }} />
                <span className="text-slate-500 font-medium w-5 flex-shrink-0">{parseInt(dd)}</span>
                <span className="text-slate-700 leading-tight">{ev.title}</span>
                <span className="ml-auto text-[10px] text-slate-400 flex-shrink-0">
                  {ev.unit === 'NASIONAL' ? '' : ev.unit}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
