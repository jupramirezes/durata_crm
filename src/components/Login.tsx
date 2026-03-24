import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) setError(err.message === 'Invalid login credentials' ? 'Correo o contrasena incorrectos' : err.message)
  }

  return (
    <div className="min-h-screen bg-[var(--color-sidebar)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">DURATA</span>
            <span className="text-3xl font-extrabold text-[var(--color-primary)]">CRM</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 tracking-wider font-medium">Sistema de Cotizacion</p>
        </div>

        {/* Card */}
        <form onSubmit={handleLogin} className="bg-white/[0.06] backdrop-blur rounded-2xl p-7 shadow-2xl border border-white/10">
          <h2 className="text-white font-bold text-lg mb-6 tracking-tight">Iniciar sesion</h2>

          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Correo electronico</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent mb-4"
            placeholder="tu@durata.co"
          />

          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Contrasena</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent mb-6"
            placeholder="••••••••"
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg px-4 py-2.5 mb-4 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-[11px] text-slate-600 text-center mt-8 font-medium">DURATA S.A.S — Uso interno</p>
      </div>
    </div>
  )
}
