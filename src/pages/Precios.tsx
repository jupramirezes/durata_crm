import { useState } from 'react'
import { useStore } from '../lib/store'
import { formatCOP } from '../lib/utils'
import { Search, Save, DollarSign } from 'lucide-react'

export default function Precios() {
  const { state, dispatch } = useStore()
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [lastEditedId, setLastEditedId] = useState<string | null>(null)

  const filtered = state.precios.filter(p =>
    !search || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.codigo.toLowerCase().includes(search.toLowerCase())
  )

  function startEdit(id: string, precio: number) {
    setEditingId(id)
    setEditValue(String(precio))
  }

  function saveEdit(id: string) {
    dispatch({ type: 'UPDATE_PRECIO', payload: { id, precio: Number(editValue) } })
    setEditingId(null)
    setLastEditedId(id)
    setTimeout(() => setLastEditedId(null), 3000)
  }

  const isRecent = (date: string) => {
    return (Date.now() - new Date(date).getTime()) < 7 * 86400000
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Precios Maestro</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{state.precios.length} materiales y accesorios. Haz clic en un precio para editarlo.</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <DollarSign size={20} className="text-[var(--color-accent-green)]" />
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o codigo..." className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm" />
      </div>

      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
              <th className="px-5 py-3.5 font-medium">Grupo</th>
              <th className="px-5 py-3.5 font-medium">Material</th>
              <th className="px-5 py-3.5 font-medium">Codigo</th>
              <th className="px-5 py-3.5 font-medium">Unidad</th>
              <th className="px-5 py-3.5 font-medium text-right">Precio</th>
              <th className="px-5 py-3.5 font-medium">Proveedor</th>
              <th className="px-5 py-3.5 font-medium">Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} className={`border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-all duration-300 ${i % 2 === 1 ? 'bg-[var(--color-bg)]/50' : ''} ${lastEditedId === p.id ? 'bg-yellow-500/5' : ''}`}>
                <td className="px-5 py-3">
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-medium border bg-blue-500/10 text-blue-400 border-blue-500/20">{p.grupo}</span>
                </td>
                <td className="px-5 py-3 text-xs max-w-xs truncate">{p.nombre}</td>
                <td className="px-5 py-3 text-xs text-[var(--color-text-muted)] font-mono">{p.codigo}</td>
                <td className="px-5 py-3 text-xs">{p.unidad}</td>
                <td className="px-5 py-3 text-right">
                  {editingId === p.id ? (
                    <div className="flex items-center gap-1.5 justify-end">
                      <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} className="w-28 px-2 py-1.5 rounded-lg text-sm text-right" autoFocus onKeyDown={e => e.key === 'Enter' && saveEdit(p.id)} />
                      <button onClick={() => saveEdit(p.id)} className="text-[var(--color-accent-green)] hover:opacity-80 p-1 rounded-lg hover:bg-emerald-500/10 transition-all duration-200"><Save size={14} /></button>
                    </div>
                  ) : (
                    <span onClick={() => startEdit(p.id, p.precio)} className="cursor-pointer hover:text-[var(--color-primary)] font-medium transition-colors duration-200">{formatCOP(p.precio)}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-xs text-[var(--color-text-muted)]">{p.proveedor}</td>
                <td className="px-5 py-3 text-xs text-[var(--color-text-muted)]">
                  <div className="flex items-center gap-2">
                    {p.updated_at}
                    {isRecent(p.updated_at) && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium">Reciente</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
