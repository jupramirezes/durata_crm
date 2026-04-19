/* Screen 3 — Orden de Compra */
const { useState: useStateOC } = React;

const OC_ITEMS = [
  { cod: 'AILAL00104', desc: 'Lámina inox lisa mate cal. 1/4" — 1220 x 3050mm', qty: 8,  und: 'UND', punit: 789000, sub: 6312000 },
  { cod: 'AITCR01401', desc: 'Tubo redondo inox 2" cal. 14 — tira 6.0m',         qty: 36, und: 'ML',  punit: 89400,  sub: 3218400 },
  { cod: 'TOTMH01014', desc: 'Tornillo métrica M10 x 40mm acero inox 304',       qty: 200,und: 'UND', punit: 700,    sub: 140000  },
];

function OrdenCompra({ setRoute, pushToast }) {
  const [estado, setEstado] = useStateOC('borrador');
  const subtotal = OC_ITEMS.reduce((s,i) => s + i.sub, 0);
  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  return (
    <div>
      <Topbar crumbs={['Compras', 'Órdenes de compra', 'OC-2026-0342']} actions={
        <>
          <button className="btn"><Icon d={ICONS.copy} /> Duplicar</button>
          <button className="btn"><Icon d={ICONS.pdf} /> PDF</button>
          <button className="btn" style={{background:'#22C55E',color:'#fff',borderColor:'#22C55E'}}><Icon d={ICONS.whatsapp} /> Enviar WhatsApp</button>
          {estado === 'borrador' && <button className="btn primary" onClick={() => { setEstado('enviada'); pushToast && pushToast('OC enviada a IMPORINOX'); }}><Icon d={ICONS.send} /> Enviar</button>}
          {estado === 'enviada' && <button className="btn primary" onClick={() => { setEstado('recibida'); pushToast && pushToast('OC marcada como recibida'); }}><Icon d={ICONS.check} /> Marcar recibido</button>}
        </>
      } />

      <div style={{padding: '24px 24px 60px', maxWidth: 1040, margin: '0 auto'}}>
        {/* Traceability strip */}
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'var(--accent-weak)',border:'1px solid var(--accent-line)',borderRadius:8,marginBottom:18,fontSize:12}}>
          <Icon d={ICONS.external} />
          <span style={{color:'var(--text-2)'}}>Viene de</span>
          <a style={{color:'var(--accent)',fontWeight:600,cursor:'pointer'}}>solicitud SM-0412</a>
          <span style={{color:'var(--text-3)'}}>·</span>
          <span style={{color:'var(--text-2)'}}>alimenta</span>
          <a style={{color:'var(--accent)',fontWeight:600,cursor:'pointer'}}>COT-2026-0482 (Hospital San Vicente)</a>
          <span style={{marginLeft:'auto',fontFamily:'var(--f-mono)',fontSize:11,color:'var(--text-3)'}}>Comparador · 5 proveedores evaluados</span>
        </div>

        {/* Document */}
        <div style={{border:'1px solid var(--line)',borderRadius:10,background:'var(--surface)',overflow:'hidden'}}>
          {/* Header */}
          <div style={{padding:'28px 32px',borderBottom:'1px solid var(--line)',display:'grid',gridTemplateColumns:'1fr auto',gap:32}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                <div style={{width:36,height:36,background:'var(--text)',color:'#fff',borderRadius:6,display:'grid',placeItems:'center',fontFamily:'var(--f-mono)',fontWeight:600,fontSize:16}}>D</div>
                <div>
                  <div style={{fontWeight:600,fontSize:14}}>DURATA S.A.S.</div>
                  <div style={{fontSize:11,color:'var(--text-3)',fontFamily:'var(--f-mono)'}}>NIT 900.456.789-0 · Cl. 52 #12-34, Medellín</div>
                </div>
              </div>
              <div style={{fontFamily:'var(--f-serif)',fontSize:26,fontWeight:600,letterSpacing:'-0.02em'}}>Orden de compra</div>
              <div style={{fontFamily:'var(--f-mono)',fontSize:13,color:'var(--text-2)',marginTop:4}}>OC-2026-0342</div>
            </div>
            <div style={{textAlign:'right',display:'flex',flexDirection:'column',gap:12,alignItems:'flex-end'}}>
              <div>
                <div style={{fontFamily:'var(--f-mono)',fontSize:10.5,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Estado</div>
                <div style={{marginTop:4}}>
                  {estado === 'borrador' && <span className="state state-borrador">BORRADOR</span>}
                  {estado === 'enviada'  && <span className="state state-enviada">ENVIADA</span>}
                  {estado === 'recibida' && <span className="state state-aprobada">RECIBIDA</span>}
                </div>
              </div>
              <div>
                <div style={{fontFamily:'var(--f-mono)',fontSize:10.5,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Fecha</div>
                <div className="mono tnum" style={{fontSize:13,fontWeight:500,marginTop:4}}>18 abr 2026</div>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderBottom:'1px solid var(--line)'}}>
            <div style={{padding:'20px 32px',borderRight:'1px solid var(--line)'}}>
              <div style={{fontFamily:'var(--f-mono)',fontSize:10.5,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Proveedor</div>
              <div style={{fontWeight:600,fontSize:14}}>IMPORINOX · Importadora Inox S.A.S.</div>
              <div style={{fontSize:12.5,color:'var(--text-2)',marginTop:6,lineHeight:1.6}}>
                NIT 900.123.456-7<br/>
                Cra. 48 #32 Sur-18, Itagüí<br/>
                Contacto: Rodrigo Pérez · +57 300 412 7788<br/>
                rodrigo@importinox.co
              </div>
            </div>
            <div style={{padding:'20px 32px'}}>
              <div style={{fontFamily:'var(--f-mono)',fontSize:10.5,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Entrega</div>
              <div style={{fontWeight:600,fontSize:14}}>Planta DURATA · Medellín</div>
              <div style={{fontSize:12.5,color:'var(--text-2)',marginTop:6,lineHeight:1.6}}>
                Cl. 52 #12-34, bod. 8<br/>
                Horario: L-V 7:00-17:00 · S 7:00-12:00<br/>
                Recibe: Oscar Cárdenas<br/>
                <span style={{fontFamily:'var(--f-mono)',fontSize:11}}>Lead time acordado: 5 días hábiles</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr>
                {['Código','Descripción','Cant.','Und','P. Unit','Subtotal'].map((h,i) => (
                  <th key={i} style={{padding:'12px 16px',fontFamily:'var(--f-mono)',fontSize:10.5,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',textAlign: i>=2 ? 'right':'left',borderBottom:'1px solid var(--line)',fontWeight:500,background:'var(--surface-2)'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OC_ITEMS.map((it,i) => (
                <tr key={i}>
                  <td style={{padding:'14px 16px',borderBottom:'1px solid var(--line-2)',fontFamily:'var(--f-mono)',fontSize:12,fontWeight:500}}>{it.cod}</td>
                  <td style={{padding:'14px 16px',borderBottom:'1px solid var(--line-2)',fontSize:12.5}}>{it.desc}</td>
                  <td style={{padding:'14px 16px',borderBottom:'1px solid var(--line-2)',textAlign:'right',fontFamily:'var(--f-mono)',fontVariantNumeric:'tabular-nums',fontWeight:600}}>{it.qty}</td>
                  <td style={{padding:'14px 16px',borderBottom:'1px solid var(--line-2)',textAlign:'right',fontFamily:'var(--f-mono)',fontSize:11,color:'var(--text-3)'}}>{it.und}</td>
                  <td style={{padding:'14px 16px',borderBottom:'1px solid var(--line-2)',textAlign:'right',fontFamily:'var(--f-mono)',fontVariantNumeric:'tabular-nums'}}>{fmt(it.punit)}</td>
                  <td style={{padding:'14px 16px',borderBottom:'1px solid var(--line-2)',textAlign:'right',fontFamily:'var(--f-mono)',fontVariantNumeric:'tabular-nums',fontWeight:600}}>{fmt(it.sub)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals + notes */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:0}}>
            <div style={{padding:'20px 32px',borderRight:'1px solid var(--line)',borderTop:'1px solid var(--line)'}}>
              <div style={{fontFamily:'var(--f-mono)',fontSize:10.5,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Notas</div>
              <div style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.6}}>
                Material con certificado de calidad. Corte milimétrico según especificación adjunta. Factura a 30 días.
              </div>
            </div>
            <div style={{padding:'20px 32px',borderTop:'1px solid var(--line)',display:'flex',flexDirection:'column',gap:8,fontFamily:'var(--f-mono)',fontVariantNumeric:'tabular-nums',fontSize:12.5}}>
              <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--text-3)'}}>Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--text-3)'}}>IVA 19%</span><span>{fmt(iva)}</span></div>
              <div style={{height:1,background:'var(--line)',margin:'4px 0'}} />
              <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,fontSize:15}}><span>Total</span><span>{fmt(total)}</span></div>
            </div>
          </div>
        </div>

        {/* Timeline footer */}
        <div style={{marginTop:20,padding:'14px 18px',border:'1px solid var(--line)',borderRadius:8,background:'var(--surface)',display:'flex',alignItems:'center',gap:24,fontSize:12}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:8,height:8,borderRadius:4,background:'var(--s-adj)'}}/>
            <span style={{color:'var(--text-3)'}}>Creada</span>
            <span className="mono" style={{fontSize:11}}>18 abr · 10:42 · OC</span>
          </div>
          <div style={{width:24,height:1,background:'var(--line)'}}/>
          <div style={{display:'flex',alignItems:'center',gap:8,opacity: estado !== 'borrador' ? 1 : 0.4}}>
            <div style={{width:8,height:8,borderRadius:4,background: estado !== 'borrador' ? 'var(--s-enviada)' : 'var(--line-strong)'}}/>
            <span style={{color:'var(--text-3)'}}>Enviada</span>
          </div>
          <div style={{width:24,height:1,background:'var(--line)'}}/>
          <div style={{display:'flex',alignItems:'center',gap:8,opacity: estado === 'recibida' ? 1 : 0.4}}>
            <div style={{width:8,height:8,borderRadius:4,background: estado === 'recibida' ? 'var(--pos)' : 'var(--line-strong)'}}/>
            <span style={{color:'var(--text-3)'}}>Recibida</span>
          </div>
          <span style={{marginLeft:'auto',fontFamily:'var(--f-mono)',fontSize:11,color:'var(--text-3)'}}>Al marcar recibido → precios_maestro actualiza fecha y proveedor</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OrdenCompra });
