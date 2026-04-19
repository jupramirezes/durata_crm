// App shell: sidebar, topbar

const { useState } = React;

function Sidebar({ route, setRoute, tweaks }) {
  const item = (key, label, Icon, count) => (
    <div className={"nav-item " + (route === key ? "active" : "")} onClick={() => setRoute(key)}>
      <Icon /> <span>{label}</span>
      {count != null && <span className="count">{count}</span>}
    </div>
  );
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">D</div>
        <div className="brand-text">
          <div className="n">Durata</div>
          <div className="s">{tweaks.tagline}</div>
        </div>
      </div>
      <nav className="nav">
        <div className="nav-group">
          <div className="nav-group-label">Principal</div>
          {item('dashboard', 'Dashboard', I.dash)}
          {item('pipeline',  'Pipeline', I.pipeline, '239')}
        </div>
        <div className="nav-group">
          <div className="nav-group-label">Comercial</div>
          {item('empresas',     'Empresas', I.company, '84')}
          {item('cotizaciones', 'Cotizaciones', I.quote, '1.4k')}
          {item('precios',      'Precios', I.price)}
        </div>
        <div className="nav-group">
          <div className="nav-group-label">Sistema</div>
          {item('config', 'Configuración', I.cog)}
        </div>
      </nav>
      <div className="sidebar-foot">
        <div className="avatar">JP</div>
        <div className="who">
          <div className="n">R. Juan Pablo</div>
          <div className="r">Administrador</div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ title, crumbs, actions }) {
  return (
    <div className="topbar">
      <div className="crumb">
        {crumbs && crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            <span className={i === crumbs.length - 1 ? "cur" : ""}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="search">
        <I.search /> <span>Buscar empresa, cotización, producto…</span>
        <span className="kbd">⌘K</span>
      </div>
      <div className="top-actions">
        <button className="btn ghost icon" title="Notificaciones"><I.bell /></button>
        <button className="btn sm"><I.refresh /> Actualizar</button>
        {actions}
      </div>
    </div>
  );
}

// Stage pill reusable
function StagePill({ stage }) {
  const s = STAGES.find(s => s.key === stage) || STAGES[0];
  return <span className="stage-pill"><span className={"stage-dot " + s.dot}></span>{s.label}</span>;
}

// Avatar for a cotizador
function CotAvatar({ id, size }) {
  const c = COTIZADORES.find(c => c.id === id) || { ini: id };
  const klass = size === 'xs' ? 'avatar xs' : (size === 'sm' ? 'avatar sm' : 'avatar');
  return <span className={klass}>{c.ini}</span>;
}

Object.assign(window, { Sidebar, Topbar, StagePill, CotAvatar });
