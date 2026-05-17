'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Mode = 'login' | 'forgot' | 'sent'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode]           = useState<Mode>('login')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError('Email atau password salah. Hubungi admin jika belum punya akun.')
      setLoading(false); return
    }
    router.push('/admin')
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://kaldikrqlhi.vercel.app/auth/recovery',
    })
    if (err) { setError(err.message); setLoading(false); return }
    setMode('sent')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-800
                    flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20
                          flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="font-arabic text-3xl text-white">ق</span>
          </div>
          <h1 className="font-display font-bold text-white text-xl">Kaldik RQ LHI</h1>
          <p className="text-emerald-300 text-sm mt-1">
            {mode === 'login'  && 'Login Admin / Guru'}
            {mode === 'forgot' && 'Reset Password'}
            {mode === 'sent'   && 'Email Terkirim'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6">

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="admin@sitlhi.sch.id"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-emerald-700 text-white font-semibold py-3 rounded-xl
                           hover:bg-emerald-800 active:scale-95 transition-all disabled:opacity-50 text-sm">
                {loading ? 'Sedang masuk...' : 'Masuk'}
              </button>

              <button type="button" onClick={() => { setMode('forgot'); setError('') }}
                className="w-full text-center text-xs text-slate-400 hover:text-emerald-700 transition-colors">
                Lupa password?
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <p className="text-xs text-slate-500">
                Masukkan email Anda. Kami akan kirim link untuk reset password.
              </p>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="email@sitlhi.sch.id"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-emerald-700 text-white font-semibold py-3 rounded-xl
                           hover:bg-emerald-800 disabled:opacity-50 text-sm">
                {loading ? 'Mengirim...' : 'Kirim Link Reset'}
              </button>

              <button type="button" onClick={() => { setMode('login'); setError('') }}
                className="w-full text-center text-xs text-slate-400 hover:text-emerald-700 transition-colors">
                ← Kembali ke Login
              </button>
            </form>
          )}

          {mode === 'sent' && (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">📧</span>
              </div>
              <div>
                <p className="font-semibold text-slate-700 text-sm">Email terkirim!</p>
                <p className="text-xs text-slate-400 mt-1">
                  Cek inbox <span className="font-medium text-slate-600">{email}</span> dan
                  klik link reset password.
                </p>
              </div>
              <p className="text-xs text-slate-400">
                Tidak ada email? Cek folder spam atau{' '}
                <button onClick={() => setMode('forgot')}
                  className="text-emerald-700 font-medium hover:underline">
                  coba lagi
                </button>
              </p>
              <button onClick={() => setMode('login')}
                className="w-full border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl
                           hover:bg-slate-50 text-sm">
                Kembali ke Login
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-emerald-400/70 hover:text-white transition-colors">
            ← Kembali ke Kalender Publik
          </Link>
        </div>
      </div>
    </div>
  )
}
