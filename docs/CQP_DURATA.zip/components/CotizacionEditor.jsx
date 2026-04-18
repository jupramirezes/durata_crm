/* Screen 6 — Cotización Editor */
const { useState: useStateCE, useRef: useRefCE } = React;

function VersionBadge({ v, active }) {
  return (
    <span style={{
      display:'inline-block',padding:'2px 7px',borderRadius:4,
      fontFamily:'var(--f-mono)',fontSize:10.5,fontWeight:600,
      background: active ? 'var(--text)' : 'var(--surface-2)',
      color: active ? 'var(--surface)' : 'var(--text-3)',
      border: '1px solid ' + (active ? 'var(--text)' : 'var(--line)'),
      letterSpacing:'0.04em',
    }}>v{v}</span>
  );
}

function CotCell({ val, status, onEdit, suffix }) {
  const bg = status === 'override' ? 'rgba(70,110,180,0.06)' : status === 'alert' ? 'rgba(220,60,60,0.05)' : 'transparent';
  const border = status === 'override' ? '1px solid var(--accent-line)' : '1px solid transparent';
  return (
    <div style={{padding:'4px 8px',background:bg,border,borderRadius:4,minHeight:24,display:'flex',alignItems:'center',justifyContent:'flex-end',gap:4,cursor:'text',fontFamily:'var(--f-mono)',fontSize:11.5,fontVariantNumeric:'tabular-nums',fontWeight: status==='override'?600:500,color: status==='override'?'var(--accent)':'inherit'}}>
      {val}{suffix && <span style={{color:'var(--text-4)',fontSize:10}}>{suffix}</span>}
    </div>
  );
}

