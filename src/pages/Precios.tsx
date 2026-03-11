import { useState } from 'react'
import { useStore } from '../lib/store'
import { formatCOP } from '../lib/utils'
import { Search, Save } from 'lucide-react'

export default function Precios() {
  const { state, dispatch } = useStore()
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

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
  }

  return (
    <div className="p-8 space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Precios Maestro</h2>
          <p className="text-sm text-[var(--color-text-muted)]">{state.precios.length} materiales y accesorios. Haz clic en un precio para editarlo.</p>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o código..." className="w-full pl-9 pr-3 py-2 rounded-lg text-sm max-w-md" />
      </div>

      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
              <th className="px-4 py-3 font-medium">Grupo</th>
              <th className="px-4 py-3 font-medium">Material</th>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Unidad</th>
              <th className="px-4 py-3 font-medium text-right">Precio</th>
              <th className="px-4 py-3 font-medium">Proveedor</th>
              <th className="px-4 py-3 font-medium">Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors">
                <td className="px-4 py-2"><span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-400">{p.grupo}</span></td>
                <td className="px-4 py-2 text-xs max-w-xs truncate">{p.nombre}</td>
                <td className="px-4 py-2 text-xs text-[var(--color-text-muted)] font-mono">{p.codigo}</td>
                <td className="px-4 py-2 text-xs">{p.unidad}</td>
                <td className="px-4 py-2 text-right">
                  {editingId === p.id ? (
                    <div className="flex items-center gap-1 justify-end">
                      <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} className="w-28 px-2 py-1 rounded text-sm text-right" autoFocus onKeyDown={e => e.key === 'Enter' && saveEdit(p.id)} />
                      <button onClick={() => saveEdit(p.id)} className="text-[var(--color-accent-green)] hover:opacity-80"><Save size={14} /></button>
                    </div>
                  ) : (
                    <span onClick={() => startEdit(p.id, p.precio)} className="cursor-pointer hover:text-[var(--color-primary)] font-medium">{formatCOP(p.precio)}</span>
                  )}
                </td>
                <td className="px-4 py-2 text-xs text-[var(--color-text-muted)]">{p.proveedor}</td>
                <td className="px-4 py-2 text-xs text-[var(--color-text-muted)]">{p.updated_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
