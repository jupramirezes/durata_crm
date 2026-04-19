// Dashboard screen

function Sparkline({ values, w = 120, h = 28, color = "var(--text)" }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => [i * step, h - 2 - ((v - min) / range) * (h - 4)]);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = path + ` L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:'block'}}>
      <path d={area} fill="var(--accent-weak)" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
      {pts.slice(-1).map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2" fill={color}/>)}
    </svg>
  );
}

function Kpi({ label, value, unit, spark, delta, deltaType = 'pos', sub, emphasis }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}{unit && <span className="unit">{unit}</span>}</div>
      {spark && <div className="kpi-spark"><Sparkline values={spark} /></div>}
      <div className="kpi-meta">
        {delta && <span className={"delta " + deltaType}>{deltaType==='pos'?'↑':deltaType==='neg'?'↓':'→'} {delta}</span>}
        {sub && <span>{sub}</span>}
      </div>
    </div>
  );
}

function DashboardView({ tweaks }) {
  const pipelineSegments = STAGES.filter(s => !['adjudicada','perdida','recotizada'].includes(s.key));
  const totalActive = pipelineSegments.reduce((acc, s) => acc + PIPELINE_COUNTS[s.key], 0) || 1;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Viernes, 17 de abril de 2026 · {tweaks.density === 'compact' ? 'Vista compacta' : 'Vista regular'}</div>
        </div>
        <div style={{marginLeft:'auto', display:'flex', gap:8}}>
          <button className="btn sm"><I.calendar /> Abr 2026</button>
          <button className="btn sm primary"><I.plus /> Nueva oportunidad</button>
        </div>
      </div>

      {/* Alert banner */}
      <div className="alert-banner">
        <I.alert style={{width:16, height:16, color: 'var(--warn)'}} />
        <div>
          <div className="t">{KPI.alertsOverdue} cotizaciones sin respuesta &gt;7 días</div>
          <div className="d">174 con 7-14 días · 145 con más de 30 días · Requieren seguimiento inmediato</div>
        </div>
        <div className="cta"><button className="btn sm">Ver en pipeline <I.chevRight /></button></div>
      </div>

      {/* KPI row */}
      <div className="kpi-grid">
        <Kpi label="Oportunidades activas" value="239" sub="en pipeline actual" spark={[180,195,210,220,231,239]} delta="+3.5%" deltaType="pos" />
        <Kpi label="Valor del pipeline" value="$5.04" unit="B" sub="cotizado activo" spark={[4.2,4.5,4.3,4.8,4.9,5.04]} delta="+8.1%" deltaType="pos" />
        <Kpi label="Cotizaciones del mes" value="39" sub="abr 2026 · 11 adjudicadas" spark={[68,52,91,104,165,39]} delta="−76%" deltaType="neg" />
        <Kpi label="Tasa cierre (cantidad)" value="28" unit="%" sub="11 adj / 39 cot" spark={[26.5,26.9,30.8,30.8,25.4,28.2]} delta="+2.8pp" deltaType="pos" />
        <Kpi label="Tasa cierre (valor)" value="9" unit="%" sub="$218M adj / $781M cot" spark={[22,18,16,14,11,9]} delta="−5pp" deltaType="neg" />
      </div>

      {/* Pipeline distribution */}
      <div className="section">
        <div className="section-head">
          <h2>Distribución del pipeline</h2>
          <span className="sub">· 239 oportunidades activas · {formatCOP(KPI.pipelineValue, {short:true})}</span>
          <div className="spacer" />
          <button className="btn sm ghost">Ver detalle <I.chevRight /></button>
        </div>
        <div className="section-body">
          <div className="pipeline-bar">
            {STAGES.filter(s => !['adjudicada','perdida','recotizada'].includes(s.key)).map(s => {
              const n = PIPELINE_COUNTS[s.key];
              const pct = (n / totalActive) * 100;
              if (!n) return null;
              return <div key={s.key} style={{flex: pct, background: s.color, minWidth: pct > 0 ? 4 : 0}} title={`${s.label}: ${n}`}/>;
            })}
          </div>
          <div className="legend">
            {STAGES.map(s => (
              <div className="legend-item" key={s.key}>
                <span className={"stage-dot " + s.dot}></span>
                <span className="lbl">{s.label}</span>
                <span className="val tnum">{PIPELINE_COUNTS[s.key].toLocaleString('es-CO')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2-col: Alertas + Métricas mensuales */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16, marginTop: 24}}>
        <div className="section" style={{margin:0}}>
          <div className="section-head">
            <h2>Alertas de seguimiento</h2>
            <span className="sub">sin respuesta &gt;7 días</span>
            <div className="spacer" />
            <span className="mono muted" style={{fontSize:11}}>6 / 185</span>
          </div>
          <div className="section-body tight">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th className="num">Valor</th>
                  <th className="num">Días</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {STALE_OPPS.map((o,i) => (
                  <tr key={i}>
                    <td>
                      <div style={{fontWeight:500}}>{o.company}</div>
                      <div className="muted mono" style={{fontSize:11}}>{o.num} · {o.contact}</div>
                    </td>
                    <td className="num">{formatCOP(o.value, {short:true})}</td>
                    <td className="num">
                      <span className="mono" style={{color: o.days > 30 ? 'var(--neg)' : o.days > 14 ? 'var(--warn)' : 'var(--text-3)'}}>
                        {o.days}d
                      </span>
                    </td>
                    <td style={{width: 60}}><CotAvatar id={o.cot} size="sm"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section" style={{margin:0}}>
          <div className="section-head">
            <h2>Comparativo vs. año anterior</h2>
            <span className="sub">Ene–Abr 2025 vs. Ene–Abr 2026</span>
          </div>
          <div className="section-body tight">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th className="num">2025</th>
                  <th className="num">2026</th>
                  <th className="num">Var.</th>
                </tr>
              </thead>
              <tbody>
                {COMPARATIVO.map((r, i) => {
                  const delta = r.unit === '%' ? (r.b - r.a) : ((r.b - r.a) / r.a) * 100;
                  const up = delta > 0;
                  const fmt = (v) => r.unit === '$' ? formatCOP(v, {short:true}) : r.unit === '%' ? v.toFixed(1) + '%' : r.unit === 'd' ? v.toFixed(1) + 'd' : v.toLocaleString('es-CO');
                  return (
                    <tr key={i}>
                      <td>{r.k}</td>
                      <td className="num">{fmt(r.a)}</td>
                      <td className="num strong">{fmt(r.b)}</td>
                      <td className="num">
                        <span className={"delta " + (up ? 'pos' : 'neg')}>
                          {up ? '↑' : '↓'} {r.unit === '%' ? Math.abs(delta).toFixed(1) + 'pp' : Math.abs(delta).toFixed(1) + '%'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Monthly metrics */}
      <div className="section">
        <div className="section-head">
          <h2>Métricas mensuales</h2>
          <span className="sub">últimos 6 meses · cotizaciones · adjudicadas · tasa de cierre</span>
          <div className="spacer" />
          <button className="btn sm ghost"><I.download /> Exportar</button>
        </div>
        <div className="section-body tight">
          <table className="tbl">
            <thead>
              <tr>
                <th>Mes</th>
                <th className="num">Cotizaciones</th>
                <th className="num">Valor cotizado</th>
                <th className="num">Adjudicadas</th>
                <th className="num">Valor adjudicado</th>
                <th className="num">% Cierre</th>
                <th style={{width: 140}}>Tendencia</th>
              </tr>
            </thead>
            <tbody>
              {MONTHLY.map((m, i) => {
                const partial = i === MONTHLY.length - 1;
                return (
                  <tr key={i}>
                    <td><span style={{fontWeight: partial ? 600 : 500}}>{m.m}</span> {partial && <span className="mono muted" style={{fontSize:10, marginLeft: 6}}>en curso</span>}</td>
                    <td className="num">{m.cotiz}</td>
                    <td className="num">{formatCOP(m.cotizVal, {short:true})}</td>
                    <td className="num">{m.adj}</td>
                    <td className="num">{formatCOP(m.adjVal, {short:true})}</td>
                    <td className="num">
                      <span style={{fontWeight:500}}>{(m.rate * 100).toFixed(1)}%</span>
                    </td>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap: 6}}>
                        <div style={{flex:1, height: 6, background:'var(--surface-2)', borderRadius: 10, overflow:'hidden'}}>
                          <div style={{height:'100%', width: (m.rate * 200) + '%', background: 'var(--accent)'}}/>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

window.DashboardView = DashboardView;