function ProductCard({ p, idx, expanded, onToggle, onAdjudicar }) {
  return (
    <div style={{border:'1px solid var(--line)',borderRadius:10,background:'var(--surface)',overflow:'hidden',marginBottom:10}}>
      <div style={{display:'flex',gap:14,padding:14,alignItems:'flex-start'}}>
        <div style={{cursor:'grab',color:'var(--text-4)',paddingTop:6}}>
          <Icon d={ICONS.drag} />
        </div>
        {/* thumb */}
        <div style={{width:72,height:72,background:'var(--surface-2)',border:'1px solid var(--line)',borderRadius:8,display:'grid',placeItems:'center',flexShrink:0,position:'relative'}}>
          <svg viewBox="0 0 40 40" width="36" height="36" stroke="var(--text-3)" fill="none" strokeWidth="1">
            <rect x="4" y="16" width="32" height="4"/><rect x="6" y="20" width="2" height="14"/><rect x="32" y="20" width="2" height="14"/><rect x="6" y="26" width="28" height="1"/>
          </svg>
          <div style={{position:'absolute',bottom:3,right:3,background:'var(--surface)',border:'1px solid var(--line)',borderRadius:4,padding:'0 3px',fontSize:9,fontFamily:'var(--f-mono)',color:'var(--text-3)'}}>×{p.qty}</div>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
            <span style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--text-4)',letterSpacing:'0.04em'}}>#{idx+1}</span>
            <div style={{fontSize:14,fontWeight:600,letterSpacing:'-0.005em'}}>{p.nombre}</div>
          </div>
          <div style={{fontSize:12,color:'var(--text-3)',marginBottom:8}}>{p.spec}</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            <button className="btn xs"><Icon d={ICONS.edit} /> Editar configuración</button>
            <button className="btn xs" onClick={onToggle}>{expanded ? '▴ Ocultar APU' : '▾ Ver APU'} ({p.apu.length})</button>
            <button className="btn xs"><Icon d={ICONS.paperclip} /> Adjuntar imagen</button>
            <button className="btn xs" style={{marginLeft:'auto',color:'var(--neg)'}}>Quitar</button>
          </div>
        </div>
        <div style={{textAlign:'right',paddingLeft:12,borderLeft:'1px solid var(--line-2)',minWidth:140}}>
          <div style={{fontFamily:'var(--f-mono)',fontSize:9.5,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:2}}>Subtotal</div>
          <div style={{fontFamily:'var(--f-mono)',fontSize:16,fontWeight:600,fontVariantNumeric:'tabular-nums'}}>{fmt(p.subtotal)}</div>
          <div style={{fontSize:11,color:'var(--text-3)',fontFamily:'var(--f-mono)',marginTop:2}}>{p.qty} × {fmt(p.precio)}</div>
        </div>
      </div>

      {expanded && (
        <div style={{borderTop:'1px solid var(--line)',background:'var(--surface-2)',padding:'0'}}>
          <div style={{padding:'10px 16px',display:'flex',alignItems:'center',gap:10,fontSize:11.5,color:'var(--text-3)'}}>
            <span style={{fontFamily:'var(--f-mono)',fontSize:10,textTransform:'uppercase',letterSpacing:'0.06em'}}>APU · Edición inline</span>
            <span style={{marginLeft:'auto',display:'flex',gap:6}}>
              <span className="fresh ok" style={{fontSize:9.5}}><span className="d"/>{p.apu.filter(r=>r.freshness==='ok').length}</span>
              <span className="fresh mid" style={{fontSize:9.5}}><span className="d"/>{p.apu.filter(r=>r.freshness==='mid').length}</span>
              <span className="fresh old" style={{fontSize:9.5}}><span className="d"/>{p.apu.filter(r=>r.freshness==='old'||r.freshness==='none').length}</span>
            </span>
          </div>
          <div style={{background:'var(--surface)',borderTop:'1px solid var(--line)'}}>
            <div style={{display:'grid',gridTemplateColumns:'120px 1fr 56px 48px 110px 92px 100px 110px',fontFamily:'var(--f-mono)',fontSize:9.5,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',padding:'8px 14px',borderBottom:'1px solid var(--line)',background:'var(--surface-2)'}}>
              <div>Código</div><div>Descripción</div><div style={{textAlign:'right'}}>Cant</div><div>Und</div><div style={{textAlign:'right'}}>P.Unit</div><div>Fecha</div><div>Prov</div><div style={{textAlign:'right'}}>Subtotal</div>
            </div>
            {p.apu.map((r,i) => (
              <div key={i} style={{display:'grid',gridTemplateColumns:'120px 1fr 56px 48px 110px 92px 100px 110px',alignItems:'center',padding:'4px 14px',borderBottom:'1px solid var(--line-2)',fontSize:11.5,background: r.status==='missing'?'rgba(220,60,60,0.04)':'transparent'}}>
                <div className="mono tnum" style={{fontSize:11,color: r.cod?'var(--text)':'var(--text-4)',borderBottom: r.cod?'1px dotted var(--text-3)':'none',display:'inline',cursor:'pointer',width:'fit-content'}}>{r.cod||'—'}</div>
                <div style={{paddingRight:8,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.desc}{r.status==='alert' && <span style={{fontFamily:'var(--f-mono)',fontSize:9.5,color:'var(--neg)',marginLeft:6}}>⚠ {daysAgo(r.fecha)}d</span>}</div>
                <CotCell val={r.qty} status={r.status === 'override' ? 'override' : 'default'} />
                <div style={{fontFamily:'var(--f-mono)',fontSize:11,color:'var(--text-3)'}}>{r.und}</div>
                {r.status === 'missing'
                  ? <div style={{textAlign:'right'}}><button className="btn xs danger" style={{height:18,fontSize:10}}>Solicitar</button></div>
                  : <CotCell val={fmt(r.punit)} status={r.status} />}
                <div style={{fontFamily:'var(--f-mono)',fontSize:10.5,color:'var(--text-3)'}}>{r.fecha}</div>
                <div style={{fontSize:10.5,color:'var(--text-3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',paddingRight:6}}>{r.prov}</div>
                <div style={{textAlign:'right',fontFamily:'var(--f-mono)',fontSize:11.5,fontWeight:600,fontVariantNumeric:'tabular-nums'}}>{r.status==='missing'?'—':fmt(r.subtotal)}</div>
              </div>
            ))}
            <div style={{display:'flex',padding:'8px 14px',gap:8,borderBottom:'1px solid var(--line-2)'}}>
              <button className="btn xs"><Icon d={ICONS.plus} /> Agregar ítem</button>
              <button className="btn xs">Reset al maestro</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CotizacionEditor({ setRoute, openAdjudicar }) {
  const [expanded, setExpanded] = useStateCE({ P1: true });
  const [tab, setTab] = useStateCE('general');
  const [previewOpen, setPreviewOpen] = useStateCE(true);
  const [toast, setToast] = useStateCE(null);
  const [conds, setConds] = useStateCE({ iva: true, garantia: true, anticipo: true, instalacion: false, obracivil: false });

  const c = COTIZACION;
  const total = c.productos.reduce((s, p) => s + p.subtotal, 0);
  const iva = conds.iva ? total * 0.19 : 0;
  const gran = total + iva;

  const save = () => {
    setToast('Borrador guardado · versión B');
    setTimeout(() => setToast(null), 2400);
  };

  return (
    <div style={{display:'grid',gridTemplateColumns: previewOpen ? 'minmax(0,1fr) 320px' : 'minmax(0,1fr) 320px',gridTemplateAreas:'"header header" "main side"',minHeight:'100vh'}}>
      {/* Sticky cotization header */}
      <div style={{gridArea:'header',position:'sticky',top:0,zIndex:15,background:'var(--surface)',borderBottom:'1px solid var(--line)'}}>
        <Topbar crumbs={['Cotizaciones', c.id]} actions={
          <>
            <button className="btn" onClick={save}><Icon d={ICONS.save} /> Guardar</button>
            <button className="btn" onClick={()=>setPreviewOpen(!previewOpen)}><Icon d={previewOpen?ICONS.eyeOff:ICONS.eye} /> PDF</button>
            <button className="btn accent"><Icon d={ICONS.send} /> Enviar</button>
          </>
        } />
        <div style={{padding:'14px 24px',display:'flex',alignItems:'center',gap:16,borderTop:'1px solid var(--line-2)'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
              <span style={{fontFamily:'var(--f-mono)',fontSize:12,color:'var(--text-3)'}}>{c.id}</span>
              <span className="state state-borrador">{c.estado.toUpperCase()}</span>
              <div style={{display:'flex',gap:4}}>
                {c.versiones.map(v => <VersionBadge key={v.v} v={v.v} active={v.v === c.version} />)}
              </div>
            </div>
            <div style={{fontSize:18,fontWeight:600,letterSpacing:'-0.01em'}}>{c.empresa}</div>
            <div style={{fontSize:12,color:'var(--text-3)',marginTop:2}}>{c.contacto} · {c.proyecto}</div>
          </div>
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:14,fontSize:11.5,color:'var(--text-3)'}}>
            <div><div style={{fontFamily:'var(--f-mono)',fontSize:9.5,color:'var(--text-4)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Cotizador</div><div style={{display:'flex',alignItems:'center',gap:6,marginTop:3}}><div className="avatar sm">{c.cotizador}</div><span style={{color:'var(--text)'}}>{c.cotizadorNombre}</span></div></div>
            <div><div style={{fontFamily:'var(--f-mono)',fontSize:9.5,color:'var(--text-4)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Creada</div><div style={{fontFamily:'var(--f-mono)',marginTop:3,color:'var(--text)'}}>{c.fechaCreada}</div></div>
            <div><div style={{fontFamily:'var(--f-mono)',fontSize:9.5,color:'var(--text-4)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Validez</div><div style={{fontFamily:'var(--f-mono)',marginTop:3,color:'var(--text)'}}>{c.validez}</div></div>
          </div>
        </div>
      </div>

      {/* Main (productos + tabs) */}
      <div style={{gridArea:'main',padding:'22px 22px 60px',minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
          <div style={{fontFamily:'var(--f-mono)',fontSize:10.5,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Productos configurados · {c.productos.length}</div>
          <div style={{height:1,flex:1,background:'var(--line)'}}/>
          <button className="btn sm"><Icon d={ICONS.plus} /> Añadir producto</button>
        </div>

        {c.productos.map((p, i) => (
          <ProductCard key={p.id} p={p} idx={i}
            expanded={!!expanded[p.id]}
            onToggle={() => setExpanded({ ...expanded, [p.id]: !expanded[p.id] })} />
        ))}

        {/* Tabs */}
        <div style={{marginTop:22,border:'1px solid var(--line)',borderRadius:10,background:'var(--surface)'}}>
          <div style={{display:'flex',borderBottom:'1px solid var(--line)'}}>
            {[['general','General'],['condiciones','Condiciones'],['noincluye','No incluye']].map(([k,n])=>(
              <button key={k} onClick={()=>setTab(k)} style={{padding:'11px 18px',fontSize:12.5,fontWeight:500,color: tab===k?'var(--text)':'var(--text-3)',borderBottom: tab===k?'2px solid var(--text)':'2px solid transparent',marginBottom:-1}}>{n}</button>
            ))}
          </div>
          <div style={{padding:20}}>
            {tab==='general' && (
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18}}>
                {[['Tiempo de entrega', c.tiempoEntrega, '35 días hábiles'],['Transporte', c.transporte, 'Incluido hasta planta'],['Validez de cotización', c.validez, '30 días']].map(([l,v],i)=>(
                  <div key={i}>
                    <div style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>{l}</div>
                    <input defaultValue={v} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--line)',borderRadius:6,fontSize:12.5,background:'var(--surface-2)'}}/>
                  </div>
                ))}
                <div style={{gridColumn:'1 / -1'}}>
                  <div style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>Valor en letras (auto)</div>
                  <div style={{padding:'10px 12px',border:'1px dashed var(--line-strong)',borderRadius:6,fontSize:12.5,color:'var(--text-2)',fontStyle:'italic'}}>Noventa y siete millones setecientos cincuenta y ocho mil quinientos pesos M/CTE</div>
                </div>
              </div>
            )}
            {tab==='condiciones' && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {[['iva','IVA 19% incluido'],['garantia','Garantía 12 meses partes y mano de obra'],['anticipo','Anticipo 50% · saldo contra entrega'],['instalacion','Incluye instalación en sitio'],['obracivil','Incluye obra civil complementaria']].map(([k,n])=>(
                  <label key={k} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',border:'1px solid var(--line)',borderRadius:8,background:conds[k]?'var(--accent-weak)':'var(--surface)',cursor:'pointer'}}>
                    <input type="checkbox" checked={conds[k]} onChange={e=>setConds({...conds,[k]:e.target.checked})} style={{accentColor:'var(--accent)'}}/>
                    <span style={{fontSize:12.5,fontWeight:500}}>{n}</span>
                  </label>
                ))}
              </div>
            )}
            {tab==='noincluye' && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {['Obra civil (muros, pisos, desagües)','Acabados finales (pintura, enchape)','Instalaciones hidráulicas externas','Instalaciones eléctricas externas','Permisos municipales','Ítems no especificados en esta cotización'].map(t=>(
                  <div key={t} style={{padding:'8px 12px',border:'1px dashed var(--line)',borderRadius:6,fontSize:12,color:'var(--text-2)',background:'var(--surface-2)'}}>— {t}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar (totals + actions + version history) */}
      <aside style={{gridArea:'side',borderLeft:'1px solid var(--line)',background:'var(--surface)',padding:18,position:'sticky',top:108,alignSelf:'start',maxHeight:'calc(100vh - 108px)',overflow:'auto'}}>
        {/* Totals */}
        <div style={{border:'1px solid var(--line)',borderRadius:10,padding:14,marginBottom:14,background:'var(--surface-2)'}}>
          <div style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10}}>Totales</div>
          {[['Subtotal', total],['IVA (19%)', iva]].map(([l,v])=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:12.5}}>
              <span style={{color:'var(--text-3)'}}>{l}</span>
              <span style={{fontFamily:'var(--f-mono)',fontVariantNumeric:'tabular-nums'}}>{fmt(v)}</span>
            </div>
          ))}
          <div style={{borderTop:'1px solid var(--line)',paddingTop:10,marginTop:8,display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
            <span style={{fontSize:11,color:'var(--text-3)',fontFamily:'var(--f-mono)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Total</span>
            <span style={{fontFamily:'var(--f-mono)',fontSize:20,fontWeight:700,fontVariantNumeric:'tabular-nums'}}>{fmt(gran)}</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:12,paddingTop:10,borderTop:'1px solid var(--line-2)'}}>
            <div><div style={{fontSize:10,color:'var(--text-3)',fontFamily:'var(--f-mono)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Productos</div><div style={{fontSize:15,fontWeight:600,fontFamily:'var(--f-mono)',marginTop:2}}>{c.productos.length}</div></div>
            <div><div style={{fontSize:10,color:'var(--text-3)',fontFamily:'var(--f-mono)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Margen</div><div style={{fontSize:15,fontWeight:600,fontFamily:'var(--f-mono)',marginTop:2,color:'var(--pos)'}}>24.3%</div></div>
          </div>
        </div>

        {/* Actions */}
        <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:14}}>
          <button className="btn accent" style={{justifyContent:'center'}} onClick={openAdjudicar}><Icon d={ICONS.check} /> Marcar como adjudicada</button>
          <button className="btn" style={{justifyContent:'flex-start'}}><Icon d={ICONS.send} /> Enviar al cliente</button>
          <button className="btn" style={{justifyContent:'flex-start'}}><Icon d={ICONS.pdf} /> Descargar PDF</button>
          <button className="btn" style={{justifyContent:'flex-start'}}><Icon d={ICONS.history} /> Recotizar (precios actuales)</button>
          <button className="btn" style={{justifyContent:'flex-start'}}><Icon d={ICONS.copy} /> Guardar como plantilla</button>
          <button className="btn" style={{justifyContent:'flex-start'}}><Icon d={ICONS.external} /> Duplicar para otro cliente</button>
        </div>

        {/* Version history */}
        <div style={{border:'1px solid var(--line)',borderRadius:10,padding:14}}>
          <div style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10}}>Versiones</div>
          {c.versiones.map(v => (
            <div key={v.v} style={{display:'flex',gap:10,padding:'8px 0',borderBottom:'1px solid var(--line-2)',alignItems:'flex-start'}}>
              <VersionBadge v={v.v} active={v.v === c.version} />
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.35}}>{v.nota}</div>
                <div style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--text-4)',marginTop:2}}>{v.fecha}</div>
              </div>
              <div style={{textAlign:'right',fontSize:10.5,color:'var(--text-3)',fontFamily:'var(--f-mono)'}}>
                {v.total ? fmtShort(v.total) : '—'}
                {v.delta && v.delta !== '—' && <div style={{color:'var(--pos)',marginTop:2,fontSize:9.5}}>{v.delta}</div>}
              </div>
            </div>
          ))}
          <button className="btn xs" style={{marginTop:10,width:'100%',justifyContent:'center'}}><Icon d={ICONS.plus} /> Crear versión</button>
        </div>
      </aside>

      {/* PDF preview drawer — right side, only when opened */}
      {previewOpen && (
        <div style={{position:'fixed',top:108,right:320,width:320,bottom:0,background:'var(--surface-3)',borderLeft:'1px solid var(--line)',padding:14,overflow:'auto',zIndex:5}}>
          <div style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8,display:'flex',alignItems:'center',gap:6}}>
            Preview PDF
            <span className="pill" style={{fontSize:10,padding:'1px 6px',marginLeft:'auto'}}><span className="dot" style={{background:'var(--pos)'}}/>live</span>
          </div>
          <div style={{background:'#fff',border:'1px solid var(--line)',aspectRatio:'1 / 1.414',padding:18,fontSize:8,lineHeight:1.3}}>
            <div style={{display:'flex',alignItems:'flex-start',borderBottom:'1px solid #000',paddingBottom:8,marginBottom:10}}>
              <div>
                <div style={{fontFamily:'var(--f-serif)',fontSize:14,fontWeight:600,letterSpacing:'-0.02em'}}>DURATA</div>
                <div style={{fontSize:6.5,color:'#888',fontFamily:'var(--f-mono)'}}>Mobiliario industrial en acero inox.</div>
              </div>
              <div style={{marginLeft:'auto',textAlign:'right'}}>
                <div style={{fontFamily:'var(--f-mono)',fontSize:7}}>{c.id}</div>
                <div style={{fontSize:6,color:'#888'}}>{c.fechaCreada}</div>
              </div>
            </div>
            <div style={{fontSize:7.5,color:'#444',marginBottom:8}}>
              <strong>{c.empresa}</strong><br/>{c.contacto}<br/>Proyecto: {c.proyecto}
            </div>
            <div style={{borderTop:'1px solid #ccc',paddingTop:6}}>
              {c.productos.map(p => (
                <div key={p.id} style={{display:'flex',justifyContent:'space-between',marginBottom:3,fontSize:7}}>
                  <span style={{flex:1,paddingRight:8}}>{p.qty}× {p.nombre}</span>
                  <span style={{fontFamily:'var(--f-mono)'}}>{fmt(p.subtotal)}</span>
                </div>
              ))}
            </div>
            <div style={{borderTop:'1px solid #000',marginTop:8,paddingTop:6,display:'flex',justifyContent:'space-between',fontWeight:700,fontSize:8}}>
              <span>TOTAL</span><span style={{fontFamily:'var(--f-mono)'}}>{fmt(gran)}</span>
            </div>
            <div style={{marginTop:14,fontSize:5.5,color:'#666',lineHeight:1.4}}>
              • IVA 19% incluido · • Garantía 12 meses · • Anticipo 50% · • Tiempo de entrega: {c.tiempoEntrega}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <span style={{color:'var(--pos)'}}><Icon d={ICONS.check}/></span>
          {toast}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { CotizacionEditor });
