// Empresas, Cotizaciones, Precios, Configurador, Configuración

function EmpresasView({ setRoute }) {
  const [q, setQ] = React.useState('');
  const rows = EMPRESAS_LIST.filter(e => !q || e.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="list-page">
      <div className="list-head">
        <div style={{display:'flex', alignItems:'flex-end'}}>
          <div>
            <div style={{fontSize:22, fontWeight:600, letterSpacing:'-0.02em'}}>Empresas</div>
            <div className="mono muted" style={{fontSize:12, marginTop:2}}>{EMPRESAS_LIST.length} empresas · {EMPRESAS_LIST.reduce((a,b)=>a+b.opps,0)} oportunidades históricas</div>
          </div>
          <div style={{flex:1}}/>
          <button className="btn sm primary"><I.plus/> Nueva empresa</button>
        </div>
      </div>
      <div className="list-toolbar">
        <div className="search" style={{flex:'0 0 280px', height:28, background:'var(--surface)'}}>
          <I.search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar empresa, NIT, contacto…" style={{border:0, outline:'none', background:'transparent', flex:1, fontSize:12.5}}/>
        </div>
        <button className="chip">Sector <I.chevDown/></button>
        <button className="chip">Ciudad <I.chevDown/></button>
        <button className="chip">Con oportunidades activas <I.chevDown/></button>
        <div style={{flex:1}}/>
        <button className="btn sm ghost"><I.download/> Exportar</button>
      </div>
      <div className="list-scroll">
        <table className="list-tbl">
          <thead>
            <tr>
              <th style={{width:'26%'}}>Empresa</th>
              <th>Sector</th>
              <th>Ciudad</th>
              <th>Contacto principal</th>
              <th className="num">Oport.</th>
              <th className="num">Adj.</th>
              <th className="num">Histórico</th>
              <th className="num">Últ. contacto</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(e => (
              <tr key={e.id}>
                <td>
                  <div className="primary-cell">{e.name}</div>
                  <div className="sub-cell mono">NIT {e.nit}</div>
                </td>
                <td>{e.sector}</td>
                <td>{e.city}</td>
                <td>
                  <div>{e.contact}</div>
                  <div className="sub-cell">{e.contacts} contactos</div>
                </td>
                <td className="num">{e.opps}</td>
                <td className="num">
                  <span style={{color: e.adj > 0 ? 'var(--pos)' : 'var(--text-3)'}}>{e.adj}</span>
                </td>
                <td className="num">{formatCOP(e.total, {short:true})}</td>
                <td className="num">
                  <span style={{color: parseInt(e.last) > 60 ? 'var(--neg)' : parseInt(e.last) > 14 ? 'var(--warn)' : 'var(--text-3)'}}>{e.last}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CotizacionesView({ setRoute }) {
  return (
    <div className="list-page">
      <div className="list-head">
        <div style={{display:'flex', alignItems:'flex-end'}}>
          <div>
            <div style={{fontSize:22, fontWeight:600, letterSpacing:'-0.02em'}}>Cotizaciones</div>
            <div className="mono muted" style={{fontSize:12, marginTop:2}}>{COTS_LIST.length} de 1,412 · filtradas por los últimos 60 días</div>
          </div>
          <div style={{flex:1}}/>
          <button className="btn sm"><I.download/> Exportar CSV</button>
          <button className="btn sm primary"><I.plus/> Nueva cotización</button>
        </div>
      </div>
      <div className="list-toolbar">
        <button className="chip on">Todos ({COTS_LIST.length})</button>
        <button className="chip">Borrador ({COTS_LIST.filter(c=>c.state==='borrador').length})</button>
        <button className="chip">Enviadas ({COTS_LIST.filter(c=>c.state==='enviada').length})</button>
        <button className="chip">Aprobadas ({COTS_LIST.filter(c=>c.state==='aprobada').length})</button>
        <button className="chip">Rechazadas ({COTS_LIST.filter(c=>c.state==='rechazada').length})</button>
        <div style={{width:1, height:20, background:'var(--line)', margin:'0 4px'}}/>
        <button className="chip">Cotizador <I.chevDown/></button>
        <button className="chip">Mes <I.chevDown/></button>
        <div style={{flex:1}}/>
        <div className="search" style={{flex:'0 0 260px', height:28, background:'var(--surface)'}}>
          <I.search/><span>Buscar por # o empresa…</span>
        </div>
      </div>
      <div className="list-scroll">
        <table className="list-tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Empresa · Contacto</th>
              <th>Estado</th>
              <th>Cotizador</th>
              <th className="num">Productos</th>
              <th className="num">Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {COTS_LIST.map(c => (
              <tr key={c.num} style={{cursor:'pointer'}} onClick={()=>setRoute('detail')}>
                <td className="mono primary-cell">{c.num}</td>
                <td className="mono muted">{c.date}</td>
                <td>
                  <div className="primary-cell">{c.company}</div>
                  <div className="sub-cell">{c.contact}</div>
                </td>
                <td><span className={"state state-" + c.state}>{c.state}</span></td>
                <td><CotAvatar id={c.cot} size="xs"/> <span style={{marginLeft:6, fontSize:12}}>{(COTIZADORES.find(x=>x.id===c.cot)||{}).ini}</span></td>
                <td className="num">{c.items || '—'}</td>
                <td className="num strong">{c.total ? formatCOP(c.total, {short:true}) : '—'}</td>
                <td style={{width:40}}><button className="btn ghost icon sm" onClick={(e)=>e.stopPropagation()}><I.more/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PreciosView() {
  const [grupo, setGrupo] = React.useState('todos');
  const grupos = Array.from(new Set(PRECIOS.map(p => p.grupo)));
  const rows = PRECIOS.filter(p => grupo === 'todos' || p.grupo === grupo);
  return (
    <div className="list-page">
      <div className="list-head">
        <div style={{display:'flex', alignItems:'flex-end'}}>
          <div>
            <div style={{fontSize:22, fontWeight:600, letterSpacing:'-0.02em'}}>Precios maestros</div>
            <div className="mono muted" style={{fontSize:12, marginTop:2}}>{PRECIOS.length} ítems · última actualización 14/04/2026</div>
          </div>
          <div style={{flex:1}}/>
          <button className="btn sm"><I.download/> Descargar plantilla</button>
          <button className="btn sm"><I.paperclip/> Importar Excel</button>
          <button className="btn sm primary"><I.plus/> Nuevo ítem</button>
        </div>
      </div>
      <div className="list-toolbar">
        <button className={"chip " + (grupo==='todos'?'on':'')} onClick={()=>setGrupo('todos')}>Todos</button>
        {grupos.map(g => <button key={g} className={"chip " + (grupo===g?'on':'')} onClick={()=>setGrupo(g)}>{g}</button>)}
        <div style={{flex:1}}/>
        <div className="search" style={{flex:'0 0 260px', height:28, background:'var(--surface)'}}>
          <I.search/><span>Buscar por código o nombre…</span>
        </div>
      </div>
      <div className="list-scroll">
        <table className="list-tbl">
          <thead>
            <tr>
              <th style={{width:'18%'}}>Código</th>
              <th>Nombre</th>
              <th>Grupo</th>
              <th>Unidad</th>
              <th>Proveedor</th>
              <th className="num">Precio</th>
              <th className="num">Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p,i) => (
              <tr key={i}>
                <td className="mono" style={{color:'var(--text-2)', fontSize:11.5}}>{p.codigo}</td>
                <td className="primary-cell">{p.nombre}</td>
                <td><span className="stage-pill"><span className="stage-dot" style={{background:'var(--text-3)'}}></span>{p.grupo}</span></td>
                <td className="mono muted">{p.unidad}</td>
                <td>{p.prov}</td>
                <td className="num strong">{formatCOP(p.precio)}</td>
                <td className="num muted mono">{p.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── PRODUCT CONFIGURATOR (CPQ core) ────────────── */
function ConfiguradorView({ setRoute }) {
  const [dims, setDims] = React.useState({ largo: 1.0, ancho: 0.25, alto: 0.10 });
  const [cuerpo, setCuerpo] = React.useState('18');
  const [tapa, setTapa] = React.useState('12');
  const [desague, setDesague] = React.useState(0.2);
  const [extras, setExtras] = React.useState({ instalacion: false, poliza: false });
  const [margen, setMargen] = React.useState(38);
  const [qty, setQty] = React.useState(1);

  // APU lines (realistic, derived from dims)
  const area = dims.largo * dims.ancho;
  const areaWTapa = dims.largo * (dims.ancho + 0.05);
  const lines = [
    { s: 'insumos',    d: true, label: 'Insumos' },
    { s: 'insumos',    n: 'Acero cuerpo cal.' + cuerpo, q: +(area * 1.3).toFixed(4), u: 98964 },
    { s: 'insumos',    n: 'Acero tapa cal.' + tapa,     q: +(areaWTapa * 1.2).toFixed(4), u: 213247 },
    { s: 'insumos',    n: 'Tubo 2" desagüe',            q: desague,                      u: 23693 },
    { s: 'insumos',    n: 'Granada láminas cal.20',    q: 0.0239,                        u: 74442 },
    { s: 'insumos',    n: 'Argón',                     q: 1,                             u: 8000 },
    { s: 'abrasivos',  d: true, label: 'Abrasivos' },
    { s: 'abrasivos',  n: 'Disco corte',               q: 0.3333,                        u: 1483 },
    { s: 'abrasivos',  n: 'Disco flap',                q: 0.1666,                        u: 21073 },
    { s: 'abrasivos',  n: 'Paño Scotch-Brite',         q: 0.3333,                        u: 5644 },
    { s: 'abrasivos',  n: 'Lija (rollo)',              q: 0.25,                          u: 2777 },
    { s: 'abrasivos',  n: 'Grata',                     q: 0.04,                          u: 5443 },
    { s: 'mo',         d: true, label: 'Mano de obra & servicios' },
    { s: 'mo',         n: 'Empaque',                   q: 1,                             u: 1500 },
    { s: 'mo',         n: 'Soldadura TIG',             q: 2.5,                           u: 32000 },
    { s: 'mo',         n: 'Corte láser',               q: dims.largo * 2,                u: 12500 },
  ];
  const items = lines.filter(l => !l.d);
  const costo = items.reduce((a,l) => a + l.q * l.u, 0);
  const precio = Math.round(costo / (1 - margen/100));

  return (
    <div className="cfg-shell">
      <div className="cfg-main">
        <button className="btn ghost sm" onClick={() => setRoute('detail')} style={{marginBottom:16, padding:'0 8px'}}>
          <I.arrowLeft/> Volver a oportunidad
        </button>

        <div style={{display:'flex', alignItems:'flex-end', marginBottom: 20}}>
          <div>
            <div className="mono muted" style={{fontSize:11, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4}}>Configurar producto</div>
            <div style={{fontSize:24, fontWeight:600, letterSpacing:'-0.02em'}}>Cárcamo industrial</div>
            <div style={{color:'var(--text-3)', fontSize:12.5, marginTop:2}}>Empresa: <strong style={{color:'var(--text)'}}>ENTORNO AZUL</strong> · Oport. 2026-341</div>
          </div>
        </div>

        <div className="cfg-section">
          <div className="cfg-section-hd"><I.box style={{width:14,height:14,color:'var(--text-3)'}}/><span className="t">Dimensiones principales</span></div>
          <div className="cfg-section-body">
            {[['Largo','largo','m'],['Ancho','ancho','m'],['Alto / profundidad','alto','m']].map(([l,k,u])=>(
              <div className="cfg-row" key={k}>
                <span className="cfg-lbl">{l}</span>
                <div className="cfg-input" style={{maxWidth: 160}}>
                  <input type="number" step="0.01" value={dims[k]} onChange={e=>setDims({...dims, [k]: parseFloat(e.target.value||0)})}/>
                  <span className="u">{u}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cfg-section">
          <div className="cfg-section-hd"><I.sliders style={{width:14,height:14,color:'var(--text-3)'}}/><span className="t">Material</span></div>
          <div className="cfg-section-body">
            <div className="cfg-row">
              <span className="cfg-lbl">Calibre cuerpo</span>
              <div className="cfg-selector" style={{maxWidth: 280}}>
                {['14','16','18','20'].map(c => <button key={c} className={cuerpo===c?'on':''} onClick={()=>setCuerpo(c)}>cal.{c}</button>)}
              </div>
            </div>
            <div className="cfg-row">
              <span className="cfg-lbl">Calibre tapa</span>
              <div className="cfg-selector" style={{maxWidth: 280}}>
                {['10','12','14','16'].map(c => <button key={c} className={tapa===c?'on':''} onClick={()=>setTapa(c)}>cal.{c}</button>)}
              </div>
            </div>
            <div className="cfg-row">
              <span className="cfg-lbl">Acabado</span>
              <div className="cfg-selector" style={{maxWidth: 320}}>
                {['Mate','Satinado','Brillante'].map(c => <button key={c} className={c==='Mate'?'on':''}>{c}</button>)}
              </div>
            </div>
          </div>
        </div>

        <div className="cfg-section">
          <div className="cfg-section-hd"><I.box style={{width:14,height:14,color:'var(--text-3)'}}/><span className="t">Desagüe</span></div>
          <div className="cfg-section-body">
            <div className="cfg-row">
              <span className="cfg-lbl">Largo desagüe</span>
              <div className="cfg-input" style={{maxWidth: 160}}>
                <input type="number" step="0.1" value={desague} onChange={e=>setDesague(parseFloat(e.target.value||0))}/>
                <span className="u">m</span>
              </div>
            </div>
          </div>
        </div>

        <div className="cfg-section">
          <div className="cfg-section-hd"><I.plus style={{width:14,height:14,color:'var(--text-3)'}}/><span className="t">Extras</span></div>
          <div className="cfg-section-body">
            <label className="cfg-check" style={{padding:'6px 0'}} onClick={()=>setExtras({...extras, instalacion: !extras.instalacion})}>
              <span className={"cfg-box " + (extras.instalacion?'on':'')}></span>
              <span>Incluir instalación en obra</span>
              <span className="mono muted" style={{marginLeft:'auto', fontSize:11}}>+ $280.000</span>
            </label>
            <label className="cfg-check" style={{padding:'6px 0'}} onClick={()=>setExtras({...extras, poliza: !extras.poliza})}>
              <span className={"cfg-box " + (extras.poliza?'on':'')}></span>
              <span>Incluir póliza de cumplimiento</span>
              <span className="mono muted" style={{marginLeft:'auto', fontSize:11}}>+ 2.5% del valor</span>
            </label>
          </div>
        </div>

        <div className="cfg-section">
          <div className="cfg-section-hd"><I.note style={{width:14,height:14,color:'var(--text-3)'}}/><span className="t">Descripción comercial</span><span className="n">auto-generada</span></div>
          <div className="cfg-section-body">
            <div style={{padding:12, background:'var(--surface-2)', borderRadius:8, fontSize:12.5, lineHeight:1.55, color:'var(--text-2)', border:'1px solid var(--line)'}}>
              Suministro de cárcamo industrial en acero inoxidable AISI 304 calibre {cuerpo} de {dims.largo.toFixed(2)} m de largo × {dims.ancho.toFixed(2)} m de ancho × {dims.alto.toFixed(2)} m de profundidad, con tapa en lámina cal.{tapa} antideslizante, tubo de desagüe 2 pulg cal.18 de {desague.toFixed(2)} m, pendiente interna para drenaje, bordes redondeados sanitarios, soldaduras TIG con gas argón, acabado pulido sanitario para uso en cocinas industriales y áreas de proceso.{extras.poliza ? ' Incluye póliza de cumplimiento.' : ' Sin póliza.'}
            </div>
          </div>
        </div>
      </div>

      {/* Right pane: price + APU */}
      <div className="cfg-pane">
        <div className="cfg-pane-hd">
          <div className="l">Precio comercial (unitario)</div>
          <div className="v">{formatCOP(precio)}</div>
          <div style={{display:'flex', alignItems:'center', gap:12, marginTop: 10}}>
            <span className="mono muted" style={{fontSize:11}}>Costo: {formatCOP(Math.round(costo))}</span>
            <span className="mono" style={{fontSize:11, color:'var(--pos)'}}>Margen {margen}%</span>
          </div>
          <div style={{marginTop: 14, display:'flex', alignItems:'center', gap: 12}}>
            <span className="mono muted" style={{fontSize:11, flex:'0 0 50px'}}>Margen</span>
            <input type="range" min="0" max="60" value={margen} onChange={e=>setMargen(parseInt(e.target.value))} style={{flex:1}}/>
            <span className="mono" style={{fontSize:12, width:40, textAlign:'right'}}>{margen}%</span>
          </div>
          <div style={{marginTop: 8, display:'flex', alignItems:'center', gap: 12}}>
            <span className="mono muted" style={{fontSize:11, flex:'0 0 50px'}}>Cantidad</span>
            <div className="cfg-input" style={{flex:1}}>
              <button onClick={()=>setQty(Math.max(1,qty-1))} style={{background:'transparent',border:0,fontSize:14}}>–</button>
              <input type="number" value={qty} onChange={e=>setQty(parseInt(e.target.value||1))} style={{textAlign:'center'}}/>
              <button onClick={()=>setQty(qty+1)} style={{background:'transparent',border:0,fontSize:14}}>+</button>
            </div>
            <span className="mono strong" style={{fontSize:12, minWidth: 92, textAlign:'right'}}>= {formatCOP(precio * qty, {short:true})}</span>
          </div>
        </div>

        <div style={{padding:'14px 20px 8px', display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid var(--line)'}}>
          <span className="mono muted" style={{fontSize:10.5, textTransform:'uppercase', letterSpacing:'0.06em'}}>Desglose APU</span>
          <span className="mono muted" style={{fontSize:10.5, marginLeft:'auto'}}>{items.length} líneas</span>
        </div>
        <div style={{flex:1, overflow:'auto'}}>
          <table className="apu-tbl">
            <thead>
              <tr>
                <th>Descripción</th>
                <th className="num">Cant.</th>
                <th className="num">P.Unit</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l,i) => l.d ? (
                <tr key={i} className="section-row">
                  <td colSpan={3}>{l.label}</td>
                  <td className="num">{formatCOP(items.filter(x=>x.s===l.s).reduce((a,x)=>a+x.q*x.u,0), {short:true})}</td>
                </tr>
              ) : (
                <tr key={i}>
                  <td style={{color:'var(--text-2)'}}>{l.n}</td>
                  <td className="num muted">{l.q.toFixed(4)}</td>
                  <td className="num muted">{l.u.toLocaleString('es-CO')}</td>
                  <td className="num">{Math.round(l.q * l.u).toLocaleString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{padding: 16, borderTop:'1px solid var(--line)', display:'flex', gap:8, background:'var(--surface)'}}>
          <button className="btn" style={{flex:1, justifyContent:'center'}}>Cancelar</button>
          <button className="btn accent" style={{flex:2, justifyContent:'center', height: 34}}>Agregar al pedido · {formatCOP(precio * qty, {short:true})}</button>
        </div>
      </div>
    </div>
  );
}

function ProductGalleryView({ setRoute }) {
  const [selected, setSelected] = React.useState('carcamo');
  const cats = Array.from(new Set(PRODUCTS_CATALOG.map(p => p.cat)));
  return (
    <div className="page">
      <button className="btn ghost sm" onClick={() => setRoute('detail')} style={{marginBottom:16, padding:'0 8px'}}>
        <I.arrowLeft/> Volver a oportunidad
      </button>
      <div className="page-head">
        <div>
          <div className="page-title">Seleccionar producto</div>
          <div className="page-sub mono">Oportunidad 2026-341 · ENTORNO AZUL · Paso 1 de 2</div>
        </div>
        <div style={{flex:1}}/>
        <div className="search" style={{flex:'0 0 260px', background:'var(--surface)'}}>
          <I.search/><span>Buscar producto…</span>
        </div>
      </div>

      <div style={{display:'flex', gap:8, marginBottom:20}}>
        <button className="chip on">Todos</button>
        {cats.map(c => <button key={c} className="chip">{c}</button>)}
      </div>

      {cats.map(cat => (
        <div key={cat} style={{marginBottom: 24}}>
          <div className="mono muted" style={{fontSize:10.5, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10}}>{cat}</div>
          <div className="gallery">
            {PRODUCTS_CATALOG.filter(p=>p.cat===cat).map(p=>(
              <div key={p.id} className={"gal-card " + (selected===p.id?'on':'')} onClick={()=>setSelected(p.id)}>
                <div className="gal-thumb">{p.id}.render</div>
                <div className="n">{p.name}</div>
                <div className="c">{p.cat}</div>
                <div style={{fontSize:11.5, color:'var(--text-3)', marginTop:4, lineHeight:1.4}}>{p.desc}</div>
                <div className="p">desde {formatCOP(p.base, {short:true})}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{position:'sticky', bottom:0, background:'var(--surface)', padding:'16px 0', marginTop:24, borderTop:'1px solid var(--line)', display:'flex', alignItems:'center', gap:12}}>
        <span className="mono muted" style={{fontSize:11}}>Seleccionado:</span>
        <span className="strong" style={{fontSize:13}}>{PRODUCTS_CATALOG.find(p=>p.id===selected)?.name}</span>
        <div style={{flex:1}}/>
        <button className="btn">Cancelar</button>
        <button className="btn accent" onClick={() => setRoute('configurador')}>Configurar <I.chevRight/></button>
      </div>
    </div>
  );
}

/* ── NEW OPPORTUNITY MODAL ─────────────────────── */
function NuevaOportunidadModal({ onClose }) {
  const [step, setStep] = React.useState(0);
  const [q, setQ] = React.useState('');
  const [sel, setSel] = React.useState(null);
  const empresas = EMPRESAS_LIST.slice(0,6);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e=>e.stopPropagation()}>
        <div className="modal-hd">
          <div style={{display:'flex', alignItems:'center'}}>
            <div>
              <div className="t">Nueva oportunidad</div>
              <div className="d">Crea una oportunidad en 3 pasos · empresa → contacto → datos</div>
            </div>
            <div style={{flex:1}}/>
            <button className="btn ghost icon sm" onClick={onClose}><I.x/></button>
          </div>
        </div>
        <div className="modal-steps">
          {['Empresa','Contacto','Oportunidad'].map((s,i) => (
            <React.Fragment key={s}>
              {i > 0 && <div className="modal-step-sep"/>}
              <div className={"modal-step " + (i<=step?'on':'')}>
                <span className="n">{i+1}</span>{s}
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className="modal-body">
          {step === 0 && (
            <>
              <div style={{display:'flex', gap:4, marginBottom:12, background:'var(--surface-2)', padding:2, borderRadius:7, border:'1px solid var(--line)'}}>
                <button className="btn ghost sm on" style={{flex:1, background:'var(--surface)', boxShadow:'0 1px 2px rgba(0,0,0,0.04)'}}>Buscar existente</button>
                <button className="btn ghost sm" style={{flex:1}}>Crear nueva</button>
              </div>
              <div className="cfg-input" style={{marginBottom:12, height:36}}>
                <I.search style={{width:14,height:14,color:'var(--text-3)'}}/>
                <input placeholder="Buscar por nombre o NIT…" value={q} onChange={e=>setQ(e.target.value)}/>
              </div>
              <div className="modal-list">
                {empresas.map(e => (
                  <div key={e.id} className={"modal-list-item " + (sel===e.id?'on':'')} onClick={()=>setSel(e.id)}>
                    <div className="n">{e.name}</div>
                    <div className="m">NIT {e.nit} · {e.sector} · {e.city}</div>
                  </div>
                ))}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <div className="field">
                <span className="l">Contacto</span>
                <input placeholder="Felipe Ospina"/>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                <div className="field"><span className="l">Correo</span><input placeholder="felipe@…"/></div>
                <div className="field"><span className="l">Teléfono / WhatsApp</span><input placeholder="+57 …"/></div>
              </div>
              <div className="field"><span className="l">Cargo</span><input placeholder="Director de compras"/></div>
            </>
          )}
          {step === 2 && (
            <>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                <div className="field"><span className="l">Proyecto / Nombre</span><input placeholder="ECO SQUARE …"/></div>
                <div className="field"><span className="l">Valor estimado</span><input placeholder="$ 0" className="mono"/></div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                <div className="field"><span className="l">Cotizador asignado</span><select defaultValue="SA">{COTIZADORES.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div className="field"><span className="l">Fuente</span><select><option>Referido</option><option>Página web</option><option>WhatsApp</option><option>Licitación</option></select></div>
              </div>
              <div className="field"><span className="l">Notas iniciales</span><textarea rows="3"/></div>
            </>
          )}
        </div>

        <div className="modal-ft">
          {step > 0 && <button className="btn" onClick={()=>setStep(step-1)}><I.chevLeft/> Anterior</button>}
          <div style={{flex:1}}/>
          <button className="btn" onClick={onClose}>Cancelar</button>
          {step < 2
            ? <button className="btn accent" onClick={()=>setStep(step+1)} disabled={step===0 && !sel}>Siguiente <I.chevRight/></button>
            : <button className="btn accent">Crear oportunidad</button>
          }
        </div>
      </div>
    </div>
  );
}

/* ── CONFIGURACIÓN ────────────────────────────── */
function ConfigView() {
  const [tab, setTab] = React.useState('etapas');
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Configuración</div>
          <div className="page-sub mono">Ajustes de la organización · DURATA S.A.S.</div>
        </div>
      </div>
      <div className="cfg-page-grid">
        <div className="cfg-side-nav">
          {[['etapas','Etapas del pipeline'],['sectores','Sectores'],['fuentes','Fuentes de lead'],['equipo','Equipo'],['plantillas','Plantillas'],['api','API · Integraciones']].map(([k,l])=>(
            <button key={k} className={tab===k?'on':''} onClick={()=>setTab(k)}>{l}</button>
          ))}
        </div>
        <div>
          {tab === 'etapas' && (
            <div className="section" style={{margin:0}}>
              <div className="section-head">
                <h2>Etapas del pipeline</h2>
                <span className="sub">orden · color · visibilidad</span>
                <div style={{flex:1}}/>
                <span className="mono muted" style={{fontSize:11}}>Las llaves no se pueden editar (la lógica del sistema depende de ellas)</span>
              </div>
              <div className="section-body tight">
                <table className="tbl">
                  <thead>
                    <tr><th style={{width:30}}></th><th>Etiqueta</th><th>Llave</th><th>Color</th><th className="num">Oportunidades</th><th></th></tr>
                  </thead>
                  <tbody>
                    {STAGES.map((s,i) => (
                      <tr key={s.key}>
                        <td className="mono muted" style={{color:'var(--text-4)'}}>{i+1}</td>
                        <td className="strong">{s.label}</td>
                        <td className="mono muted">{s.key}</td>
                        <td><span className="stage-pill"><span className={"stage-dot "+s.dot}></span>{s.label}</span></td>
                        <td className="num">{PIPELINE_COUNTS[s.key]?.toLocaleString('es-CO') || 0}</td>
                        <td style={{width:40}}><button className="btn ghost icon sm"><I.more/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {tab === 'sectores' && (
            <div className="section" style={{margin:0}}>
              <div className="section-head"><h2>Sectores</h2><div style={{flex:1}}/><button className="btn sm"><I.plus/> Nuevo sector</button></div>
              <div className="section-body tight">
                <table className="tbl">
                  <thead><tr><th>Sector</th><th className="num">Empresas</th><th></th></tr></thead>
                  <tbody>
                    {['Restaurantes','Clínicas/Hospitales','Hoteles','Industrial','Residencial','Institucional','Comercial'].map(s=>(
                      <tr key={s}><td className="strong">{s}</td><td className="num">{Math.floor(Math.random()*20)+3}</td><td style={{width:40}}><button className="btn ghost icon sm"><I.more/></button></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {tab === 'equipo' && (
            <div className="section" style={{margin:0}}>
              <div className="section-head"><h2>Cotizadores</h2><div style={{flex:1}}/><button className="btn sm"><I.plus/> Invitar miembro</button></div>
              <div className="section-body tight">
                <table className="tbl">
                  <thead><tr><th>Miembro</th><th>Iniciales</th><th>Rol</th><th className="num">Oportunidades</th><th className="num">Adj. 2026</th></tr></thead>
                  <tbody>
                    {COTIZADORES.map(c=>(
                      <tr key={c.id}>
                        <td><CotAvatar id={c.id} size="sm"/> <span style={{marginLeft:8, fontWeight:500}}>{c.name}</span></td>
                        <td className="mono">{c.ini}</td>
                        <td>Cotizador</td>
                        <td className="num">{Math.floor(Math.random()*40)+20}</td>
                        <td className="num">{Math.floor(Math.random()*15)+5}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {!['etapas','sectores','equipo'].includes(tab) && (
            <div className="section" style={{margin:0}}>
              <div className="section-head"><h2>{tab}</h2></div>
              <div className="section-body" style={{color:'var(--text-3)', fontSize:12.5}}>Sección pendiente — reutilizará los mismos patrones de tabla y formulario.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { EmpresasView, CotizacionesView, PreciosView, ConfiguradorView, ProductGalleryView, NuevaOportunidadModal, ConfigView });
