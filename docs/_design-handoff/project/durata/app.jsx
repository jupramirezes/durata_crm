// Main app — routing, tweaks, renders the whole thing

const { useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "steel",
  "density": "regular",
  "tagline": "CRM · CPQ · ERP",
  "showAlerts": true,
  "cardStyle": "hairline"
}/*EDITMODE-END*/;

const ACCENTS = {
  steel:   { accent: "oklch(0.52 0.09 240)", accent2: "oklch(0.56 0.09 240)", weak: "oklch(0.96 0.02 240)", line: "oklch(0.88 0.04 240)" },
  graphite:{ accent: "oklch(0.30 0.01 260)", accent2: "oklch(0.38 0.01 260)", weak: "oklch(0.96 0.00 260)", line: "oklch(0.88 0.00 260)" },
  copper:  { accent: "oklch(0.58 0.12 45)",  accent2: "oklch(0.62 0.12 45)",  weak: "oklch(0.96 0.03 60)",  line: "oklch(0.88 0.05 45)" },
  forest:  { accent: "oklch(0.50 0.09 155)", accent2: "oklch(0.55 0.09 155)", weak: "oklch(0.96 0.02 155)", line: "oklch(0.88 0.04 155)" },
};

function applyTweaks(t) {
  const a = ACCENTS[t.accent] || ACCENTS.steel;
  const r = document.documentElement.style;
  r.setProperty('--accent', a.accent);
  r.setProperty('--accent-2', a.accent2);
  r.setProperty('--accent-weak', a.weak);
  r.setProperty('--accent-line', a.line);
  document.body.dataset.density = t.density;
  if (t.density === 'compact') {
    r.setProperty('--r-lg', '8px');
  } else {
    r.setProperty('--r-lg', '10px');
  }
}

