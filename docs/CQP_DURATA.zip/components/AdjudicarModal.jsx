/* Screen 7 — Adjudicación → OC modal */
const { useState: useStateAdj } = React;

// Consolidated OCs pre-filled (grouped by supplier from the APU across products)
const SUGGESTED_OCS = [
  {
    id: 'draft-1', prov: 'IMPORINOX',
    items: [
      { cod: 'AILAL00102', desc: 'Lámina inox lisa mate cal. 1/8"',  qty: 4.7,  und: 'UND', punit: 485000, subtotal: 2279500, from: ['P1','P2'] },
      { cod: 'AILAL00201', desc: 'Lámina inox brillante cal. 1/8"',  qty: 0.8,  und: 'UND', punit: 520000, subtotal: 416000,  from: ['P2'] },
    ],
    leadTime: 5, total: 2695500,
  },
  {
    id: 'draft-2', prov: 'INVERSINOX',
    items: [
      { cod: 'AITCR01202', desc: 'Tubo redondo inox 1 1/2" cal. 16', qty: 13.6, und: 'ML', punit: 54200, subtotal: 737120, from: ['P1'] },
    ],
    leadTime: 4, total: 737120,
  },
  {
    id: 'draft-3', prov: 'WESCO',
    items: [
      { cod: 'AILAL00104', desc: 'Lámina inox lisa mate cal. 1/4"',  qty: 5.4, und: 'UND', punit: 789000, subtotal: 4260600, from: ['P3'] },
    ],
    leadTime: 8, total: 4260600,
    warn: 'Precio 60d · recotizar',
  },
  {
    id: 'draft-4', prov: 'DISTRIVALVULAS',
    items: [
      { cod: 'GRLAV00201', desc: 'Grifo pedal industrial inox', qty: 6, und: 'UND', punit: 380000, subtotal: 2280000, from: ['P3'] },
      { cod: 'GRVAL00301', desc: 'Válvula bola 1/2" inox 316',  qty: 12,und: 'UND', punit: 68000,  subtotal: 816000,  from: ['P3'] },
    ],
    leadTime: 3, total: 3096000,
  },
  {
    id: 'draft-5', prov: 'ACINOX',
    items: [
      { cod: 'ACTIR00501', desc: 'Tirador inox tipo barra 256mm', qty: 8, und: 'UND', punit: 28500, subtotal: 228000, from: ['P1'] },
    ],
    leadTime: 5, total: 228000,
  },
  {
    id: 'draft-6', prov: 'VITELCO',
    items: [
      { cod: 'ELCAB00302', desc: 'Cable encauchetado 3x14 AWG', qty: 12, und: 'ML', punit: 8900, subtotal: 106800, from: ['P2'] },
    ],
    leadTime: 2, total: 106800,
  },
];

