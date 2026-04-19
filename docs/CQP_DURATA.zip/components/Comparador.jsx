/* Screen 2 — Comparador Multi-Proveedor */
const { useState: useStateCP } = React;

const COMPARADOR_ITEMS = [
  { cod: 'AILAL00104', desc: 'Lámina inox lisa mate cal. 1/4"',    qty: 8,  und: 'UND' },
  { cod: 'AITCR01401', desc: 'Tubo redondo inox 2" cal. 14',        qty: 36, und: 'ML' },
  { cod: 'ACPEL01201', desc: 'Ángulo acero carbono 1" x 1" cal. 16',qty: 48, und: 'ML' },
  { cod: 'TOTMH01014', desc: 'Tornillo métrica M10 x 40mm inox',    qty:200, und: 'UND' },
];

const PROV_COLS = [
  { p: 'IMPORINOX',   q: [ {precio: 812000, lead: 5,  note: '' }, {precio: 91500, lead: 8,  note: '' }, {precio: 13100, lead: 3, note: '' }, {precio: 700, lead: 2, note: '' } ] },
  { p: 'WESCO',       q: [ {precio: 789000, lead: 12, note: 'mínimo 5' }, {precio: 88900, lead: 10, note: '' }, {state: 'agotado'}, {precio: 720, lead: 4, note: '' } ] },
  { p: 'STECKERL',    q: [ {precio: 798000, lead: 18, note: '' }, {precio: 89400, lead: 14, note: '' }, {state: 'na'}, {state: 'na'} ] },
  { p: 'CORTEACEROS', q: [ {state: 'na'}, {precio: 92800, lead: 9, note: 'exige cop. 50%' }, {precio: 12800, lead: 3, note: 'preferido' }, {state: 'na'} ] },
  { p: 'INVERSINOX',  q: [ {state: 'na'}, {precio: 90200, lead: 7, note: '' }, {state: 'na'}, {precio: 680, lead: 3, note: '' } ] },
];

function ProvHeader({ p, winnerCount }) {
  const prov = PROVEEDORES[p];
  return (
    <th style={{minWidth: 180, padding: '10px 12px', textAlign: 'left', background: 'var(--surface-2)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)', verticalAlign: 'top'}}>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
        <span style={{fontFamily:'var(--f-sans)',fontSize:12,fontWeight:600,color:'var(--text)',textTransform:'none',letterSpacing:0}}>{p}</span>
        {prov && prov.rating === 'preferido' && <span style={{fontSize:9,padding:'1px 5px',background:'var(--accent-weak)',color:'var(--accent)',borderRadius:3,letterSpacing:'0.05em',fontFamily:'var(--f-mono)',textTransform:'uppercase'}}>PREF</span>}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8,fontSize:10.5,color:'var(--text-3)',fontFamily:'var(--f-mono)',textTransform:'none',letterSpacing:0}}>
        <span>{prov ? prov.city : ''}</span>
        <span>·</span>
        <ScoreBars s={prov ? prov.scores : [1,1,1]} />
        {winnerCount > 0 && <span style={{marginLeft:'auto',color:'var(--accent)',fontWeight:600}}>★ {winnerCount}</span>}
      </div>
    </th>
  );
}

function Cell({ cell, isWinner, onClick }) {
  if (!cell || cell.state === 'na') return (
    <td style={{padding:'10px 12px',borderBottom:'1px solid var(--line-2)',borderRight:'1px solid var(--line)',color:'var(--text-4)',fontFamily:'var(--f-mono)',fontSize:11}}>
      N/A
    </td>
  );
  if (cell.state === 'agotado') return (
    <td style={{padding:'10px 12px',borderBottom:'1px solid var(--line-2)',borderRight:'1px solid var(--line)'}}>
      <span className="state state-out">AGOTADO</span>
    </td>
  );
  return (
    <td onClick={onClick} style={{
      padding:'10px 12px',borderBottom:'1px solid var(--line-2)',borderRight:'1px solid var(--line)',
      background: isWinner ? 'var(--accent-weak)' : 'transparent',
      borderLeft: isWinner ? '2px solid var(--accent)' : 'none',
      cursor:'pointer'
    }}>
      <div style={{display:'flex',alignItems:'baseline',gap:8}}>
        <span className="mono tnum" style={{fontSize:13,fontWeight: isWinner ? 700 : 600, color: 'var(--text)'}}>{fmt(cell.precio)}</span>
        {isWinner && <span style={{fontSize:9,color:'var(--accent)',fontFamily:'var(--f-mono)',textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:600}}>★ Gana</span>}
      </div>
      <div style={{fontSize:11,color:'var(--text-3)',fontFamily:'var(--f-mono)',marginTop:2,display:'flex',gap:8}}>
        <span>⏱ {cell.lead}d</span>
        {cell.note && <span style={{color:'var(--text-2)',fontStyle:'italic'}}>· {cell.note}</span>}
      </div>
    </td>
  );
}

