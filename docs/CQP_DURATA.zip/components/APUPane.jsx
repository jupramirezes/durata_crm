/* Screen 5 — APU Pane Refinado (inside Configurador) */
const { useState: useStateAP } = React;

function APUDrawer({ row, onClose }) {
  if (!row) return null;
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <div>
            <div className="mono" style={{fontSize:12,color:'var(--text-3)'}}>{row.cod}</div>
            <div className="t">{row.desc}</div>
          </div>
          <button className="btn ghost btn-icon" style={{marginLeft:'auto'}} onClick={onClose}><Icon d={ICONS.close} /></button>
        </div>
        <div className="drawer-body">
          <div style={{display:'flex',alignItems:'flex-end',gap:20,padding:16,border:'1px solid var(--line)',borderRadius:8,background:'var(--surface-2)',marginBottom:18}}>
            <div><div style={{fontFamily:'var(--f-mono)',fontSize:10.5,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Vigente</div><div style={{fontSize:22,fontWeight:600,fontVariantNumeric:'tabular-nums',fontFamily:'var(--f-mono)'}}>{fmt(row.punit)}</div></div>
            <div style={{marginLeft:'auto'}}><Sparkline values={PRICE_HIST.map(h=>h.precio)} width={200} height={50} /></div>
          </div>
          <div style={{fontFamily:'var(--f-mono)',fontSize:10.5,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Últimas 6 cotizaciones</div>
          {PRICE_HIST.slice().reverse().map((h,i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 12px',border:'1px solid var(--line)',borderRadius:6,marginBottom:4,fontSize:12}}>
              <span className="mono" style={{fontSize:11,color:'var(--text-3)'}}>{h.fecha}</span>
              <span style={{fontWeight:500}}>{h.prov}</span>
              <span className="mono tnum" style={{marginLeft:'auto',fontWeight:600}}>{fmt(h.precio)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function APURow({ row, onCodeClick, onOverride, editMode }) {
  const freshCls = row.freshness === 'ok' ? 'ok' : row.freshness === 'mid' ? 'mid' : 'old';
  const isMissing = row.status === 'missing';
  const isAlert = row.status === 'alert';
  const isOverride = row.status === 'override';

  return (
    <tr style={{
      background: isMissing ? 'rgba(220,60,60,0.04)' : isAlert ? 'rgba(220,60,60,0.03)' : 'transparent',
    }}>
      <td onClick={() => row.cod && onCodeClick(row)} style={{padding:'8px 10px',borderBottom:'1px solid var(--line-2)',cursor: row.cod ? 'pointer':'default'}}>
        <span className="mono tnum" style={{fontSize:11,fontWeight:500,color: row.cod ? 'var(--text)' : 'var(--text-4)', borderBottom: row.cod ? '1px dotted var(--text-3)' : 'none'}}>{row.cod || '—'}</span>
      </td>
      <td style={{padding:'8px 10px',borderBottom:'1px solid var(--line-2)',fontSize:12}}>
        {row.desc}
        {isAlert && <span style={{display:'block',fontSize:10.5,color:'var(--neg)',marginTop:2,fontFamily:'var(--f-mono)'}}>⚠ precio obsoleto · {daysAgo(row.fecha)}d</span>}
        {isMissing && <span style={{display:'block',fontSize:10.5,color:'var(--neg)',marginTop:2,fontFamily:'var(--f-mono)'}}>⚠ sin precio vigente</span>}
      </td>
      <td style={{padding:'8px 10px',borderBottom:'1px solid var(--line-2)',textAlign:'right'}} className="num-cell">{row.qty}</td>
      <td style={{padding:'8px 10px',borderBottom:'1px solid var(--line-2)',fontSize:11,color:'var(--text-3)',fontFamily:'var(--f-mono)'}}>{row.und}</td>
      <td style={{padding:'8px 10px',borderBottom:'1px solid var(--line-2)',textAlign:'right',position:'relative'}}>
        {isMissing ? (
          <button className="btn xs danger" style={{height:20}}>Solicitar cotización</button>
        ) : (
          <>
            <span className="mono tnum" style={{fontWeight: isOverride?600:500, color: isOverride ? 'var(--accent)' : 'var(--text)'}}>{fmt(row.punit)}</span>
            {isOverride && <span title={`Override manual · maestro $${(row.override).toLocaleString('es-CO')}`} style={{marginLeft:6,fontSize:9,padding:'1px 4px',background:'var(--accent-weak)',color:'var(--accent)',borderRadius:3,fontFamily:'var(--f-mono)',letterSpacing:'0.05em',textTransform:'uppercase'}}>manual</span>}
          </>
        )}
      </td>
      <td style={{padding:'8px 10px',borderBottom:'1px solid var(--line-2)',fontSize:11,fontFamily:'var(--f-mono)',color:'var(--text-3)'}}>
        {row.fecha !== '—' ? row.fecha : '—'}
      </td>
      <td style={{padding:'8px 10px',borderBottom:'1px solid var(--line-2)',fontSize:11}}>{row.prov}</td>
      <td style={{padding:'8px 10px',borderBottom:'1px solid var(--line-2)',textAlign:'right'}}>
        {!isMissing && <span style={{display:'inline-flex',alignItems:'center',gap:6}}><span className={'fresh '+freshCls} style={{padding:'0 5px',fontSize:9.5}}><span className="d" /></span><span className="mono tnum" style={{fontWeight:600,fontSize:12}}>{fmt(row.subtotal)}</span></span>}
      </td>
    </tr>
  );
}

function APUPane({ setRoute, embedded }) {
  const [drawerRow, setDrawerRow] = useStateAP(null);
  const product = COTIZACION.productos[0];

  return (
    <div>
      {!embedded && <Topbar crumbs={['Cotización COT-2026-0482','Mesa doble seno 2.4m','APU']} actions={
        <>
          <button className="btn"><Icon d={ICONS.edit} /> Editar configuración</button>
          <button className="btn primary" onClick={() => setRoute('cotizaciones/482')}>Volver a cotización</button>
        </>
      } />}

      <div style={{padding:'24px',display:'grid',gridTemplateColumns:'1fr 420px',gap:24,alignItems:'flex-start'}}>
        {/* LEFT - Configurator placeholder (not redesigned) */}
        <div>
          <div style={{display:'flex',alignItems:'flex-end',marginBottom:14,gap:12}}>
            <div>
              <div className="page-sub" style={{marginBottom:4}}>PRODUCTO CONFIGURADO</div>
              <div style={{fontSize:18,fontWeight:600,letterSpacing:'-0.01em'}}>Mesa de trabajo doble seno · 2.4m</div>
            </div>
            <span className="state" style={{marginLeft:'auto'}}>EN PRODUCCIÓN · NO SE REDISEÑA</span>
          </div>
          <div style={{border:'1px dashed var(--line-strong)',borderRadius:10,padding:32,background:'repeating-linear-gradient(45deg,var(--surface),var(--surface) 6px,var(--surface-2) 6px,var(--surface-2) 7px)',textAlign:'center',color:'var(--text-3)'}}>
            <div style={{fontFamily:'var(--f-mono)',fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}}>ConfiguradorMesa 3D</div>
            <div style={{fontSize:13,maxWidth:360,margin:'0 auto'}}>El canvas 3D + controles de dimensiones, materiales y acabados sigue tal cual está en producción.</div>
            <div style={{marginTop:20,padding:14,border:'1px solid var(--line)',borderRadius:8,background:'var(--surface)',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,textAlign:'left',fontSize:12}}>
              <div><div style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Dimensiones</div><div style={{fontWeight:500,marginTop:3}}>2400 × 700 × 900mm</div></div>
              <div><div style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Material sobre</div><div style={{fontWeight:500,marginTop:3}}>Inox 304 · cal. 1/8"</div></div>
              <div><div style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Entrepaños</div><div style={{fontWeight:500,marginTop:3}}>2 · inox cal. 1/16"</div></div>
            </div>
          </div>
        </div>

        {/* RIGHT - APU Pane */}
        <div style={{border:'1px solid var(--line)',borderRadius:10,background:'var(--surface)',position:'sticky',top:72}}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',gap:8}}>
            <div style={{fontSize:13,fontWeight:600}}>APU · Análisis de precio unitario</div>
            <span className="pill" style={{marginLeft:'auto',fontSize:10}}><span className="dot" style={{background:'var(--pos)'}}/>4 frescos</span>
            <span className="pill" style={{fontSize:10}}><span className="dot" style={{background:'var(--neg)'}}/>1 obsoleto</span>
          </div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr>
                {['Código','Descripción','Cant','Und','P.Unit','Fecha','Prov','Subtotal'].map((h,i) => (
                  <th key={i} style={{padding:'8px 10px',background:'var(--surface-2)',borderBottom:'1px solid var(--line)',fontFamily:'var(--f-mono)',fontSize:9.5,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',textAlign: (h==='Cant'||h==='P.Unit'||h==='Subtotal')?'right':'left',fontWeight:500}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {product.apu.map((r,i) => <APURow key={i} row={r} onCodeClick={setDrawerRow} />)}
            </tbody>
            <tfoot>
              <tr style={{background:'var(--surface-2)'}}>
                <td colSpan={7} style={{padding:'10px 12px',fontFamily:'var(--f-mono)',fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-3)'}}>Costo directo</td>
                <td style={{padding:'10px 12px',textAlign:'right',fontFamily:'var(--f-mono)',fontVariantNumeric:'tabular-nums',fontWeight:700,borderTop:'1px solid var(--text)'}}>{fmt(product.apu.reduce((s,r)=>s+r.subtotal,0))}</td>
              </tr>
              <tr>
                <td colSpan={7} style={{padding:'8px 12px',color:'var(--text-3)',fontSize:11.5}}>+ mano de obra (35%) + margen (22%)</td>
                <td style={{padding:'8px 12px',textAlign:'right',fontFamily:'var(--f-mono)',fontVariantNumeric:'tabular-nums',fontWeight:600}}>{fmt(product.precio)}</td>
              </tr>
            </tfoot>
          </table>
          <div style={{padding:'10px 14px',borderTop:'1px solid var(--line)',display:'flex',gap:6}}>
            <button className="btn sm" onClick={() => setRoute('materiales')}><Icon d={ICONS.mater} /> Material master</button>
            <button className="btn sm"><Icon d={ICONS.history} /> Recalcular</button>
          </div>
        </div>
      </div>

      {drawerRow && <APUDrawer row={drawerRow} onClose={()=>setDrawerRow(null)} />}
    </div>
  );
}

Object.assign(window, { APUPane });
