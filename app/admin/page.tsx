'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import YearNav from '@/components/YearNav'
import MonthCard from '@/components/MonthCard'
import EventModal from '@/components/EventModal'
import { supabase } from '@/lib/supabase'
import { KaldikEvent, Unit } from '@/types'

type ActiveTab = 'kalender' | 'daftar'

const UNIT_TABS: { label: string; value: Unit | 'SEMUA' }[] = [
  { label: 'Semua',    value: 'SEMUA'    },
  { label: 'SDIT',     value: 'SD'       },
  { label: 'SMPIT',    value: 'SMP'      },
  { label: 'RQ',       value: 'RQ'       },
  { label: 'Nasional', value: 'NASIONAL' },
]

const UNIT_BADGE: Record<string, string> = {
  NASIONAL : 'bg-red-100 text-red-700',
  SD       : 'bg-amber-100 text-amber-700',
  SMP      : 'bg-blue-100 text-blue-700',
  RQ       : 'bg-emerald-100 text-emerald-700',
}

export default function AdminPage() {
  const router = useRouter()
  const [year, setYear]               = useState(new Date().getFullYear())
  const [events, setEvents]           = useState<KaldikEvent[]>([])
  const [loading, setLoading]         = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editEvent, setEditEvent]     = useState<KaldikEvent | null>(null)
  const [activeTab, setActiveTab]     = useState<ActiveTab>('kalender')
  const [unitFilter, setUnitFilter]   = useState<Unit | 'SEMUA'>('SEMUA')
  const [userName, setUserName]       = useState('')
  const [searchQ, setSearchQ]         = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUserName(data.user.email ?? 'Admin')
    })
  }, [router])

  const fetchEvents = useCallback(async (y: number) => {
    setLoading(true)
    const { data } = await supabase.from('events').select('*').eq('year', y).order('date')
    setEvents(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchEvents(year) }, [year, fetchEvents])

  async function handleDelete(id: string) {
    if (!confirm('Hapus agenda ini?')) return
    await supabase.from('events').delete().eq('id', id)
    fetchEvents(year)
  }

  // Filter events untuk tab Daftar
  const filteredEvents = events
    .filter(ev => unitFilter === 'SEMUA' || ev.unit === unitFilter)
    .filter(ev => !searchQ || ev.title.toLowerCase().includes(searchQ.toLowerCase()))

  const byMonth: KaldikEvent[][] = Array.from({ length: 12 }, (_, m) =>
    events.filter(ev => parseInt(ev.date.split('-')[1]) - 1 === m)
  )

  const BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {/* Admin bar */}
        <div className="bg-emerald-800 rounded-2xl px-5 py-3 flex items-center justify-between text-white">
          <div>
            <p className="text-xs text-emerald-300">Mode Admin</p>
            <p className="font-display font-bold text-sm">{userName}</p>
          </div>
          <p className="text-xs text-emerald-300 hidden sm:block">
            Klik tanggal di kalender untuk tambah agenda
          </p>
        </div>

        {/* Year nav */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-slate-100">
          <YearNav year={year} onYearChange={setYear} />
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2">
          {(['kalender', 'daftar'] as ActiveTab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all
                ${activeTab === tab
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-emerald-400'}`}>
              {tab === 'kalender' ? '🗓 Kalender' : '📋 Daftar Agenda'}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400 self-center">
            {events.length} agenda di {year}
          </span>
        </div>

        {/* ── TAB KALENDER ── */}
        {activeTab === 'kalender' && (
          loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-48 rounded-2xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {byMonth.map((monthEvents, m) => (
                <MonthCard key={m} year={year} month={m} events={monthEvents}
                  onDayClick={setSelectedDate} />
              ))}
            </div>
          )
        )}

        {/* ── TAB DAFTAR ── */}
        {activeTab === 'daftar' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

            {/* Filter bar */}
            <div className="px-5 py-4 border-b border-slate-100 space-y-3">
              {/* Unit tabs */}
              <div className="flex flex-wrap gap-2">
                {UNIT_TABS.map(t => (
                  <button key={t.value} onClick={() => setUnitFilter(t.value)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all
                      ${unitFilter === t.value
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    {t.label}
                    <span className="ml-1 opacity-60">
                      ({t.value === 'SEMUA'
                        ? events.length
                        : events.filter(e => e.unit === t.value).length})
                    </span>
                  </button>
                ))}
              </div>
              {/* Search */}
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Cari judul agenda..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>

            {/* Event list */}
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Memuat...</div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Belum ada agenda{unitFilter !== 'SEMUA' ? ` untuk unit ${unitFilter}` : ''}
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filteredEvents.map(ev => {
                  const [, m, d] = ev.date.split('-')
                  return (
                    <div key={ev.id}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group">

                      {/* Color dot */}
                      <div className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: ev.color }} />

                      {/* Date */}
                      <div className="text-xs text-slate-400 w-16 flex-shrink-0 font-mono">
                        {parseInt(d)} {BULAN[parseInt(m)-1]}
                      </div>

                      {/* Title */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{ev.title}</p>
                        {ev.description && (
                          <p className="text-xs text-slate-400 truncate">{ev.description}</p>
                        )}
                      </div>

                      {/* Unit badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0
                        ${UNIT_BADGE[ev.unit] ?? 'bg-slate-100 text-slate-600'}`}>
                        {ev.unit}
                      </span>

                      {/* Actions */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditEvent(ev); setSelectedDate(ev.date) }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs
                                     font-semibold hover:bg-blue-100 transition-colors">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-50 text-red-500 text-xs
                                     font-semibold hover:bg-red-100 transition-colors">
                          Hapus
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Footer count */}
            {filteredEvents.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
                Menampilkan {filteredEvents.length} dari {events.length} agenda
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal tambah / edit */}
      {selectedDate && (
        <EventModal
          dateStr={selectedDate}
          event={editEvent ?? undefined}
          onClose={() => { setSelectedDate(null); setEditEvent(null) }}
          onSaved={() => fetchEvents(year)}
        />
      )}
    </div>
  )
}
