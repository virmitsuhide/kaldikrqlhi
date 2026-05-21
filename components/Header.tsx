'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Header() {
  const pathname = usePathname()
  const router   = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checking, setChecking]     = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session)
      setChecking(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 relative">
            <Image src="/RQ.png" alt="Logo RQ LHI" fill className="object-contain" priority />
          </div>
          <div>
            <p className="font-display font-bold text-slate-800 text-sm leading-tight">Kaldik RQ LHI</p>
            <p className="text-xs text-slate-400 leading-tight">SIT Lukman Hakim Internasional</p>
          </div>
        </Link>

        {!checking && (
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {pathname !== '/admin' && (
                  <Link href="/admin"
                    className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold
                               hover:bg-emerald-100 transition-all border border-emerald-200">
                    🗓 Dashboard Admin
                  </Link>
                )}
                {pathname === '/admin' && (
                  <Link href="/"
                    className="px-4 py-2 rounded-lg bg-slate-50 text-slate-600 text-xs font-semibold
                               hover:bg-slate-100 transition-all border border-slate-200">
                    👁 Kalender Publik
                  </Link>
                )}
                <button onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold
                             hover:bg-red-100 transition-all border border-red-200">
                  Keluar
                </button>
              </>
            ) : (
              <Link href="/login"
                className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold
                           hover:bg-emerald-800 active:scale-95 transition-all shadow-sm">
                Login Admin
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
