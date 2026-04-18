import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Search, Building2, User, FileText, X } from 'lucide-react'

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

  // Ctrl+K / Cmd+K shortcut — listens globally
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

  const q = query.trim().toLowerCase()
  const results: SearchResult[] = (() => {
    if (q.length < 2) return []
    const empresas = state.empresas
      .filter(e => e.nombre.toLowerCase().includes(q) || (e.nit || '').toLowerCase().includes(q))
      .slice(0, 5)
      .map(e => ({ type: 'empresa' as const, id: e.id, title: e.nombre, subtitle: `NIT ${e.nit || '—'} · ${e.sector || 'Sin sector'}`, navigateTo: `/empresas/${e.id}` }))

    const contactos = state.contactos
      .filter(c => c.nombre.toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q))
      .slice(0, 5)
      .map(c => {
        const emp = state.empresas.find(e => e.id === c.empresa_id)
        return { type: 'contacto' as const, id: c.id, title: c.nombre, subtitle: emp ? emp.nombre : 'Sin empresa', navigateTo: emp ? `/empresas/${emp.id}` : '/empresas' }
      })

    const cotizaciones = state.cotizaciones
      .filter(c => c.numero?.toLowerCase().includes(q))
      .slice(0, 5)
      .map(c => ({ type: 'cotizacion' as const, id: c.id, title: c.numero || '—', subtitle: `${c.estado} · ${c.total ? '$' + c.total.toLocaleString('es-CO') : '—'}`, navigateTo: `/cotizaciones/${c.id}/editar` }))

    return [...empresas, ...contactos, ...cotizaciones]
  })()

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

  if (!open) return null

  const icons = { empresa: Building2, contacto: User, cotizacion: FileText }
  const labels = { empresa: 'Empresas', contacto: 'Contactos', cotizacion: 'Cotizaciones' }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[14vh]"
      onClick={() => { setOpen(false); setQuery('') }}
    >
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-[560px] mx-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] overflow-hidden animate-scale-in"
        style={{ boxShadow: 'var(--shadow-pop)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
          <Search size={15} className="text-[var(--color-text-label)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar empresa, contacto, cotización…"
            className="flex-1 bg-transparent border-none text-[var(--color-text)] text-[13.5px] placeholder:text-[var(--color-text-label)] focus:outline-none focus:ring-0"
            style={{ border: 'none', padding: 0 }}
          />
          <kbd className="font-mono text-[10.5px] text-[var(--color-text-faint)] px-1.5 py-0.5 border border-[var(--color-border)] rounded">Esc</kbd>
          <button
            onClick={() => { setOpen(false); setQuery('') }}
            className="text-[var(--color-text-label)] hover:text-[var(--color-text)] p-1"
            style={{ minHeight: 0 }}
            aria-label="Cerrar búsqueda"
          >
            <X size={14} />
          </button>
        </div>

        {q.length < 2 ? (
          <div className="px-4 py-8 text-center text-[13px] text-[var(--color-text-label)]">
            Escribe al menos 2 caracteres para buscar
          </div>
        ) : results.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-[var(--color-text-label)]">
            Sin resultados para &ldquo;{query}&rdquo;
          </div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto">
            {(['empresa', 'contacto', 'cotizacion'] as const).map(type => {
              const items = grouped[type]
              if (items.length === 0) return null
              const Icon = icons[type]
              return (
                <div key={type}>
                  <div className="px-4 py-2 text-[10.5px] font-mono uppercase tracking-[0.06em] text-[var(--color-text-label)] bg-[var(--color-surface-2)] border-t border-[var(--color-border)]">
                    {labels[type]} ({items.length})
                  </div>
                  {items.map(r => (
                    <button
                      key={r.id}
                      onClick={() => handleSelect(r)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-surface-2)] transition-colors text-left"
                      style={{ minHeight: 0 }}
                    >
                      <Icon size={14} className="text-[var(--color-text-label)] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] text-[var(--color-text)] truncate">{r.title}</p>
                        <p className="text-[11px] text-[var(--color-text-label)] truncate">{r.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
