import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { findCotizador, ETAPAS } from '../types'
import { formatCOP, formatDate, getAvatarColor } from '../lib/utils'
import { showToast } from '../components/Toast'
import { ArrowLeft, Trash2, Edit3, Check, X, Phone, Mail, Plus } from 'lucide-react'

export default function EmpresaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useStore()
  const empresa = state.empresas.find(e => e.id === id)
  // All hooks must run before the early return to preserve hooks order
  const [editingEmpresa, setEditingEmpresa] = useState(false)
  const [empForm, setEmpForm] = useState({ nit: '', direccion: '', sector: '', telefono: '' })
  const [editingContactoId, setEditingContactoId] = useState<string | null>(null)
  const [contactoForm, setContactoForm] = useState({ nombre: '', cargo: '', correo: '', whatsapp: '' })

  if (!empresa) return <div className="p-6" style={{ color: 'var(--color-text-label)' }}>Empresa no encontrada</div>

  const contactos = state.contactos.filter(c => c.empresa_id === id)
  const oportunidades = state.oportunidades.filter(o => o.empresa_id === id)
  const valorCotizado = oportunidades.reduce((s, o) => s + o.valor_cotizado, 0)
  const valorAdjudicado = oportunidades.reduce((s, o) => s + o.valor_adjudicado, 0)
  const adjCount = oportunidades.filter(o => o.etapa === 'adjudicada').length
  const perdCount = oportunidades.filter(o => o.etapa === 'perdida').length
  const tasaAdj = adjCount + perdCount > 0 ? (adjCount / (adjCount + perdCount)) * 100 : 0

  function startEditEmpresa() {
    if (!empresa) return
    setEmpForm({
      nit: empresa.nit || '',
      direccion: empresa.direccion || '',
      sector: empresa.sector || '',
      telefono: (empresa as any).telefono || '',
    })
    setEditingEmpresa(true)
  }

  function saveEmpresa() {
    if (!empresa) return
    dispatch({ type: 'UPDATE_EMPRESA', payload: { ...empresa, ...empForm } })
    setEditingEmpresa(false)
    showToast('success', 'Empresa actualizada')
  }

  function startEditContacto(c: typeof contactos[0]) {
    setContactoForm({ nombre: c.nombre, cargo: c.cargo || '', correo: c.correo || '', whatsapp: c.whatsapp || '' })
    setEditingContactoId(c.id)
  }

  function saveContacto(c: typeof contactos[0]) {
    dispatch({ type: 'UPDATE_CONTACTO', payload: { ...c, ...contactoForm } })
    setEditingContactoId(null)
    showToast('success', 'Contacto actualizado')
  }

  return (
    <div className="detail-page">
      <div className="detail-main">
        {/* Back */}
        <button
          onClick={() => navigate('/empresas')}
          className="btn-d ghost sm"
          style={{ marginBottom: 14, padding: '0 8px' }}
        >
          <ArrowLeft size={13} /> Volver a empresas
        </button>

        {/* Header */}
        <div className="opp-header">
          <div className="body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-label)' }}>EMPRESA</span>
              {empresa.sector && (
                <span className="stage-pill">
                  <span className="stage-dot" style={{ background: 'var(--color-text-label)' }} />
                  {empresa.sector}
                </span>
              )}
            </div>
            <div className="opp-title">{empresa.nombre}</div>
            <div className="opp-company-line">
              <span className="mono">NIT {empresa.nit || '—'}</span>
              {empresa.direccion && (<><span className="sep">·</span><span>{empresa.direccion}</span></>)}
              {(empresa as any).telefono && (<><span className="sep">·</span><span className="mono">{(empresa as any).telefono}</span></>)}
            </div>
          </div>
          <div className="opp-header-actions">
            {!editingEmpresa ? (
              <button onClick={startEditEmpresa} className="btn-d sm">
                <Edit3 size={12} /> Editar
              </button>
            ) : (
              <>
                <button onClick={saveEmpresa} className="btn-d primary sm">
                  <Check size={12} /> Guardar
                </button>
                <button onClick={() => setEditingEmpresa(false)} className="btn-d sm">
                  <X size={12} /> Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Meta grid (4 KPIs) */}
        <div className="meta-grid">
          <div className="meta-cell">
            <div className="l">Oportunidades</div>
            <div className="v mono">{oportunidades.length}</div>
          </div>
          <div className="meta-cell">
            <div className="l">Valor cotizado</div>
            <div className="v mono">{formatCOP(valorCotizado, { short: true })}</div>
          </div>
          <div className="meta-cell">
            <div className="l">Valor adjudicado</div>
            <div className="v mono" style={{ color: valorAdjudicado > 0 ? 'var(--color-accent-green)' : 'var(--color-text-label)' }}>
              {formatCOP(valorAdjudicado, { short: true })}
            </div>
          </div>
          <div className="meta-cell">
            <div className="l">Tasa adjudicación</div>
            <div className="v mono">{adjCount + perdCount > 0 ? `${tasaAdj.toFixed(1)}%` : '—'}</div>
          </div>
        </div>

        {/* Edit empresa form (when active) */}
        {editingEmpresa && (
          <div className="section">
            <div className="section-head">
              <h2>Datos de empresa</h2>
              <span className="sub">editando</span>
            </div>
            <div className="section-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div>
                <label className="mono" style={{ fontSize: 10, color: 'var(--color-text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>NIT</label>
                <input value={empForm.nit} onChange={e => setEmpForm(p => ({ ...p, nit: e.target.value }))} className="w-full" style={{ fontSize: 12.5, padding: '6px 10px' }} />
              </div>
              <div>
                <label className="mono" style={{ fontSize: 10, color: 'var(--color-text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Sector</label>
                <input value={empForm.sector} onChange={e => setEmpForm(p => ({ ...p, sector: e.target.value }))} className="w-full" style={{ fontSize: 12.5, padding: '6px 10px' }} />
              </div>
              <div>
                <label className="mono" style={{ fontSize: 10, color: 'var(--color-text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Dirección</label>
                <input value={empForm.direccion} onChange={e => setEmpForm(p => ({ ...p, direccion: e.target.value }))} className="w-full" style={{ fontSize: 12.5, padding: '6px 10px' }} />
              </div>
              <div>
                <label className="mono" style={{ fontSize: 10, color: 'var(--color-text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Teléfono</label>
                <input value={empForm.telefono} onChange={e => setEmpForm(p => ({ ...p, telefono: e.target.value }))} className="w-full" style={{ fontSize: 12.5, padding: '6px 10px' }} />
              </div>
            </div>
          </div>
        )}

        {/* Oportunidades list */}
        <div className="section">
          <div className="section-head">
            <h2>Oportunidades</h2>
            <span className="sub">{oportunidades.length} total{oportunidades.length !== 1 ? 'es' : ''}</span>
            <div className="spacer" />
            <button onClick={() => navigate(`/pipeline?empresa=${encodeURIComponent(empresa.nombre)}`)} className="btn-d sm">
              <Plus size={12} /> Nueva oportunidad
            </button>
          </div>
          <div className="section-body tight">
            {oportunidades.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', fontSize: 12.5, color: 'var(--color-text-label)' }}>
                Sin oportunidades registradas con esta empresa.
              </div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Contacto</th>
                    <th>Etapa</th>
                    <th className="num">Valor cotizado</th>
                    <th className="num">Valor adj.</th>
                    <th>Cot.</th>
                    <th className="num">Fecha</th>
                    <th style={{ width: 32 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {oportunidades.map(o => {
                    const contacto = state.contactos.find(c => c.id === o.contacto_id)
                    const cotizador = findCotizador(o.cotizador_asignado)
                    const etapa = ETAPAS.find(e => e.key === o.etapa)
                    return (
                      <tr key={o.id} onClick={() => navigate(`/oportunidades/${o.id}`)} style={{ cursor: 'pointer' }}>
                        <td style={{ fontWeight: 500 }}>{contacto?.nombre || '—'}</td>
                        <td>
                          <span className="stage-pill">
                            <span className="stage-dot" style={{ background: etapa?.color || 'var(--color-text-label)' }} />
                            {etapa?.label || o.etapa}
                          </span>
                        </td>
                        <td className="num" style={{ fontWeight: 600 }}>{formatCOP(o.valor_cotizado, { short: true })}</td>
                        <td className="num">
                          {o.valor_adjudicado > 0 ? (
                            <span style={{ color: 'var(--color-accent-green)' }}>{formatCOP(o.valor_adjudicado, { short: true })}</span>
                          ) : <span style={{ color: 'var(--color-text-faint)' }}>—</span>}
                        </td>
                        <td>
                          {cotizador ? (
                            <span
                              className="avatar xs"
                              style={{ background: getAvatarColor(cotizador.nombre), color: '#fff', border: 'none' }}
                              title={cotizador.nombre}
                            >{cotizador.iniciales}</span>
                          ) : <span style={{ color: 'var(--color-text-faint)' }}>—</span>}
                        </td>
                        <td className="num" style={{ color: 'var(--color-text-label)' }}>{formatDate(o.fecha_ingreso)}</td>
                        <td onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              if (window.confirm('¿Seguro que deseas eliminar esta oportunidad?')) {
                                dispatch({ type: 'DELETE_OPORTUNIDAD', payload: { id: o.id } })
                              }
                            }}
                            className="btn-d ghost icon sm"
                            style={{ color: 'var(--color-accent-red)' }}
                            title="Eliminar oportunidad"
                          ><Trash2 size={12} /></button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ─── ASIDE (handoff: Datos empresa + Contactos) ─── */}
      <aside className="detail-aside">
        <div className="aside-h">Datos de empresa</div>
        <div className="prop-list">
          <div className="prop-row">
            <div className="k">NIT</div>
            <div className="v mono">{empresa.nit || '—'}</div>
          </div>
          <div className="prop-row">
            <div className="k">Sector</div>
            <div className="v">{empresa.sector || '—'}</div>
          </div>
          <div className="prop-row">
            <div className="k">Dirección</div>
            <div className="v" style={{ textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }} title={empresa.direccion || ''}>
              {empresa.direccion || '—'}
            </div>
          </div>
          <div className="prop-row">
            <div className="k">Teléfono</div>
            <div className="v mono">{(empresa as any).telefono || '—'}</div>
          </div>
          <div className="prop-row">
            <div className="k">Histórico</div>
            <div className="v mono">{formatCOP(valorCotizado, { short: true })}</div>
          </div>
        </div>

        <div className="aside-h">Contactos ({contactos.length})</div>
        {contactos.length === 0 ? (
          <div className="aside-card" style={{ textAlign: 'center', color: 'var(--color-text-label)', fontSize: 12 }}>
            Sin contactos registrados
          </div>
        ) : (
          contactos.map(c => (
            <div key={c.id} className="aside-card" style={{ marginBottom: 8 }}>
              {editingContactoId === c.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <input value={contactoForm.nombre} onChange={e => setContactoForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre" style={{ fontSize: 12, padding: '5px 8px' }} />
                  <input value={contactoForm.cargo} onChange={e => setContactoForm(p => ({ ...p, cargo: e.target.value }))} placeholder="Cargo" style={{ fontSize: 12, padding: '5px 8px' }} />
                  <input value={contactoForm.correo} onChange={e => setContactoForm(p => ({ ...p, correo: e.target.value }))} placeholder="Email" style={{ fontSize: 12, padding: '5px 8px' }} />
                  <input value={contactoForm.whatsapp} onChange={e => setContactoForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="Teléfono" style={{ fontSize: 12, padding: '5px 8px' }} />
                  <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                    <button onClick={() => saveContacto(c)} className="btn-d primary sm" style={{ flex: 1, justifyContent: 'center' }}>Guardar</button>
                    <button onClick={() => setEditingContactoId(null)} className="btn-d sm" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span
                    className="avatar sm"
                    style={{ background: getAvatarColor(c.nombre), color: '#fff', border: 'none', flexShrink: 0 }}
                  >{c.nombre.charAt(0)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{c.nombre}</div>
                    {c.cargo && <div style={{ fontSize: 11, color: 'var(--color-text-label)', marginTop: 1 }}>{c.cargo}</div>}
                    {c.correo && (
                      <a href={`mailto:${c.correo}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-primary)', marginTop: 4 }}>
                        <Mail size={10} /> {c.correo}
                      </a>
                    )}
                    {c.whatsapp && (
                      <a href={`tel:${c.whatsapp}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-primary)', marginTop: 2 }}>
                        <Phone size={10} /> {c.whatsapp}
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => startEditContacto(c)}
                    className="btn-d ghost icon sm"
                    style={{ flexShrink: 0 }}
                    title="Editar contacto"
                  ><Edit3 size={11} /></button>
                </div>
              )}
            </div>
          ))
        )}
      </aside>
    </div>
  )
}
