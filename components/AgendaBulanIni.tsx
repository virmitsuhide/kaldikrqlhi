'use client'
import { useState, useMemo } from 'react'
import { KaldikEvent, MONTHS_ID } from '@/types'

interface Props {
  events : KaldikEvent[]   // sudah difilter sesuai unit aktif
  year   : number
}

const DAYS_ID_FULL  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
const MONTHS_SHORT  = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
const UNIT_LABEL: Record<string,string> = {
  NASIONAL:'Nas.', SD:'SDIT', SMP:'SMPIT', RQ:'RQ'
}

function todayStr() {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`
}

function getWeekRange() {
  const now   = new Date()
  const day   = now.getDay()                    // 0=Sun
  const start = new Date(now); start.setDate(now.getDate() - day)
  const end   = new Date(now); end.setDate(now.getDate() + (6 - day))
  const fmt   = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  return { weekStart: fmt(start), weekEnd: fmt(end) }
}

export default function AgendaBulanIni({ events, year }: Props) {
  const [open, setOpen] = useState(true)

  const now        = new Date()
  const thisMonth  = now.getMonth()      // 0-based
  const today      = todayStr()
  const { weekStart, weekEnd } = getWeekRange()

  // Filter only current month
  const monthEvents = useMemo(() =>
    events.filter(ev => {
      const [y, m] = ev.date.split('-')
      return parseInt(y) === year && parseInt(m) - 1 === thisMonth
    }).sort((a,b) => a.date.localeCompare(b.date))
  , [events, year, thisMonth])

  // Grouped
  const hariIni    = monthEvents.filter(ev => ev.date === today)
  const mingguIni  = monthEvents.filter(ev => ev.date > today && ev.date >= weekStart && ev.date <= weekEnd)
  const sisaBulan  = monthEvents.filter(ev => ev.date > weekEnd)

  const [showSemua, setShowSemua] = useState(false)
  const sisaVisible = showSemua ? sisaBulan : sisaBulan.slice(0, 5)

  const totalCount = monthEvents.length
  const monthName  = MONTHS_ID[thisMonth]

  // Format display date
  function fmtDate(dateStr: string) {
    const [, m, d] = dateStr.split('-')
    const dow = new Date(dateStr).getDay()
    return `${DAYS_ID_FULL[dow]}, ${parseInt(d)} ${MONTHS_SHORT[parseInt(m)-1]}`
  }
  function fmtShort(dateStr: string) {
    const [, m, d] = dateStr.split('-')
    return `${parseInt(d)} ${MONTHS_SHORT[parseInt(m)-1]}`
  }

  // Empty state
  if (totalCount === 0) return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <p className="font-display font-bold text-slate-700 text-sm">
            Agenda {monthName} {year}
          </p>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-3 text-center py-2">
        Tidak ada agenda bulan ini untuk filter yang dipilih.
      </p>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden fade-in">

      {/* Header — selalu tampil */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4
                   hover:bg-slate-50 transition-colors text-left">
        <div className="flex items-center gap-3">
          <span className="text-xl">📅</span>
          <div>
            <p className="font-display font-bold text-slate-800 text-sm leading-tight">
              Agenda {monthName} {year}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {totalCount} agenda · {hariIni.length > 0 ? `${hariIni.length} hari ini` : 'tidak ada agenda hari ini'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hariIni.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700
                             text-[10px] font-bold animate-pulse">
              HARI INI
            </span>
          )}
          <span className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </button>

      {/* Collapsible body */}
      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-50">

          {/* ── HARI INI ── */}
          {hariIni.length > 0 && (
            <div className="px-5 py-3">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">
                🟢 Hari Ini — {fmtDate(today)}
              </p>
              <div className="space-y-1.5">
                {hariIni.map(ev => (
                  <EventRow key={ev.id} ev={ev} />
                ))}
              </div>
            </div>
          )}

          {/* ── MINGGU INI ── */}
          {mingguIni.length > 0 && (
            <div className="px-5 py-3">
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2">
                📆 Minggu Ini
              </p>
              <div className="space-y-1.5">
                {mingguIni.map(ev => (
                  <EventRow key={ev.id} ev={ev} showDate fmtDate={fmtShort} />
                ))}
              </div>
            </div>
          )}

          {/* ── SISA BULAN ── */}
          {sisaBulan.length > 0 && (
            <div className="px-5 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  📋 Sisa Bulan Ini
                </p>
                <span className="text-[10px] text-slate-400">{sisaBulan.length} agenda</span>
              </div>
              <div className="space-y-1.5">
                {sisaVisible.map(ev => (
                  <EventRow key={ev.id} ev={ev} showDate fmtDate={fmtShort} />
                ))}
              </div>
              {sisaBulan.length > 5 && (
                <button
                  onClick={() => setShowSemua(s => !s)}
                  className="mt-2 text-xs text-emerald-700 font-semibold hover:underline">
                  {showSemua
                    ? '▲ Sembunyikan'
                    : `▼ Lihat ${sisaBulan.length - 5} agenda lainnya`}
                </button>
              )}
            </div>
          )}

          {/* Jika semua sudah lewat bulan ini */}
          {hariIni.length === 0 && mingguIni.length === 0 && sisaBulan.length === 0
           && monthEvents.length > 0 && (
            <div className="px-5 py-4 text-center">
              <p className="text-xs text-slate-400">Semua agenda bulan ini sudah selesai.</p>
              <div className="mt-2 space-y-1">
                {monthEvents.slice(-3).map(ev => (
                  <EventRow key={ev.id} ev={ev} showDate fmtDate={fmtShort} muted />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Sub-component: satu baris event
function EventRow({
  ev, showDate = false, fmtDate, muted = false
}: {
  ev       : KaldikEvent
  showDate?: boolean
  fmtDate? : (d: string) => string
  muted?   : boolean
}) {
  return (
    <div className={`flex items-center gap-2.5 text-xs rounded-lg px-2 py-1.5
                     ${muted ? 'opacity-50' : 'hover:bg-slate-50'} transition-colors`}>
      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ev.color }} />
      {showDate && fmtDate && (
        <span className="text-slate-400 font-mono w-14 flex-shrink-0">{fmtDate(ev.date)}</span>
      )}
      <span className={`flex-1 font-medium ${muted ? 'text-slate-400' : 'text-slate-700'} leading-snug`}>
        {ev.title}
      </span>
      {ev.unit !== 'NASIONAL' && (
        <span className="text-[10px] text-slate-400 flex-shrink-0">
          {UNIT_LABEL[ev.unit] ?? ev.unit}
        </span>
      )}
    </div>
  )
}
