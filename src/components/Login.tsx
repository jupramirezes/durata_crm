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
    if (err) setError(err.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos' : err.message)
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-baseline justify-center">
            <span className="text-3xl font-extrabold text-white tracking-tight">DURATA</span>
            <span className="text-3xl font-extrabold text-[#3b82f6] ml-2">CRM</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 tracking-wide">Sistema de Cotización</p>
        </div>

        {/* Card */}
        <form onSubmit={handleLogin} className="bg-slate-800 rounded-xl p-6 shadow-2xl border border-slate-700">
          <h2 className="text-white font-semibold text-lg mb-5">Iniciar sesión</h2>

          <label className="block text-xs text-slate-400 mb-1">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            placeholder="tu@durata.co"
          />

          <label className="block text-xs text-slate-400 mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-5"
            placeholder="••••••••"
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg px-3 py-2 mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#1e40af] hover:bg-[#2563eb] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-[10px] text-slate-600 text-center mt-6">DURATA® S.A.S — Uso interno</p>
      </div>
    </div>
  )
}
