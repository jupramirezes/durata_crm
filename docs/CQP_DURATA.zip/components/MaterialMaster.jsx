/* Screen 1 — Material Master */
const { useState: useStateMM } = React;

function Sparkline({ values, width = 80, height = 22, color = 'var(--text)' }) {
  if (!values || values.length < 2) return <svg width={width} height={height}></svg>;
  const min = Math.min(...values), max = Math.max(...values);
  const pad = 2;
  const pts = values.map((v, i) => {
    const x = pad + (i/(values.length-1)) * (width - 2*pad);
    const y = height - pad - ((v - min)/(max - min || 1)) * (height - 2*pad);
    return [x, y];
  });
  const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = path + ` L ${pts[pts.length-1][0]} ${height-pad} L ${pts[0][0]} ${height-pad} Z`;
  return (
    <svg width={width} height={height} style={{overflow:'visible'}}>
      <path d={area} fill="var(--accent-weak)" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.25" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length-1 ? 1.8 : 1} fill={color} />)}
    </svg>
  );
}

function StockPill({ stock, qty }) {
  if (stock === 'ok')   return <span className="state state-ok">EN STOCK · {qty}</span>;
  if (stock === 'low')  return <span className="state state-warn">BAJO · {qty}</span>;
  if (stock === 'out')  return <span className="state state-out">AGOTADO</span>;
  return <span className="state state-na">N/A</span>;
}

function FreshBadge({ f, fecha }) {
  if (f === 'none' || !fecha || fecha === '—') return <span className="fresh old"><span className="d" /> sin precio</span>;
  const d = daysAgo(fecha);
  const cls = f === 'ok' ? 'ok' : f === 'mid' ? 'mid' : 'old';
  return <span className={'fresh ' + cls}><span className="d" />{d}d</span>;
}

function ScoreBars({ s }) {
  return (
    <span className="score" title={`Precio ${s[0]}/3 · Tiempo ${s[1]}/3 · Confiabilidad ${s[2]}/3`}>
      {s.map((v, i) => <span key={i} className={v >= 2 ? 'on' : ''} style={{opacity: v >= 2 ? 1 : 0.4}} />)}
    </span>
  );
}

