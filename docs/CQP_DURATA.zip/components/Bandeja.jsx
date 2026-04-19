/* Screen 4 — Bandeja de Compras (Oscar) */
const { useState: useStateBA } = React;

const ESTADOS = [
  { k: 'por_cotizar', n: 'Por cotizar',  color: 'var(--s-lead)'    },
  { k: 'cotizando',   n: 'Cotizando',    color: 'var(--s-cotiz)'   },
  { k: 'oc_emitida',  n: 'OC emitida',   color: 'var(--s-enviada)' },
  { k: 'recibido',    n: 'Recibido',     color: 'var(--pos)'       },
];

function UrgencyDot({ u }) {
  const color = u === 'alta' ? 'var(--neg)' : u === 'media' ? 'var(--warn)' : 'var(--text-4)';
  return <span style={{width:6,height:6,borderRadius:3,background:color,display:'inline-block'}} />;
}

function BandejaCard({ s, onClick }) {
  return (
    <div className="opp-card" onClick={onClick} style={{background:'var(--surface)',border:'1px solid var(--line)',borderRadius:8,padding:'10px 12px',cursor:'pointer',marginBottom:6}}>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
        <UrgencyDot u={s.urgencia} />
        <span className="mono" style={{fontSize:10.5,color:'var(--text-4)'}}>{s.id}</span>
        <span style={{marginLeft:'auto',fontFamily:'var(--f-mono)',fontSize:10,color:'var(--text-3)'}}>hace {daysAgo(s.fecha)}d</span>
      </div>
      <div style={{fontSize:12.5,fontWeight:600,letterSpacing:'-0.005em',lineHeight:1.3,marginBottom:3}}>{s.nombre}</div>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
        {s.cod !== '—'
          ? <span className="mono" style={{fontSize:10.5,color:'var(--text-3)'}}>{s.cod}</span>
          : <span style={{fontSize:10,padding:'1px 5px',background:'var(--warn-weak)',color:'#8a5a00',border:'1px solid var(--warn-line)',borderRadius:3,fontFamily:'var(--f-mono)',letterSpacing:'0.04em',textTransform:'uppercase'}}>SIN CÓDIGO</span>
        }
        <span style={{marginLeft:'auto',fontFamily:'var(--f-mono)',fontSize:11,fontWeight:600}}>{s.qty} <span style={{color:'var(--text-3)'}}>{s.und}</span></span>
      </div>
      <div style={{fontSize:11,color:'var(--text-3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:6}}>{s.proyecto}</div>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        <div className="avatar xs">{s.residente.split(' ').map(x=>x[0]).join('')}</div>
        <span style={{fontSize:11,color:'var(--text-3)'}}>{s.residente}</span>
        <span style={{marginLeft:'auto'}}>
          {s.hasPrice
            ? <span className="fresh ok" style={{padding:'1px 5px'}}><span className="d"/>precio</span>
            : <span className="fresh old" style={{padding:'1px 5px'}}><span className="d"/>sin precio</span>
          }
        </span>
      </div>
      {s.oc && <div style={{marginTop:6,paddingTop:6,borderTop:'1px solid var(--line-2)',fontFamily:'var(--f-mono)',fontSize:10.5,color:'var(--accent)'}}>→ {s.oc}</div>}
    </div>
  );
}

function Bandeja({ setRoute }) {
  const [view, setView] = useStateBA('kanban');

  return (
    <div>
      <Topbar crumbs={['Compras', 'Bandeja']} actions={
        <>
          <div style={{display:'flex',background:'var(--surface-2)',border:'1px solid var(--line)',borderRadius:8,padding:2,gap:2}}>
            <button onClick={()=>setView('kanban')} className={view==='kanban'?'btn sm primary':'btn sm ghost'} style={{height:22,border:0}}>Kanban</button>
            <button onClick={()=>setView('tabla')} className={view==='tabla'?'btn sm primary':'btn sm ghost'} style={{height:22,border:0}}>Tabla</button>
          </div>
          <button className="btn primary"><Icon d={ICONS.plus} /> Solicitud</button>
        </>
      } />

      <div style={{padding:'24px 24px 0'}}>
        <div className="page-head">
          <div>
            <div className="page-title">Bandeja de compras</div>
            <div className="page-sub">17 solicitudes · 4 urgentes · {SOLICITUDES.filter(s => !s.hasPrice).length} sin precio vigente</div>
          </div>
          <div style={{marginLeft:'auto',display:'flex',gap:10,alignItems:'center'}}>
            <div className="search" style={{minWidth:220,height:30}}>
              <Icon d={ICONS.search} />
              <input placeholder="Buscar…" />
            </div>
            <button className="chip"><Icon d={ICONS.filter} /> Urgencia alta</button>
            <button className="chip">Solo sin precio</button>
          </div>
        </div>
      </div>

      {view === 'kanban' && (
        <div style={{padding:'8px 16px 24px',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
          {ESTADOS.map(e => {
            const cards = SOLICITUDES.filter(s => s.estado === e.k);
            return (
              <div key={e.k} style={{background:'var(--surface-2)',border:'1px solid var(--line)',borderRadius:10,padding:10,minHeight:600}}>
                <div style={{display:'flex',alignItems:'center',gap:8,padding:'4px 6px 10px'}}>
                  <span style={{width:8,height:8,borderRadius:4,background:e.color}} />
                  <span style={{fontSize:12.5,fontWeight:600}}>{e.n}</span>
                  <span style={{marginLeft:'auto',fontFamily:'var(--f-mono)',fontSize:11,color:'var(--text-3)',background:'var(--surface)',padding:'1px 6px',borderRadius:10}}>{cards.length}</span>
                </div>
                {cards.map(s => (
                  <BandejaCard key={s.id} s={s} onClick={() => {
                    if (s.estado === 'por_cotizar') setRoute('comparador');
                    else if (s.oc) setRoute('ordenes/' + s.oc);
                  }} />
                ))}
                {cards.length === 0 && <div style={{padding:20,textAlign:'center',fontSize:11,color:'var(--text-4)',fontFamily:'var(--f-mono)'}}>Sin items</div>}
              </div>
            );
          })}
        </div>
      )}

      {view === 'tabla' && (
        <div style={{padding: '0 24px 40px'}}>
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th><th>MATERIAL</th><th>CÓDIGO</th><th>CANT.</th><th>RESIDENTE</th><th>PROYECTO</th><th>URGENCIA</th><th>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {SOLICITUDES.map(s => (
                <tr key={s.id} onClick={() => setRoute('comparador')} style={{cursor:'pointer'}}>
                  <td className="mono" style={{fontSize:11,color:'var(--text-3)'}}>{s.id}</td>
                  <td style={{fontWeight:500}}>{s.nombre}</td>
                  <td className="mono" style={{fontSize:11.5}}>{s.cod}</td>
                  <td className="num-cell">{s.qty} <span style={{color:'var(--text-3)',fontSize:11}}>{s.und}</span></td>
                  <td>{s.residente}</td>
                  <td style={{fontSize:12,color:'var(--text-2)',maxWidth:240,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.proyecto}</td>
                  <td><UrgencyDot u={s.urgencia} /> <span style={{marginLeft:6,textTransform:'capitalize'}}>{s.urgencia}</span></td>
                  <td>{(() => { const e = ESTADOS.find(x => x.k === s.estado); return <span className="state" style={{borderColor:e.color,color:e.color}}>{e.n}</span>; })()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Bandeja });
