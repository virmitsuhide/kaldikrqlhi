'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import YearNav from '@/components/YearNav'
import MonthCard from '@/components/MonthCard'
import EventModal from '@/components/EventModal'
import { supabase } from '@/lib/supabase'
import { KaldikEvent } from '@/types'

export default function AdminPage() {
  const router = useRouter()
  const [year, setYear]           = useState(new Date().getFullYear())
  const [events, setEvents]       = useState<KaldikEvent[]>([])
  const [loading, setLoading]     = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [userName, setUserName]   = useState('')

  // Check auth
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

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm('Hapus agenda ini?')) return
    await supabase.from('events').delete().eq('id', id)
    fetchEvents(year)
  }

  const byMonth: KaldikEvent[][] = Array.from({ length: 12 }, (_, m) =>
    events.filter(ev => parseInt(ev.date.split('-')[1]) - 1 === m)
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Admin bar */}
        <div className="bg-emerald-800 rounded-2xl px-5 py-4 flex items-center justify-between text-white">
          <div>
            <p className="text-xs text-emerald-300">Mode Admin</p>
            <p className="font-display font-bold text-sm">{userName}</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-emerald-300">Klik tanggal di kalender untuk tambah agenda</p>
            <button onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-all">
              Keluar
            </button>
          </div>
        </div>

        {/* Year nav */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-slate-100">
          <YearNav year={year} onYearChange={setYear} />
        </div>

        {/* Events list */}
        {events.length > 0 && (
          <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-slate-100">
            <h3 className="font-display font-bold text-slate-700 mb-3 text-sm">
              Semua Agenda {year} ({events.length} entri)
            </h3>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {events.map(ev => (
                <div key={ev.id}
                  className="flex items-center gap-3 text-xs hover:bg-slate-50 rounded-lg px-2 py-1.5 group">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ev.color }} />
                  <span className="text-slate-400 w-20 flex-shrink-0">{ev.date}</span>
                  <span className="font-medium text-slate-700 flex-1">{ev.title}</span>
                  <span className="text-slate-400 text-[10px] px-1.5 py-0.5 bg-slate-100 rounded">
                    {ev.unit}
                  </span>
                  <button onClick={() => handleDeleteEvent(ev.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600
                               px-1 py-0.5 rounded transition-all text-[10px]">
                    hapus
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar grid — clickable */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {byMonth.map((monthEvents, m) => (
              <MonthCard
                key={m}
                year={year}
                month={m}
                events={monthEvents}
                onDayClick={setSelectedDate}
              />
            ))}
          </div>
        )}
      </main>

      {/* Event modal */}
      {selectedDate && (
        <EventModal
          dateStr={selectedDate}
          onClose={() => setSelectedDate(null)}
          onSaved={() => fetchEvents(year)}
        />
      )}
    </div>
  )
}
