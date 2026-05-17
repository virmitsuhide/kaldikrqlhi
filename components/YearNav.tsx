'use client'

interface YearNavProps {
  year: number
  onYearChange: (y: number) => void
}

const MIN_YEAR = 2025
const MAX_YEAR = 2028

export default function YearNav({ year, onYearChange }: YearNavProps) {
  const years = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i)

  return (
    <div className="flex items-center gap-1">
      {years.map(y => (
        <button
          key={y}
          onClick={() => onYearChange(y)}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
            ${y === year
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-200'
              : 'bg-white text-slate-500 border border-slate-200 hover:border-emerald-400 hover:text-emerald-700'
            }`}
        >
          {y}
        </button>
      ))}
    </div>
  )
}
