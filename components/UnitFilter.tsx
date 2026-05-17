'use client'
import { FILTER_OPTIONS, UnitFilter } from '@/types'

interface UnitFilterProps {
  active: UnitFilter
  onChange: (f: UnitFilter) => void
}

export default function UnitFilterBar({ active, onChange }: UnitFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border
            ${active === opt.value
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-700'
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
