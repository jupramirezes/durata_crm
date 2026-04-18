// Opportunity detail

function MetaCell({ label, value }) {
  return (
    <div className="meta-cell">
      <div className="l">{label}</div>
      <div className="v">{value}</div>
    </div>
  );
}

function Prop({ k, children }) {
  return (
    <div className="prop-row">
      <div className="k">{k}</div>
      <div className="v">{children}</div>
    </div>
  );
}

function TimelineItem({ item }) {
  const accentClass = item.accent ? 'accent' : (item.k === 'create' ? 'adj' : '');
  return (
    <div className={"tl-item " + accentClass}>
      <div className="hd">
        <span className="t">{item.title}</span>
        <span className="time">{item.time}</span>
      </div>
      {item.detail && <div className="body">{item.detail}</div>}
    </div>
  );
}

function DetailView({ setRoute }) {
  const d = FEATURED;
  const [tab, setTab] = useState('actividad');

  return (
    <div className="page-view show" id="view-detail-inner" style={{flex:1}}>
      <div className="detail">
        <div className="detail-main">
          {/* Back + header */}
          <button className="btn ghost sm" onClick={() => setRoute('pipeline')} style={{marginBottom: 16, padding: '0 8px'}}>
            <I.arrowLeft /> Volver al pipeline
          </button>

          <div className="opp-header">
            <div>
              <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 4}}>
                <span className="mono muted" style={{fontSize: 11}}>{d.num}</span>
                <StagePill stage={d.stage} />
              </div>
              <div className="opp-title">{d.project}</div>
              <div className="opp-company-line">
                <strong style={{color: 'var(--text)'}}>{d.company}</strong>
                <span className="sep">·</span>
                <span>{d.contact}</span>
                <span className="sep">·</span>
                <span>Fuente: {d.fuente}</span>
                <span className="sep">·</span>
                <span>Ingreso: {d.ingreso}</span>
              </div>
            </div>
            <div className="opp-header-actions">
              <button className="btn sm"><I.note /> Nota</button>
              <button className="btn sm"><I.box /> Producto</button>
              <button className="btn sm"><I.paperclip /> Adjunto</button>
              <button className="btn sm accent">Mover etapa <I.chevDown /></button>
              <button className="btn icon ghost"><I.more /></button>
            </div>
          </div>

          {/* Meta grid */}
          <div className="meta-grid">
            <MetaCell label="Valor cotizado" value={formatCOP(d.value, {short:true})} />
            <MetaCell label="Costo" value={formatCOP(d.cost, {short:true})} />
            <MetaCell label="Margen" value={(d.margin * 100).toFixed(1) + '%'} />
            <MetaCell label="Días en pipeline" value={d.pipelineDays + 'd'} />
          </div>

          {/* Tabs */}
          <div className="tabs">
            {[['actividad','Actividad',d.timeline.length],['productos','Productos',d.products.length],['cotizaciones','Cotizaciones',d.quotes.length],['adjuntos','Adjuntos',d.attachments.length]].map(([k,l,n]) => (
              <div key={k} className={"tab " + (tab === k ? 'active' : '')} onClick={() => setTab(k)}>
                {l}<span className="n">{n}</span>
              </div>
            ))}
          </div>

          {tab === 'actividad' && (
            <>
              {/* Quick note input */}
              <div style={{display:'flex', gap: 8, marginBottom: 20, alignItems:'center', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 10px'}}>
                <CotAvatar id="JR" size="sm" />
                <input placeholder="Añadir una nota, mención o actualización…" style={{flex:1, border:0, outline:'none', background:'transparent', padding: '6px 4px', fontSize: 13}} />
                <button className="btn sm">Nota</button>
                <button className="btn sm primary">Publicar</button>
              </div>

              <div className="timeline">
                {d.timeline.map((t, i) => <TimelineItem key={i} item={t} />)}
              </div>
            </>
          )}

          {tab !== 'actividad' && (
            <>
              {/* Products */}
              <div style={{marginBottom: 24}}>
                <div style={{display:'flex', alignItems:'center', marginBottom: 12}}>
                  <h3 style={{fontSize: 13, fontWeight: 600}}>Productos configurados <span className="mono muted" style={{fontWeight:400, marginLeft: 6, fontSize:11}}>{d.products.length}</span></h3>
                  <div style={{flex:1}} />
                  <button className="btn sm"><I.plus /> Agregar producto</button>
                </div>
                {d.products.map((p, i) => (
                  <div className="product-card" key={i}>
                    <div className="product-thumb">render</div>
                    <div>
                      <div className="name">{p.name}</div>
                      <div className="spec">{p.sku} · {p.spec}</div>
                      <div className="desc">{p.desc}</div>
                    </div>
                    <div className="price">
                      <div className="p">{formatCOP(p.unit * p.qty, {short:true})}</div>
                      <div className="q">{p.qty} × {formatCOP(p.unit, {short:true})}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quotes */}
              <div style={{marginBottom: 24}}>
                <div style={{display:'flex', alignItems:'center', marginBottom: 12}}>
                  <h3 style={{fontSize: 13, fontWeight: 600}}>Cotizaciones <span className="mono muted" style={{fontWeight:400, marginLeft: 6, fontSize:11}}>{d.quotes.length}</span></h3>
                  <div style={{flex:1}} />
                  <button className="btn sm">Recotizar</button>
                </div>
                {d.quotes.map((q, i) => (
                  <div className="quote-row" key={i}>
                    <span className="num">#{q.num}</span>
                    <div className="meta">
                      <span className="title">Cotización enviada a {d.contact}</span>
                      {q.date} · <span style={{color: 'var(--s-enviada)', fontWeight: 500}}>enviada</span> · {q.files.length} archivos
                    </div>
                    <div className="total">{formatCOP(q.total, {short:true})}</div>
                    <div className="actions">
                      <button className="btn sm icon"><I.download /></button>
                      <button className="btn sm">Abrir</button>
                    </div>
                  </div>
                ))}
                <div style={{marginTop: 10, paddingLeft: 16}}>
                  {d.quotes[0].files.map((f, i) => (
                    <div className="att" key={i} style={{marginLeft: 0}}>
                      <span className={"ext " + f.ext}>{f.ext.toUpperCase()}</span>
                      <span className="name">{f.name}</span>
                      <span className="size">{f.size}</span>
                      <button className="btn ghost icon sm"><I.download /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              <div>
                <div style={{display:'flex', alignItems:'center', marginBottom: 12}}>
                  <h3 style={{fontSize: 13, fontWeight: 600}}>Adjuntos de la oportunidad <span className="mono muted" style={{fontWeight:400, marginLeft: 6, fontSize:11}}>{d.attachments.length}</span></h3>
                  <div style={{flex:1}} />
                  <button className="btn sm"><I.plus /> Subir archivo</button>
                </div>
                {d.attachments.map((a, i) => (
                  <div className="att" key={i}>
                    <span className={"ext " + a.ext}>{a.ext.toUpperCase()}</span>
                    <span className="name">{a.name}</span>
                    <span className="size">{a.size}</span>
                    <button className="btn ghost icon sm"><I.download /></button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="detail-aside">
          <div className="aside-value">
            <div className="l">Valor cotizado</div>
            <div className="v">{formatCOP(d.value)}</div>
            <div className="stage"><StagePill stage={d.stage} /></div>
          </div>

          <div className="aside-h">Propiedades</div>
          <div className="prop-list">
            <Prop k="Cotizador"><CotAvatar id={d.cotizador.id} size="xs"/> {d.cotizador.name}</Prop>
            <Prop k="Días pipeline"><span className="mono">{d.pipelineDays}d</span></Prop>
            <Prop k="Ingreso"><span className="mono">{d.ingreso}</span></Prop>
            <Prop k="Envío"><span className="mono">{d.envio}</span></Prop>
            <Prop k="Fuente">{d.fuente}</Prop>
            <Prop k="Sector">{d.sector}</Prop>
            <Prop k="Ubicación">{d.ubicacion}</Prop>
          </div>

          <div className="aside-h">Empresa</div>
          <div style={{padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--surface)'}}>
            <div style={{fontWeight: 600, fontSize: 13, color: 'var(--accent)'}}>{d.company}</div>
            <div className="muted mono" style={{fontSize: 11, marginTop: 2}}>NIT: {d.nit} · {d.sector}</div>
            <div style={{height: 1, background: 'var(--line)', margin: '10px 0'}}/>
            <div className="muted" style={{fontSize: 11}}>Histórico cotizado</div>
            <div className="mono strong" style={{fontSize: 14, marginTop: 2}}>{formatCOP(d.historicoCotizado)}</div>
            <a className="muted" style={{display:'block', fontSize: 11, marginTop: 8, color: 'var(--accent)'}}>Ver todas las oportunidades →</a>
          </div>

          <div className="aside-h">Contacto</div>
          <div style={{padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--surface)'}}>
            <div style={{fontWeight: 600, fontSize: 13}}>{d.contact}</div>
            <div className="muted" style={{fontSize: 11, marginTop: 2, display:'flex', alignItems:'center', gap: 6}}>
              <span className="stage-dot" style={{background:'var(--warn)'}}></span>
              Datos incompletos
            </div>
            <div style={{height: 1, background: 'var(--line)', margin: '10px 0'}}/>
            <button className="btn sm" style={{width:'100%', justifyContent:'center'}}>Completar contacto</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

window.DetailView = DetailView;
