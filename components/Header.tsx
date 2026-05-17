'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  const isAdmin  = pathname.startsWith('/admin')

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo + Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800
                          flex items-center justify-center shadow-md group-hover:shadow-emerald-200 transition-shadow">
            <span className="text-white font-arabic text-lg leading-none">ق</span>
          </div>
          <div>
            <p className="font-display font-bold text-slate-800 text-sm leading-tight">Kaldik RQ LHI</p>
            <p className="text-xs text-slate-400 leading-tight">SIT Lukman Hakim Internasional</p>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link href="/"
              className="text-xs text-slate-500 hover:text-emerald-700 transition-colors">
              ← Kalender Publik
            </Link>
          )}
          <Link href="/login"
            className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold
                       hover:bg-emerald-800 active:scale-95 transition-all shadow-sm">
            {isAdmin ? '🔓 Admin' : 'Login Admin'}
          </Link>
        </div>
      </div>
    </header>
  )
}
