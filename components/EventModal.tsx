'use client'
import { useState, useEffect } from 'react'
import { Unit, EventType, TYPE_COLORS, KaldikEvent } from '@/types'
import { supabase } from '@/lib/supabase'

interface EventModalProps {
  dateStr  : string
  event?   : KaldikEvent   // jika diisi = mode edit
  onClose  : () => void
  onSaved  : () => void
}

const UNIT_OPTIONS: { label: string; value: Unit }[] = [
  { label: 'Nasional',  value: 'NASIONAL' },
  { label: 'SDIT LHI',  value: 'SD'       },
  { label: 'SMPIT LHI', value: 'SMP'      },
  { label: 'RQ LHI',    value: 'RQ'       },
]

const TYPE_OPTIONS: { label: string; value: EventType }[] = [
  { label: 'Libur Nasional',   value: 'libur_nasional'   },
  { label: 'Libur Semester',   value: 'libur_semester'   },
  { label: 'Ramadhan',         value: 'ramadhan'         },
  { label: 'Agenda',           value: 'agenda'           },
  { label: 'Kegiatan Bersama', value: 'kegiatan_bersama' },
]

const QUICK_COLORS = [
  '#EF4444','#F97316','#F59E0B','#10B981',
  '#3B82F6','#8B5CF6','#EC4899','#6B7280',
]

export default function EventModal({ dateStr, event, onClose, onSaved }: EventModalProps) {
  const isEdit = !!event
  const [title, setTitle]   = useState(event?.title ?? '')
  const [desc, setDesc]     = useState(event?.description ?? '')
  const [unit, setUnit]     = useState<Unit>(event?.unit ?? 'SD')
  const [type, setType]     = useState<EventType>(event?.type ?? 'agenda')
  const [color, setColor]   = useState(event?.color ?? '#F59E0B')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const year = parseInt(dateStr.split('-')[0])

  function handleTypeChange(t: EventType) {
    setType(t)
    if (!isEdit) setColor(TYPE_COLORS[t])
  }

  async function handleSave() {
    if (!title.trim()) { setError('Judul tidak boleh kosong'); return }
    setSaving(true); setError('')

    if (isEdit) {
      const { error: err } = await supabase.from('events')
        .update({ title: title.trim(), description: desc.trim() || null, unit, type, color })
        .eq('id', event!.id)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase.from('events')
        .insert({ date: dateStr, title: title.trim(), description: desc.trim() || null, unit, type, color, year })
      if (err) { setError(err.message); setSaving(false); return }
    }

    onSaved(); onClose()
  }

  const [y, m, d] = dateStr.split('-')
  const BULAN = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  const displayDate = `${parseInt(d)} ${BULAN[parseInt(m)]} ${y}`

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md fade-in">

        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-400">{isEdit ? 'Edit Agenda' : 'Tambah Agenda'}</p>
            <p className="font-display font-bold text-slate-800">{displayDate}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400">✕</button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Judul Agenda *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Usbu'ul Qur'an, Mabit Ramadhan..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Unit</label>
              <select value={unit} onChange={e => setUnit(e.target.value as Unit)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-400">
                {UNIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Tipe</label>
              <select value={type} onChange={e => handleTypeChange(e.target.value as EventType)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-400">
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">Warna</label>
            <div className="flex gap-2 flex-wrap items-center">
              {QUICK_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform
                    ${color === c ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : 'hover:scale-110'}`}
                  style={{ background: c }} />
              ))}
              <input type="color" value={color} onChange={e => setColor(e.target.value)}
                className="w-7 h-7 rounded-full cursor-pointer border-2 border-slate-200" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Keterangan (opsional)</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
              placeholder="Detail agenda..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
            Batal
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold
                       hover:bg-emerald-800 disabled:opacity-50 transition-all">
            {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Agenda'}
          </button>
        </div>
      </div>
    </div>
  )
}
