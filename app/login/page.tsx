'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-800
                    flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20
                          flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="font-arabic text-3xl text-white">ق</span>
          </div>
          <h1 className="font-display font-bold text-white text-xl">Kaldik RQ LHI</h1>
          <p className="text-emerald-300 text-sm mt-1">Login Admin / Guru</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="admin@sitlhi.sch.id"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2">
                {error === 'Invalid login credentials'
                  ? 'Email atau password salah. Hubungi admin jika belum punya akun.'
                  : error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-emerald-700 text-white font-semibold py-3 rounded-xl
                         hover:bg-emerald-800 active:scale-95 transition-all disabled:opacity-50 text-sm">
              {loading ? 'Sedang masuk...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-emerald-700 transition-colors">
              ← Kembali ke Kalender Publik
            </Link>
          </div>
        </div>

        <p className="text-center text-emerald-400/60 text-xs mt-6">
          Hanya untuk admin & guru RQ LHI
        </p>
      </div>
    </div>
  )
}
