/* Shell.jsx — Sidebar + Topbar */
const { useState } = React;

const Icon = ({ d, fill = 'none', stroke = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  dashboard: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  pipeline:  'M3 6h18M3 12h12M3 18h6',
  empresas:  'M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M13 9h.01M13 13h.01M13 17h.01',
  cotiz:     'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  productos: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  compras:   'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.4 2.4A1 1 0 005 17h12M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z',
  mater:     'M4 4h16v4H4zM4 10h16v4H4zM4 16h16v4H4z',
  comparador:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  oc:        'M9 12h6M9 16h6M9 8h6M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  bandeja:   'M22 11V4a2 2 0 00-2-2H4a2 2 0 00-2 2v7m20 0l-2.5 6A2 2 0 0117.6 18H6.4a2 2 0 01-1.9-1L2 11m20 0h-7.1a2 2 0 00-1.8 1.1L12 14h0l-1.1-1.9A2 2 0 009.1 11H2',
  precios:   'M12 8c-1.7 0-3 1.1-3 2.5S10.3 13 12 13s3 1.1 3 2.5-1.3 2.5-3 2.5m0-10V6m0 12v2m-8-8h16',
  config:    'M12 15a3 3 0 100-6 3 3 0 000 6zm7.4-3a7.4 7.4 0 00-.1-1.2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 00-2-1.2L14.5 3h-4l-.4 2.6a7.4 7.4 0 00-2 1.2l-2.5-1-2 3.5L5.7 11c0 .4-.1.8-.1 1.2s0 .8.1 1.2l-2.1 1.6 2 3.5 2.5-1c.6.5 1.3.9 2 1.2L10 21h4l.4-2.6c.7-.3 1.4-.7 2-1.2l2.5 1 2-3.5-2.1-1.6c.1-.4.1-.8.1-1.2z',
  bell:      'M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  plus:      'M12 5v14M5 12h14',
  search:    'M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z',
  filter:    'M3 4h18l-7 10v6l-4-2v-4L3 4z',
  chevDown:  'M6 9l6 6 6-6',
  chevRight: 'M9 6l6 6-6 6',
  chevUp:    'M6 15l6-6 6 6',
  external:  'M14 3h7v7M10 14L21 3M21 14v7H3V3h7',
  close:     'M6 6l12 12M18 6L6 18',
  pdf:       'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6',
  whatsapp:  'M21 11.5a8.4 8.4 0 01-1.3 4.5L21 21l-5.2-.7a8.4 8.4 0 11-4.3-16.3 8.4 8.4 0 019.5 7.5z',
  check:     'M5 12l5 5L20 7',
  alert:     'M12 9v3m0 4h.01M4.9 19h14.2a2 2 0 001.7-3L13.7 4a2 2 0 00-3.4 0L3.2 16a2 2 0 001.7 3z',
  history:   'M3 3v5h5M3.05 13A9 9 0 108.5 4.7L3 8',
  truck:     'M1 3h15v13H1zM16 8h5l3 3v5h-8zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  save:      'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM7 3v6h10M7 21v-8h10v8',
  send:      'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  edit:      'M17 3a2.83 2.83 0 014 4L7.5 20.5 2 22l1.5-5.5L17 3z',
  drag:      'M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01',
  paperclip: 'M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48',
  copy:      'M20 9h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1',
  eye:       'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 100-6 3 3 0 000 6z',
  eyeOff:    'M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a19.77 19.77 0 014.22-5.22M9.88 9.88a3 3 0 104.24 4.24M1 1l22 22M15.5 11.5a3 3 0 00-3-3',
  sparkles:  'M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7zM19 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3zM5 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z',
};

function NavItem({ icon, children, active, count, badge, onClick }) {
  return (
    <div className={'nav-item' + (active ? ' active' : '')} onClick={onClick}>
      <Icon d={ICONS[icon]} />
      <span>{children}</span>
      {count != null && <span className="count">{count}</span>}
      {badge && <span className="badge-new">{badge}</span>}
    </div>
  );
}

function Sidebar({ route, setRoute }) {
  const is = (r) => route === r || route.startsWith(r + '/');
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">D</div>
        <div className="brand-text">
          <div className="n">DURATA</div>
          <div className="s">CPQ · COMPRAS</div>
        </div>
      </div>
      <nav className="nav">
        <div className="nav-sec">CRM</div>
        <NavItem icon="dashboard">Dashboard</NavItem>
        <NavItem icon="pipeline">Pipeline</NavItem>
        <NavItem icon="empresas">Empresas <span className="count">143</span></NavItem>

        <div className="nav-sec">Presupuestos</div>
        <NavItem icon="cotiz" active={is('cotizaciones')} onClick={() => setRoute('cotizaciones/482')} count={28}>Cotizaciones</NavItem>
        <NavItem icon="productos">Configurador</NavItem>
        <NavItem icon="precios">Precios maestro</NavItem>

        <div className="nav-sec">Compras <span style={{fontSize:9,color:'var(--accent)',marginLeft:4}}>NUEVO</span></div>
        <NavItem icon="bandeja" active={is('bandeja')} onClick={() => setRoute('bandeja')} count={17}>Bandeja</NavItem>
        <NavItem icon="mater" active={is('materiales')} onClick={() => setRoute('materiales')} count="1,550">Material master</NavItem>
        <NavItem icon="comparador" active={is('comparador')} onClick={() => setRoute('comparador')}>Comparador</NavItem>
        <NavItem icon="oc" active={is('ordenes')} onClick={() => setRoute('ordenes/OC-2026-0341')} count={42}>Órdenes compra</NavItem>

        <div className="nav-sec">Config</div>
        <NavItem icon="config">Ajustes</NavItem>
      </nav>
      <div className="sidebar-foot">
        <div className="avatar">OC</div>
        <div className="who">
          <div className="n">Oscar Cárdenas</div>
          <div className="r">Compras · Almacén</div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ crumbs, actions }) {
  return (
    <header className="topbar">
      <div className="crumb">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            <span className={i === crumbs.length - 1 ? 'cur' : ''}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="search" style={{marginLeft: 16}}>
        <Icon d={ICONS.search} />
        <input placeholder="Buscar materiales, proveedores, cotizaciones…" />
        <span style={{fontFamily:'var(--f-mono)',fontSize:10.5,color:'var(--text-4)',padding:'1px 5px',border:'1px solid var(--line)',borderRadius:4}}>⌘K</span>
      </div>
      <div className="top-actions">
        {actions}
        <button className="btn btn-icon ghost" aria-label="Notif"><Icon d={ICONS.bell} /></button>
      </div>
    </header>
  );
}

Object.assign(window, { Icon, ICONS, Sidebar, Topbar, NavItem });