function scoreCell(cell, minPrice, minLead, wPrice, wLead) {
  if (!cell || cell.state) return -Infinity;
  const pScore = minPrice / cell.precio; // lower price -> higher score, max 1.0
  const lScore = minLead / cell.lead;
  return pScore * wPrice + lScore * wLead;
}

function Comparador({ setRoute, pushToast }) {
  const [selected, setSelected] = useStateCP(0);
  const [wPrice, setWPrice] = useStateCP(0.7);

  const wLead = 1 - wPrice;

  // Determine winner per row
  const winners = COMPARADOR_ITEMS.map((_, rowIdx) => {
    const cells = PROV_COLS.map(c => c.q[rowIdx]);
    const prices = cells.filter(c => c && !c.state).map(c => c.precio);
    const leads  = cells.filter(c => c && !c.state).map(c => c.lead);
    if (!prices.length) return -1;
    const minP = Math.min(...prices), minL = Math.min(...leads);
    let best = -1, bestScore = -Infinity;
    cells.forEach((c, i) => {
      const s = scoreCell(c, minP, minL, wPrice, wLead);
      if (s > bestScore) { bestScore = s; best = i; }
    });
    return best;
  });

  const winnerCount = PROV_COLS.map((_, i) => winners.filter(w => w === i).length);

  return (
    <div>
      <Topbar crumbs={['Compras', 'Comparador multi-proveedor', 'Solicitud SM-0412']} actions={
        <>
          <button className="btn"><Icon d={ICONS.paperclip} /> Adjuntar cotización</button>
          <button className="btn"><Icon d={ICONS.save} /> Guardar</button>
          <button className="btn primary" onClick={() => { setRoute('ordenes/OC-2026-0342'); pushToast && pushToast('OC creada con proveedor ganador'); }}>
            Generar OC <Icon d={ICONS.chevRight} />
          </button>
        </>
      } />

      {/* Context header */}
      <div style={{padding: '20px 24px 0', borderBottom: '1px solid var(--line)', background: 'var(--surface)'}}>
        <div style={{display:'flex',alignItems:'flex-end',gap:24,paddingBottom:16}}>
          <div>
            <div style={{fontFamily:'var(--f-mono)',fontSize:10.5,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>Solicitud</div>
            <div style={{fontSize:20,fontWeight:600,letterSpacing:'-0.02em'}}>SM-0412 · Hospital San Vicente — Cocina central</div>
            <div style={{fontSize:12.5,color:'var(--text-3)',marginTop:4}}>Solicitante: <span style={{color:'var(--text-2)'}}>M. Ruiz (residente)</span> · Urgencia: <span style={{color:'var(--warn)',fontWeight:500}}>Alta</span> · 4 materiales · creada hace 2d</div>
          </div>
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:14,padding:'8px 14px',border:'1px solid var(--line)',borderRadius:8,background:'var(--surface-2)'}}>
            <span style={{fontFamily:'var(--f-mono)',fontSize:10.5,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Ponderación</span>
            <label style={{display:'flex',alignItems:'center',gap:6,fontSize:12}}>
              <span>Precio</span>
              <input type="range" min="0" max="1" step="0.1" value={wPrice} onChange={e => setWPrice(parseFloat(e.target.value))} style={{width:100}} />
              <span className="mono tnum" style={{fontWeight:600,minWidth:32}}>{(wPrice*100).toFixed(0)}%</span>
            </label>
            <span style={{color:'var(--text-3)'}}>·</span>
            <span style={{fontSize:12}}>Tiempo <span className="mono tnum" style={{fontWeight:600}}>{(wLead*100).toFixed(0)}%</span></span>
          </div>
        </div>
      </div>

      {/* Spreadsheet */}
      <div style={{padding: 24, overflow: 'auto'}}>
        <div style={{border:'1px solid var(--line)',borderRadius:10,background:'var(--surface)',overflow:'hidden'}}>
          <div style={{overflow: 'auto'}}>
            <table style={{borderCollapse:'collapse',width:'100%',minWidth: 1100}}>
              <thead>
                <tr>
                  <th style={{position:'sticky',left:0,background:'var(--surface-2)',padding:'10px 14px',textAlign:'left',borderBottom:'1px solid var(--line)',borderRight:'1px solid var(--line)',minWidth: 340, zIndex: 2,fontFamily:'var(--f-mono)',fontSize:10.5,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:500}}>Material</th>
                  <th style={{padding:'10px 14px',background:'var(--surface-2)',borderBottom:'1px solid var(--line)',borderRight:'1px solid var(--line)',fontFamily:'var(--f-mono)',fontSize:10.5,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',textAlign:'left',fontWeight:500,minWidth: 70}}>Cant.</th>
                  {PROV_COLS.map((pc, i) => <ProvHeader key={i} p={pc.p} winnerCount={winnerCount[i]} />)}
                  <th style={{padding:'10px 14px',background:'var(--surface-2)',textAlign:'center',color:'var(--text-3)',fontFamily:'var(--f-mono)',fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.06em',borderBottom:'1px solid var(--line)',fontWeight:500}}><Icon d={ICONS.plus} /></th>
                </tr>
              </thead>
              <tbody>
                {COMPARADOR_ITEMS.map((it, rowIdx) => (
                  <tr key={rowIdx} onClick={() => setSelected(rowIdx)} style={{background: selected === rowIdx ? 'rgba(10,10,10,0.015)' : 'transparent', cursor:'pointer'}}>
                    <td style={{position:'sticky',left:0,background: selected === rowIdx ? '#f7f6f3' : 'var(--surface)',padding:'12px 14px',borderBottom:'1px solid var(--line-2)',borderRight:'1px solid var(--line)',zIndex:1}}>
                      <div className="mono tnum" style={{fontSize:11.5,color:'var(--text-3)',letterSpacing:'0.01em'}}>{it.cod}</div>
                      <div style={{fontSize:12.5,color:'var(--text)',fontWeight:500,marginTop:2}}>{it.desc}</div>
                    </td>
                    <td style={{padding:'12px 14px',borderBottom:'1px solid var(--line-2)',borderRight:'1px solid var(--line)'}}>
                      <span className="mono tnum" style={{fontWeight:600}}>{it.qty}</span> <span className="mono" style={{fontSize:11,color:'var(--text-3)'}}>{it.und}</span>
                    </td>
                    {PROV_COLS.map((pc, colIdx) => (
                      <Cell key={colIdx} cell={pc.q[rowIdx]} isWinner={winners[rowIdx] === colIdx} />
                    ))}
                    <td style={{padding:'10px 14px',borderBottom:'1px solid var(--line-2)',textAlign:'center',color:'var(--text-4)'}}>—</td>
                  </tr>
                ))}
                <tr style={{background: 'var(--surface-2)'}}>
                  <td style={{position:'sticky',left:0,background:'var(--surface-2)',padding:'12px 14px',borderRight:'1px solid var(--line)',zIndex:1,fontFamily:'var(--f-mono)',fontSize:10.5,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Total ponderado</td>
                  <td style={{padding:'12px 14px',borderRight:'1px solid var(--line)'}}></td>
                  {PROV_COLS.map((pc, colIdx) => {
                    const total = pc.q.reduce((sum, c, rowIdx) => {
                      if (!c || c.state) return sum;
                      return sum + c.precio * COMPARADOR_ITEMS[rowIdx].qty;
                    }, 0);
                    const avgLead = pc.q.filter(c => c && !c.state).reduce((s, c) => s + c.lead, 0) / (pc.q.filter(c => c && !c.state).length || 1);
                    const isWinner = winnerCount[colIdx] === Math.max(...winnerCount);
                    return (
                      <td key={colIdx} style={{padding:'12px 14px',borderRight:'1px solid var(--line)', background: isWinner ? 'var(--accent-weak)' : 'transparent'}}>
                        <div className="mono tnum" style={{fontWeight:700,fontSize:13}}>{fmtShort(total)}</div>
                        <div style={{fontSize:11,color:'var(--text-3)',fontFamily:'var(--f-mono)',marginTop:2}}>avg ⏱ {avgLead.toFixed(0)}d</div>
                      </td>
                    );
                  })}
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer — winner summary */}
          <div style={{padding:'14px 18px',borderTop:'1px solid var(--line)',background:'var(--surface-2)',display:'flex',alignItems:'center',gap:14}}>
            <Icon d={ICONS.sparkles} />
            <div>
              <div style={{fontSize:12.5,fontWeight:600}}>Recomendación · split entre 2 proveedores</div>
              <div style={{fontSize:11.5,color:'var(--text-3)',marginTop:2}}>
                <span style={{fontWeight:500,color:'var(--text-2)'}}>IMPORINOX</span> (3 ítems, $7.58M) +{' '}
                <span style={{fontWeight:500,color:'var(--text-2)'}}>CORTEACEROS</span> (1 ítem ángulos, $614k) ·
                ahorro $285k vs. proveedor único · lead time promedio 6.2d
              </div>
            </div>
            <div style={{marginLeft:'auto',display:'flex',gap:6}}>
              <button className="btn sm">Exportar Excel</button>
              <button className="btn sm primary" onClick={() => { setRoute('ordenes/OC-2026-0342'); pushToast && pushToast('2 OCs creadas en borrador'); }}>Crear 2 OCs</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Comparador });
