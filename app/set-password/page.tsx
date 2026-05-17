
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Password tidak sama'); return }
    if (password.length < 8)  { setError('Minimal 8 karakter'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-teal-800
                    flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
        <h1 className="font-display font-bold text-slate-800 text-lg mb-1">Buat Password</h1>
        <p className="text-xs text-slate-400 mb-5">Set password untuk akun admin Anda</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Password Baru</label>
            <input type="password" value={password}
              onChange={e => setPassword(e.target.value)} required
              placeholder="Minimal 8 karakter"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Konfirmasi Password</label>
            <input type="password" value={confirm}
              onChange={e => setConfirm(e.target.value)} required
              placeholder="Ulangi password"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-emerald-700 text-white font-semibold py-3 rounded-xl
                       hover:bg-emerald-800 disabled:opacity-50 text-sm">
            {loading ? 'Menyimpan...' : 'Simpan & Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}