function AdjudicarModal({ onClose, onCommit }) {
  const [selected, setSelected] = useStateAdj(SUGGESTED_OCS.reduce((a,o) => ({...a,[o.id]:true}), {}));
  const [step, setStep] = useStateAdj('review'); // review | done
  const selCount = Object.values(selected).filter(Boolean).length;
  const selTotal = SUGGESTED_OCS.filter(o => selected[o.id]).reduce((s,o) => s+o.total, 0);

  const commit = () => {
    setStep('done');
    setTimeout(() => { onCommit(); onClose(); }, 1400);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{width:'min(900px, 94vw)',maxHeight:'90vh'}}>
        <div className="modal-hd">
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div className="t">Marcar cotización como adjudicada</div>
              <span className="state state-aprobada">COT-2026-0482 · {COTIZACION.empresa.split(' ').slice(0,3).join(' ')}</span>
            </div>
            <div style={{fontSize:11.5,color:'var(--text-3)',marginTop:3}}>Al adjudicar, se generarán automáticamente {SUGGESTED_OCS.length} órdenes de compra en borrador, agrupadas por proveedor.</div>
          </div>
          <span className="x" onClick={onClose}><Icon d={ICONS.close} /></span>
        </div>

        {step === 'review' && (
          <>
            <div className="modal-body" style={{padding:0}}>
              {/* summary strip */}
              <div style={{padding:'14px 20px',background:'var(--surface-2)',borderBottom:'1px solid var(--line)',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20}}>
                {[
                  ['OCs sugeridas', SUGGESTED_OCS.length],
                  ['Proveedores', SUGGESTED_OCS.length],
                  ['Ítems totales', SUGGESTED_OCS.reduce((s,o)=>s+o.items.length,0)],
                  ['Valor compras', fmtShort(SUGGESTED_OCS.reduce((s,o)=>s+o.total,0))],
                ].map(([l,v])=>(
                  <div key={l}>
                    <div style={{fontFamily:'var(--f-mono)',fontSize:9.5,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em'}}>{l}</div>
                    <div style={{fontSize:17,fontWeight:600,fontFamily:'var(--f-mono)',marginTop:2}}>{v}</div>
                  </div>
                ))}
              </div>

              {/* list of draft OCs */}
              <div style={{padding:'12px 20px',maxHeight:'48vh',overflow:'auto'}}>
                <div style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10}}>Borradores de OC (consolidados por proveedor)</div>
                {SUGGESTED_OCS.map((o) => {
                  const on = !!selected[o.id];
                  return (
                    <div key={o.id} style={{border:'1px solid '+(on?'var(--accent-line)':'var(--line)'),borderRadius:8,marginBottom:8,background: on?'var(--accent-weak)':'var(--surface)',overflow:'hidden'}}>
                      <label style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',cursor:'pointer'}}>
                        <input type="checkbox" checked={on} onChange={e=>setSelected({...selected,[o.id]:e.target.checked})} style={{accentColor:'var(--accent)',width:14,height:14}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <span style={{fontWeight:600,fontSize:13}}>{o.prov}</span>
                            <span style={{fontFamily:'var(--f-mono)',fontSize:10.5,color:'var(--text-3)'}}>{o.items.length} ítem{o.items.length>1?'s':''}</span>
                            <span className="pill" style={{fontSize:10,padding:'0 6px'}}>lead {o.leadTime}d</span>
                            {o.warn && <span className="state state-warn" style={{marginLeft:0}}>⚠ {o.warn}</span>}
                          </div>
                          <div style={{fontSize:11,color:'var(--text-3)',marginTop:2,fontFamily:'var(--f-mono)'}}>
                            desde {Array.from(new Set(o.items.flatMap(i=>i.from))).join(' · ')}
                          </div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontFamily:'var(--f-mono)',fontSize:14,fontWeight:600,fontVariantNumeric:'tabular-nums'}}>{fmt(o.total)}</div>
                          <div style={{fontSize:10,color:'var(--text-3)',fontFamily:'var(--f-mono)',marginTop:1}}>borrador · OC-2026-#####</div>
                        </div>
                      </label>
                      {on && (
                        <div style={{borderTop:'1px solid var(--accent-line)',background:'var(--surface)',padding:'4px 0'}}>
                          {o.items.map((it,i) => (
                            <div key={i} style={{display:'grid',gridTemplateColumns:'120px 1fr 80px 90px 100px',alignItems:'center',padding:'6px 14px 6px 46px',fontSize:11.5,borderBottom: i<o.items.length-1?'1px solid var(--line-2)':'none'}}>
                              <span className="mono tnum" style={{fontSize:10.5,color:'var(--text-2)'}}>{it.cod}</span>
                              <span style={{color:'var(--text-2)',paddingRight:8,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{it.desc}</span>
                              <span style={{textAlign:'right',fontFamily:'var(--f-mono)'}}>{it.qty} <span style={{color:'var(--text-4)'}}>{it.und}</span></span>
                              <span style={{textAlign:'right',fontFamily:'var(--f-mono)',color:'var(--text-3)'}}>{fmt(it.punit)}</span>
                              <span style={{textAlign:'right',fontFamily:'var(--f-mono)',fontWeight:600}}>{fmt(it.subtotal)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Side effects info */}
              <div style={{padding:'14px 20px',background:'var(--surface-2)',borderTop:'1px solid var(--line)'}}>
                <div style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Al confirmar</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8,fontSize:12}}>
                  {[
                    ['Cotización pasa a estado adjudicada', 'check'],
                    ['Se crean ' + selCount + ' OCs en borrador asignadas a Oscar', 'check'],
                    ['Bandeja de compras se actualiza automáticamente', 'check'],
                    ['Cliente recibe email de confirmación de adjudicación', 'check'],
                  ].map(([t,i],idx)=>(
                    <div key={idx} style={{display:'flex',gap:8,alignItems:'flex-start'}}>
                      <span style={{color:'var(--pos)',marginTop:1}}><Icon d={ICONS.check}/></span>
                      <span style={{color:'var(--text-2)'}}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-ft">
              <div style={{fontSize:11.5,color:'var(--text-3)'}}>
                <span style={{fontFamily:'var(--f-mono)',color:'var(--text)',fontWeight:600}}>{selCount}</span> OCs seleccionadas · total compras <span style={{fontFamily:'var(--f-mono)',color:'var(--text)',fontWeight:600}}>{fmt(selTotal)}</span>
              </div>
              <div style={{marginLeft:'auto',display:'flex',gap:8}}>
                <button className="btn" onClick={onClose}>Cancelar</button>
                <button className="btn accent" onClick={commit} disabled={selCount===0}>
                  <Icon d={ICONS.check} /> Adjudicar y generar {selCount} OC{selCount!==1?'s':''}
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'done' && (
          <div style={{padding:'48px 20px',textAlign:'center'}}>
            <div style={{width:48,height:48,borderRadius:24,background:'var(--pos-weak)',color:'var(--pos)',display:'grid',placeItems:'center',margin:'0 auto 14px'}}>
              <Icon d={ICONS.check} />
            </div>
            <div style={{fontSize:17,fontWeight:600,letterSpacing:'-0.01em'}}>Cotización adjudicada</div>
            <div style={{fontSize:12.5,color:'var(--text-3)',marginTop:6}}>{selCount} OCs creadas en borrador · Oscar recibió notificación</div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { AdjudicarModal });
