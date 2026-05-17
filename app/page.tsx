'use client'
import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import YearNav from '@/components/YearNav'
import UnitFilterBar from '@/components/UnitFilter'
import MonthCard from '@/components/MonthCard'
import { supabase } from '@/lib/supabase'
import { KaldikEvent, UnitFilter, filterEvents } from '@/types'

const LEGEND_ITEMS = [
  { color: '#EF4444', label: 'Libur Nasional / Semester / Idul Fitri' },
  { color: '#F97316', label: 'Ramadhan' },
  { color: '#F59E0B', label: 'Agenda SDIT LHI' },
  { color: '#3B82F6', label: 'Agenda SMPIT LHI' },
  { color: '#10B981', label: 'Agenda RQ LHI' },
  { color: '#8B5CF6', label: 'Kegiatan Bersama' },
]

export default function HomePage() {
  const currentYear = new Date().getFullYear()
  const [year, setYear]       = useState(currentYear)
  const [filter, setFilter]   = useState<UnitFilter>('SEMUA')
  const [events, setEvents]   = useState<KaldikEvent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = useCallback(async (y: number) => {
    setLoading(true)
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('year', y)
      .order('date', { ascending: true })
    setEvents(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchEvents(year) }, [year, fetchEvents])

  const filtered = filterEvents(events, filter)

  // Group by month
  const byMonth: KaldikEvent[][] = Array.from({ length: 12 }, (_, m) =>
    filtered.filter(ev => parseInt(ev.date.split('-')[1]) - 1 === m)
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 px-6 py-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <svg viewBox="0 0 200 200" className="w-full h-full fill-white">
              <path d="M100 10 L120 60 L180 60 L135 90 L155 145 L100 115 L45 145 L65 90 L20 60 L80 60 Z"/>
            </svg>
          </div>
          <div className="relative">
            <p className="font-arabic text-2xl text-emerald-200 mb-1">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl mb-1">Kalender Akademik RQ LHI</h1>
            <p className="text-emerald-200 text-sm">SIT Lukman Hakim Internasional · Yogyakarta</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-slate-100 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <YearNav year={year} onYearChange={y => { setYear(y); setFilter('SEMUA') }} />
            {loading && (
              <span className="text-xs text-slate-400 animate-pulse">Memuat data...</span>
            )}
          </div>
          <UnitFilterBar active={filter} onChange={setFilter} />
        </div>

        {/* Color legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 px-1">
          {LEGEND_ITEMS.map(item => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs text-slate-600">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>

        {/* Calendar grid — 12 months */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {byMonth.map((monthEvents, m) => (
              <MonthCard key={m} year={year} month={m} events={monthEvents} />
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-slate-400 pb-4">
          Kaldik RQ LHI © {new Date().getFullYear()} · Rumah Qur'an SIT Lukman Hakim Internasional
        </footer>
      </main>
    </div>
  )
}