function TweaksPanel({ tweaks, setTweaks, onClose }) {
  const set = (k, v) => setTweaks({ ...tweaks, [k]: v });
  return (
    <div className="tweaks">
      <div className="tweaks-head">
        <I.sliders style={{width:14, height:14}} />
        <span className="t">Tweaks</span>
        <button className="x" onClick={onClose}><I.x style={{width:14, height:14}}/></button>
      </div>
      <div className="tweaks-body">
        <div className="tweak-row">
          <span className="l">Accent</span>
          <div className="swatches">
            {Object.entries(ACCENTS).map(([k, v]) => (
              <div key={k} className={"sw " + (tweaks.accent === k ? 'on' : '')} style={{background: v.accent}} title={k} onClick={() => set('accent', k)}/>
            ))}
          </div>
        </div>
        <div className="tweak-row">
          <span className="l">Densidad</span>
          <div className="seg">
            {['compact','regular'].map(d => (
              <button key={d} className={tweaks.density === d ? 'on' : ''} onClick={() => set('density', d)}>{d === 'compact' ? 'Compacto' : 'Regular'}</button>
            ))}
          </div>
        </div>
        <div className="tweak-row">
          <span className="l">Brand tagline</span>
          <div className="seg">
            {['CRM · CPQ · ERP','Sistema de cotización','Durata OS'].map(d => (
              <button key={d} className={tweaks.tagline === d ? 'on' : ''} onClick={() => set('tagline', d)} style={{fontSize:10}}>{d.split(' ')[0]}</button>
            ))}
          </div>
        </div>
        <div className="tweak-row">
          <span className="l">Alert banner</span>
          <div className="seg">
            <button className={tweaks.showAlerts ? 'on' : ''} onClick={() => set('showAlerts', true)}>Visible</button>
            <button className={!tweaks.showAlerts ? 'on' : ''} onClick={() => set('showAlerts', false)}>Oculto</button>
          </div>
        </div>
        <div className="tweak-row">
          <span className="l">Card style</span>
          <div className="seg">
            {['hairline','elevated'].map(d => (
              <button key={d} className={tweaks.cardStyle === d ? 'on' : ''} onClick={() => set('cardStyle', d)}>{d === 'hairline' ? 'Hairline' : 'Elevado'}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [route, setRoute] = useState(() => localStorage.getItem('durata.route') || 'dashboard');
  const [selected, setSelected] = useState(null);
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
  const [tweaksOpen, setTweaksOpen] = useState(false);

  useEffect(() => { localStorage.setItem('durata.route', route); }, [route]);
  useEffect(() => { applyTweaks(tweaks); }, [tweaks]);

  useEffect(() => {
    const onMsg = (e) => {
      if (!e.data) return;
      if (e.data.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  useEffect(() => {
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: tweaks }, '*');
  }, [tweaks]);

  // Card style effect
  useEffect(() => {
    document.body.dataset.cardStyle = tweaks.cardStyle;
  }, [tweaks.cardStyle]);

  const [showNewOpp, setShowNewOpp] = useState(false);

  const crumbs = route === 'dashboard' ? ['Dashboard']
    : route === 'pipeline' ? ['Pipeline']
    : route === 'detail' ? ['Pipeline', (selected && selected.company) || 'ENTORNO AZUL', (selected && selected.num) || '2026-341']
    : route === 'empresas' ? ['Empresas']
    : route === 'cotizaciones' ? ['Cotizaciones']
    : route === 'precios' ? ['Precios maestros']
    : route === 'config' ? ['Configuración']
    : route === 'gallery' ? ['Pipeline', 'ENTORNO AZUL', 'Nuevo producto']
    : route === 'configurador' ? ['Pipeline', 'ENTORNO AZUL', 'Configurar cárcamo']
    : [route];

  return (
    <div className="app" data-screen-label={"01 " + route}>
      <Sidebar route={route} setRoute={setRoute} tweaks={tweaks} />
      <div className="main">
        <Topbar title={route} crumbs={crumbs} actions={<button className="btn sm primary" onClick={()=>setShowNewOpp(true)}><I.plus/> Nueva oportunidad</button>} />
        {route === 'dashboard' && <DashboardView tweaks={tweaks} />}
        {route === 'pipeline' && <PipelineView setRoute={setRoute} setSelected={setSelected} />}
        {route === 'detail' && <DetailView setRoute={setRoute} />}
        {route === 'empresas' && <EmpresasView setRoute={setRoute} />}
        {route === 'cotizaciones' && <CotizacionesView setRoute={setRoute} />}
        {route === 'precios' && <PreciosView />}
        {route === 'config' && <ConfigView />}
        {route === 'gallery' && <ProductGalleryView setRoute={setRoute} />}
        {route === 'configurador' && <ConfiguradorView setRoute={setRoute} />}
        {!['dashboard','pipeline','detail','empresas','cotizaciones','precios','config','gallery','configurador'].includes(route) && (
          <div className="page">
            <div className="page-head">
              <div>
                <div className="page-title">{crumbs[0]}</div>
                <div className="page-sub mono">En construcción</div>
              </div>
            </div>
            <div style={{marginTop: 40, textAlign: 'center', padding: 60, border: '1px dashed var(--line)', borderRadius: 12, color: 'var(--text-3)'}}>
              <div style={{fontFamily: 'var(--f-mono)', fontSize: 11, textTransform:'uppercase', letterSpacing: '0.06em', marginBottom: 8}}>Placeholder</div>
              <div>Esta vista reutilizará las mismas primitivas.</div>
              <div style={{marginTop: 20, display: 'flex', gap: 8, justifyContent: 'center'}}>
                <button className="btn sm" onClick={() => setRoute('dashboard')}>Dashboard</button>
                <button className="btn sm" onClick={() => setRoute('pipeline')}>Pipeline</button>
                <button className="btn sm" onClick={() => setRoute('detail')}>Oportunidad</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {tweaksOpen && <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} onClose={() => setTweaksOpen(false)} />}
      {showNewOpp && <NuevaOportunidadModal onClose={()=>setShowNewOpp(false)} onCreate={()=>{ setShowNewOpp(false); setRoute('detail'); }} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
