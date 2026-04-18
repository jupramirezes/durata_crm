// Pipeline kanban

function OppCard({ o, onOpen }) {
  const ageClass = o.age > 30 ? 'hot' : o.age > 7 ? 'warn' : '';
  return (
    <div className="opp-card" onClick={onOpen}>
      <div className="row1">
        <span className="company" title={o.company}>{o.company}</span>
        <span className="num">{o.num}</span>
      </div>
      <div className="contact">{o.contact}</div>
      <div className="row2">
        <span className="val">{o.value === 0 ? '—' : formatCOP(o.value, {short:true})}</span>
        <span className="spacer"/>
        <CotAvatar id={o.cot.id} size="xs"/>
        <span className={"age " + ageClass}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          {o.age}d
        </span>
      </div>
    </div>
  );
}

function KanbanColumn({ stage, opps, total, onOpen }) {
  return (
    <div className="col">
      <div className="col-head">
        <span className={"stage-dot " + stage.dot}></span>
        <span className="name">{stage.label}</span>
        <span className="count">{opps.length}</span>
        <span className="sum">{formatCOP(total, {short:true})}</span>
      </div>
      <div className="col-list">
        {opps.map(o => <OppCard key={o.id} o={o} onOpen={() => onOpen(o)} />)}
      </div>
    </div>
  );
}

function PipelineView({ setRoute, setSelected }) {
  const [filter, setFilter] = useState('todos');

  return (
    <div className="page-view show pipeline-shell" id="view-pipeline-inner">
      <div className="pipeline-toolbar">
        <div>
          <div style={{fontSize: 20, fontWeight: 600, letterSpacing:'-0.02em'}}>Pipeline</div>
          <div className="mono muted" style={{fontSize: 11, marginTop: 2}}>239 oportunidades · {formatCOP(KPI.pipelineValue, {short:true})} activo</div>
        </div>
        <div style={{flex: 1}} />

        <div style={{display:'flex', gap: 4, background: 'var(--surface-2)', borderRadius: 8, padding: 2, border: '1px solid var(--line)'}}>
          {['todos','OC','SA','JR','CA','DG'].map(f => (
            <button key={f} className={"chip " + (filter === f ? 'on' : '')} style={{border: 0, height: 22, fontSize: 11, padding: '0 10px'}} onClick={() => setFilter(f)}>
              {f === 'todos' ? 'Todos' : f}
            </button>
          ))}
        </div>

        <button className="chip">Año <I.chevDown /></button>
        <button className="chip">Mes <I.chevDown /></button>
        <button className="chip">Sector <I.chevDown /></button>
        <button className="chip">Valor &gt;$50M <I.chevDown /></button>
        <button className="chip"><I.filter /> Histórico</button>

        <div style={{flex: 1}} />

        <div className="search" style={{flex: '0 0 220px', height: 26}}>
          <I.search />
          <span>Buscar oportunidad…</span>
        </div>
        <button className="btn sm primary"><I.plus /> Nueva</button>
      </div>

      <div className="kanban">
        {STAGES.map(stage => (
          <KanbanColumn
            key={stage.key}
            stage={stage}
            opps={OPPS_BY_STAGE[stage.key]}
            total={TOTAL_BY_STAGE[stage.key]}
            onOpen={(o) => { setSelected(o); setRoute('detail'); }}
          />
        ))}
      </div>
    </div>
  );
}

window.PipelineView = PipelineView;
