import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Search, Building2, User, FileText, X } from 'lucide-react'
import { formatCOP } from '../lib/utils'

interface SearchResult {
  type: 'empresa' | 'contacto' | 'cotizacion'
  id: string
  title: string
  subtitle: string
  navigateTo: string
}

export default function GlobalSearch() {
  const { state } = useStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') { setOpen(false); setQuery('') }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Click outside closes
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false); setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const search = useCallback((q: string): SearchResult[] => {
    if (q.length < 2) return []
    const lower = q.toLowerCase()
    const results: SearchResult[] = []

    // Empresas
    const empresas = state.empresas.filter(e => e.nombre.toLowerCase().includes(lower)).slice(0, 5)
    for (const e of empresas) {
      const opCount = state.oportunidades.filter(o => o.empresa_id === e.id).length
      results.push({
        type: 'empresa',
        id: e.id,
        title: e.nombre,
        subtitle: `${e.nit ? 'NIT ' + e.nit + ' — ' : ''}${opCount} oportunidades`,
        navigateTo: `/empresas/${e.id}`,
      })
    }

    // Contactos
    const contactos = state.contactos.filter(c => c.nombre.toLowerCase().includes(lower)).slice(0, 3)
    for (const c of contactos) {
      const emp = state.empresas.find(e => e.id === c.empresa_id)
      results.push({
        type: 'contacto',
        id: c.id,
        title: c.nombre,
        subtitle: emp?.nombre || '',
        navigateTo: emp ? `/empresas/${emp.id}` : '#',
      })
    }

    // Cotizaciones
    const cots = state.cotizaciones.filter(c => c.numero.toLowerCase().includes(lower)).slice(0, 3)
    for (const c of cots) {
      const opp = state.oportunidades.find(o => o.id === c.oportunidad_id)
      const emp = opp ? state.empresas.find(e => e.id === opp.empresa_id) : null
      results.push({
        type: 'cotizacion',
        id: c.id,
        title: c.numero,
        subtitle: `${emp?.nombre || ''} — ${formatCOP(c.total)}`,
        navigateTo: `/cotizaciones/${c.id}/editar`,
      })
    }

    return results
  }, [state])

  const results = search(query)
  const grouped = {
    empresa: results.filter(r => r.type === 'empresa'),
    contacto: results.filter(r => r.type === 'contacto'),
    cotizacion: results.filter(r => r.type === 'cotizacion'),
  }

  function handleSelect(r: SearchResult) {
    navigate(r.navigateTo)
    setOpen(false)
    setQuery('')
  }

  const icons = { empresa: Building2, contacto: User, cotizacion: FileText }
  const labels = { empresa: 'Empresas', contacto: 'Contactos', cotizacion: 'Cotizaciones' }

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 text-sm transition-colors w-full"
      >
        <Search size={15} />
        <span className="flex-1 text-left text-[13px]">Buscar...</span>
        <kbd className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-500 font-mono">Ctrl+K</kbd>
      </button>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20">
        <Search size={15} className="text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar empresa, contacto, cotizacion..."
          className="flex-1 bg-transparent border-none text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-0"
        />
        <button onClick={() => { setOpen(false); setQuery('') }} className="text-slate-500 hover:text-slate-300">
          <X size={14} />
        </button>
      </div>

      {query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e2538] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto animate-fade-in">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500">Sin resultados para "{query}"</div>
          ) : (
            <>
              {(['empresa', 'contacto', 'cotizacion'] as const).map(type => {
                const items = grouped[type]
                if (items.length === 0) return null
                const Icon = icons[type]
                return (
                  <div key={type}>
                    <div className="px-4 py-2 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-500 bg-white/[0.03]">
                      {labels[type]} ({items.length})
                    </div>
                    {items.map(r => (
                      <button
                        key={r.id}
                        onClick={() => handleSelect(r)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.06] transition-colors text-left"
                      >
                        <Icon size={15} className="text-slate-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white truncate">{r.title}</p>
                          <p className="text-xs text-slate-500 truncate">{r.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}