function MaterialRow({ m, expanded, onToggle, setRoute }) {
  const prov = PROVEEDORES[m.prov];
  return (
    <>
      <tr className={expanded ? 'expanded' : ''} onClick={onToggle} style={{cursor:'pointer'}}>
        <td style={{width: 22, paddingRight: 0}}>
          <Icon d={expanded ? ICONS.chevDown : ICONS.chevRight} />
        </td>
        <td className="mono tnum" style={{fontSize: 12, color:'var(--text)', fontWeight: 500, letterSpacing:'0.01em'}}>{m.cod}</td>
        <td style={{fontWeight: 500, maxWidth: 340}}>{m.nombre}</td>
        <td className="mono" style={{color:'var(--text-3)', fontSize: 11.5}}>{m.und}</td>
        <td className="num-cell" style={{fontWeight: 600, color:'var(--text)'}}>{fmt(m.precio)}</td>
        <td><FreshBadge f={m.freshness} fecha={m.fecha} /></td>
        <td style={{fontSize: 12}}>
          {m.prov === '—' ? <span style={{color:'var(--text-4)'}}>—</span> :
            <span style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontWeight: 500}}>{m.prov}</span>
              {prov && prov.rating === 'preferido' && <span style={{fontSize:9,padding:'1px 5px',background:'var(--accent-weak)',color:'var(--accent)',borderRadius:3,letterSpacing:'0.05em',fontFamily:'var(--f-mono)',textTransform:'uppercase'}}>PREF</span>}
            </span>
          }
        </td>
        <td><StockPill stock={m.stock} qty={m.stockQty} /></td>
      </tr>
      {expanded && (
        <tr className="expanded">
          <td colSpan={8} style={{padding: 0, background: 'var(--surface-2)'}}>
            <div style={{display:'grid', gridTemplateColumns: '1.2fr 1fr', gap: 0}}>
              <div style={{padding: '18px 22px', borderRight: '1px solid var(--line)'}}>
                <div style={{fontFamily:'var(--f-mono)',fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-3)',marginBottom:10}}>Histórico de precio · últimas 6 cotizaciones</div>
                <div style={{display:'flex',alignItems:'flex-end',gap:20}}>
                  <Sparkline values={PRICE_HIST.map(h => h.precio)} width={220} height={56} />
                  <div style={{flex:1}}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',fontSize:11,color:'var(--text-3)',fontFamily:'var(--f-mono)',gap:4}}>
                      {PRICE_HIST.map((h, i) => (
                        <div key={i} style={{textAlign:'center'}}>
                          <div style={{fontSize:10,color:'var(--text-4)'}}>{h.fecha}</div>
                          <div style={{color: i === PRICE_HIST.length-1 ? 'var(--text)':'var(--text-3)', fontWeight: i === PRICE_HIST.length-1 ? 600 : 400}}>{fmtShort(h.precio)}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{marginTop:10,fontSize:11.5,color:'var(--text-3)'}}>
                      <span style={{color:'var(--pos)',fontWeight:500}}>+8.9%</span> vs. hace 6 meses · σ = 2.4%
                    </div>
                  </div>
                </div>
              </div>
              <div style={{padding: '18px 22px'}}>
                <div style={{fontFamily:'var(--f-mono)',fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-3)',marginBottom:10}}>Proveedores que lo han ofrecido</div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {[
                    { p: 'IMPORINOX',   last: '$485.000', date: '2026-04-02', scores: [3,3,2], pref: true },
                    { p: 'WESCO',       last: '$492.000', date: '2026-01-12', scores: [2,2,3], pref: false },
                    { p: 'STECKERL',    last: '$498.000', date: '2025-11-08', scores: [3,1,3], pref: false },
                  ].map((row, i) => (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 10px',background:'var(--surface)',border:'1px solid var(--line)',borderRadius:6,fontSize:12}}>
                      <span style={{fontWeight:500,flex:1}}>{row.p}</span>
                      {row.pref && <span style={{fontSize:9,padding:'1px 5px',background:'var(--accent-weak)',color:'var(--accent)',borderRadius:3,letterSpacing:'0.05em',fontFamily:'var(--f-mono)',textTransform:'uppercase'}}>PREF</span>}
                      <ScoreBars s={row.scores} />
                      <span className="mono" style={{color:'var(--text-3)',fontSize:11}}>{row.date}</span>
                      <span className="mono tnum" style={{fontWeight:600}}>{row.last}</span>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:12,display:'flex',gap:6}}>
                  <button className="btn sm" onClick={(e) => { e.stopPropagation(); setRoute('comparador'); }}>
                    <Icon d={ICONS.comparador} /> Cotizar con proveedores
                  </button>
                  <button className="btn sm ghost"><Icon d={ICONS.history} /> Ver histórico completo</button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function MaterialMaster({ setRoute }) {
  const [grupo, setGrupo] = useStateMM('all');
  const [expanded, setExpanded] = useStateMM('AILAL00102');
  const [query, setQuery] = useStateMM('');

  const rows = MATERIALES.filter(m => {
    if (grupo !== 'all' && m.grupo !== grupo) return false;
    if (query && !(m.nombre.toLowerCase().includes(query.toLowerCase()) || m.cod.toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  });

  return (
    <div>
      <Topbar crumbs={['Compras', 'Material master']} actions={
        <>
          <button className="btn"><Icon d={ICONS.external} /> Exportar</button>
          <button className="btn primary"><Icon d={ICONS.plus} /> Nuevo material</button>
        </>
      } />

      <div style={{padding: '24px 24px 0'}}>
        <div className="page-head">
          <div>
            <div className="page-title">Material master</div>
            <div className="page-sub">1,550 códigos · GRUPO + LÍNEA + REF1 + REF2 + REF3 · 10 caracteres</div>
          </div>
          <div style={{marginLeft:'auto',display:'flex',gap:20}}>
            <div><div style={{fontFamily:'var(--f-mono)',fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-3)'}}>Con precio fresco</div><div style={{fontSize:20,fontWeight:600,letterSpacing:'-0.02em'}}>1,287 <span style={{fontSize:12,color:'var(--text-3)',fontWeight:400}}>· 83%</span></div></div>
            <div><div style={{fontFamily:'var(--f-mono)',fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-3)'}}>Por recotizar</div><div style={{fontSize:20,fontWeight:600,letterSpacing:'-0.02em',color:'var(--warn)'}}>218</div></div>
            <div><div style={{fontFamily:'var(--f-mono)',fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-3)'}}>Sin precio</div><div style={{fontSize:20,fontWeight:600,letterSpacing:'-0.02em',color:'var(--neg)'}}>45</div></div>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search" style={{minWidth: 320}}>
          <Icon d={ICONS.search} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por código o nombre…" />
        </div>
        <div style={{display:'flex',gap:4}}>
          <button className={'chip' + (grupo === 'all' ? ' on' : '')} onClick={() => setGrupo('all')}>Todos</button>
          {GRUPOS.slice(0,6).map(g => (
            <button key={g.c} className={'chip' + (grupo === g.c ? ' on' : '')} onClick={() => setGrupo(g.c)}>
              <span className="mono" style={{opacity: grupo === g.c ? 0.8 : 0.55}}>{g.c}</span> {g.n}
              <span className="mono" style={{opacity: 0.55, marginLeft: 2}}>{g.count}</span>
            </button>
          ))}
          <button className="chip"><Icon d={ICONS.filter} /> Más filtros</button>
        </div>
        <div style={{marginLeft:'auto',fontSize:11.5,color:'var(--text-3)',fontFamily:'var(--f-mono)'}}>
          {rows.length} de {MATERIALES.length} · ordenar por precio
        </div>
      </div>

      <div style={{padding: '0 24px 40px'}}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{width: 22}}></th>
              <th>CÓDIGO</th>
              <th>NOMBRE</th>
              <th>UND</th>
              <th>PRECIO VIGENTE</th>
              <th>FRESCURA</th>
              <th>PROVEEDOR PREF.</th>
              <th>STOCK</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(m => (
              <MaterialRow key={m.cod} m={m} expanded={expanded === m.cod}
                onToggle={() => setExpanded(expanded === m.cod ? null : m.cod)}
                setRoute={setRoute} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { MaterialMaster, Sparkline, StockPill, FreshBadge, ScoreBars });
