# DURATA — Roadmap de transformación digital

**Última actualización:** 2026-04-18 (post redesign v2)
**Horizonte:** 2026–2028
**Owner técnico:** JP Ramírez

---

## 0. Contexto ejecutivo

DURATA S.A.S. — fabricante colombiano de mobiliario industrial en acero inoxidable (33 productos catalogados, 5 cotizadores, 5,190 cotizaciones históricas).

**Antes de marzo 2026:** cotizaciones en un Excel de 45 MB, dependencia 100% de Sebastián, sin trazabilidad, 40–100 min por cotización.

**Hoy (abril 2026):** CRM+CPQ web en producción, 5 cotizadores operando en paralelo, dashboard en tiempo real, PDF automático, redesign v2 entregado con UI profesional estilo Linear/Attio.

**Lo que sigue (2026–2028):** extender la misma columna vertebral a **producción, almacén, compras, proyectos post-venta**, con IA real donde ya existe estructura de datos.

---

## 1. Estado actual — Entrega v1 (feb–may 2026)

### ✅ Módulo 1: CRM + CPQ (entregado)

| Área | Qué hay | Estado |
|---|---|---|
| Pipeline comercial | 8 etapas drag&drop, filtros múltiples, cards compactas | ✅ |
| Empresas | 2,303 empresas clasificadas, 1,149 contactos | ✅ |
| Oportunidades | Detalle con 4 tabs (Actividad / Productos / Cotizaciones / Adjuntos) + aside sticky | ✅ redesign v2 |
| Cotizaciones | Lista paginada + editor con versiones A/B/C + estado pills | ✅ redesign v2 |
| CPQ Motor | 33 productos con APU paramétrico (430 vars, 746 materiales, 796 líneas APU) | ✅ |
| Configuradores | Mesa (3D) + Genérico (form dinámico) | ✅ (pendiente unificar) |
| Dashboard | KPIs, pipeline bar, tablas conciliadas 100% con Excel MAESTRO | ✅ redesign v2 |
| Precios maestros | 1,408 materiales inline editables con filtros por grupo | ✅ redesign v2 |
| PDF | Generación automática con logo, condiciones, firma | ✅ |
| APU Excel | Descarga individual + consolidado (1 hoja por producto) | ✅ |
| Auth + RLS | Supabase Auth + 14 tablas con RLS básica | ✅ |
| Monitoreo | Sentry SDK configurado, VITE_SENTRY_DSN en Vercel | ✅ |
| Tests | 473 unit tests pasando (vitest) | ✅ |
| Redesign v2 | Paleta warm-paper + cool-steel, Inter+Mono, patterns Linear/Attio | ✅ branch `feat/redesign-v2` |

### Valor entregado

- **Tiempo cotización:** 40 min → 3 min promedio (**-92%**)
- **Cotizadores simultáneos:** 1 → 5 (**5×**)
- **Datos migrados:** 5,187 ops · 5,190 cots · 1,408 precios · 354 APUs · 379 PDFs
- **Stack:** React 19 + TS + Supabase + Vercel (tier gratuito suficiente)

---

## 2. Sprint de cierre v1 (mayo 2026)

Última milla antes de entrega oficial al equipo:

- [ ] **Merge `feat/redesign-v2` → main** (auto-deploy Vercel)
- [ ] QA presencial con 5 cotizadores (45 min grupal)
- [ ] Videotutorial 10 min flujo básico
- [ ] **Unificar ConfiguradorMesa + Genérico** (hoy son 2 archivos 951+573 líneas; el genérico debe poder renderizar Mesa como caso particular con módulo 3D opcional)
- [ ] 12 productos faltantes (Ola 4 + especiales)
- [ ] Export completo de datos desde `/config`
- [ ] Bug D-07: adjuntar imagen por producto con mejor layout en PDF

**Tiempo estimado:** 2–3 semanas · **Esfuerzo:** 50–70 horas

---

## 3. Fase 2 — Módulo Compras + Material Master (jun–ago 2026) 🆕

**Ya diseñado:** handoff en `docs/CQP_DURATA.zip/` (7 componentes) + brief en `docs/_privado/CONTEXTO_DESIGN_COTIZACIONES.md`.

### Problema actual (sin módulo)

Hoy existen 3 sistemas de datos **desconectados**:

1. **`precios_maestro` (Supabase)** — 1,408 materiales con precio pero sin código estructurado
2. **`DEFINITIVO CODIFICACION INVENTARIO 2020.xlsx`** — 1,550 códigos jerárquicos 10 caracteres (AILAL00102 = "Lámina acero inox lisa mate cal. 1/8") que nadie usa
3. **`Cotizaciones.xlsx` hoja OSCAR** — 706 solicitudes + 377 comparativos multi-proveedor manuales

Resultado: cotizaciones con precios potencialmente meses desactualizados, sin trazabilidad precio↔proveedor↔fecha, Oscar como bottleneck de todas las compras.

### Solución propuesta

Unificar en un **Material Master único** en Supabase con código 10-char como PK, conectado a:

- Proveedores (multi-proveedor por material con score, lead time, histórico)
- Precios vigentes con fecha de última cotización
- Solicitudes (residente → Oscar)
- Órdenes de compra formales

### Pantallas (diseñadas en handoff)

| Pantalla | Ruta | Función |
|---|---|---|
| **Material Master** | `/materiales` | Tabla maestra 1,550 códigos + filtros + freshness badges |
| **Bandeja de compras** | `/compras` | Inbox Oscar tipo kanban con urgencias |
| **Comparador multi-proveedor** | `/compras/:id/cotizar` | Spreadsheet side-by-side con estados AGOTADO/NA/precio + ganador sugerido |
| **Orden de Compra** | `/compras/oc/:id` | OC formal con trazabilidad "viene de X, alimenta cotización Y" + WhatsApp |
| **APU Pane** (drawer) | dentro del Configurador | Histórico precios + sparkline 6 meses + tendencia proveedores |
| **Adjudicar Modal** | dentro del Pipeline | Al adjudicar cotización cliente → sugiere OCs consolidadas por proveedor |

### Beneficios medibles

- **Precios frescos siempre** — badges de freshness (verde <30d, ámbar 30-60d, rojo >60d)
- **Trazabilidad precio↔proveedor↔fecha** — histórico completo por material
- **Oscar deja de ser bottleneck** — residentes autogestionan solicitudes
- **Margen protegido** — no más cotizaciones con precios 2 años desactualizados

**Estimado:** 3–4 semanas · requiere migración BD (ver brief §8) · script idempotente `scripts/migrar-materiales.ts` con estrategia híbrida de limpieza.

---

## 4. Fase 3 — Módulo Proyectos post-adjudicación (sep–oct 2026)

Cuando un cliente aprueba cotización, la oportunidad pasa de "comercial" a **proyecto productivo**:

- Estado producción: en cola · producción · entrega · garantía
- Asignación a residente/supervisor
- MRP básico: lista de materiales consolidada (del APU) vs stock del almacén
- Fechas objetivo vs reales (% cumplimiento)
- Adjuntos del proyecto (planos, fotos avance, remisiones)
- Alertas de atraso

**Integración natural:** al pasar cotización a "adjudicada" se crea automáticamente un Proyecto + sugerencia de OCs (ya diseñado en AdjudicarModal del handoff compras).

---

## 5. Fase 4 — IA aplicada (nov–feb 2027)

Entra IA donde ya hay estructura de datos (no antes).

### IA en Intake

- Claude/GPT lee correo, WhatsApp, PDF del cliente
- Extrae: empresa, producto tipo, medidas, material, urgencia, cantidades
- Pre-llena oportunidad en CRM con confianza (alta/media/baja)
- Cotizador valida y ajusta

### IA en Dashboard

- Chat en lenguaje natural: *"¿cuánto cotizamos a Hospital X en abril?"*, *"¿qué cotizador cierra más en licitaciones?"*
- Análisis predictivo basado en histórico 5+ años
- Alertas inteligentes: *"la tasa de cierre bajó 3pp este mes, revisar motivos"*

### IA para imagen de producto

- Producto configurado → prompt generado con dimensiones + material
- Nano Banana / Flux / Ideogram genera render fotográfico
- Se incluye en PDF (hoy se adjunta manual)

### IA para sugerencia de márgenes

- Basado en histórico del cliente: *"a este cliente le aprueban 35-38%, no 42%"*
- Basado en producto: *"mesas estándar se aprueban al 38%, pozuelos quirúrgicos al 45%"*

---

## 6. Fase 5 — Módulos industriales (mar–ago 2027)

### Almacén (pedido explícito de Camilo)

- Catálogo con codificación DURATA (el mismo del Material Master)
- Stock en tiempo real (entradas por OC recibida, salidas por orden de producción)
- Integración bidireccional con Siigo (contable en Siigo, operativo en CRM)
- Alertas de stock bajo por material crítico

### Portal cliente

- Cliente ve sus cotizaciones online (link personal firmado)
- Descarga PDF, hace comentarios, aprueba digitalmente
- Firma electrónica para órdenes de compra
- Ve avance de producción de proyectos adjudicados

### App móvil (PWA)

- Para cotizar desde celular en obra
- Tomar foto del sitio → crear oportunidad con IA intake
- Aprobar cotizaciones en movilidad (Sebastián/Camilo)
- Alertas push

---

## 7. Fase 6 — Producto SaaS externo (2028) 🚀

Si el sistema funciona bien en DURATA, se puede vender a otras PyMEs manufactureras.

### Mercado potencial

- PyMEs manufactureras Colombia con $2-20B COP anuales: ~5,000 empresas
- Pain común: Excel frágil, cotización lenta, cero trazabilidad
- Competencia: Salesforce CPQ (caro, genérico) · Odoo (complejo) · Zoho (genérico)
- **Diferenciador DURATA:** motor paramétrico + compras integrado + específico manufactura a medida

### Modelo de negocio

- SaaS: $500–2,000 USD/mes según tamaño
- Implementación: $5–15M COP one-time (mapeo productos, entrenamiento)
- Soporte: paquetes mensuales

### Arquitectura multi-tenant

- Core reutilizable (CRM, pipeline, cotización, PDF, motor, compras)
- Motor de reglas por empresa (productos, fórmulas, márgenes, branding)
- Adaptadores intercambiables (WhatsApp, correo, ERP, storage)

**Primer caso de éxito:** DURATA con métricas antes/después documentadas. La data ya existe para construir el pitch.

---

## 8. Cronograma ejecutivo

```
2026
 ├── Q2 (abr–jun): Entrega v1 (redesign v2 merged) + sprint cierre
 ├── Q3 (jul–sep): Fase 2 (Compras + Material Master + AdjudicarOC)
 └── Q4 (oct–dic): Fase 3 (Proyectos post-adj) + arranque Fase 4 (IA intake)

2027
 ├── Q1 (ene–mar): Fase 4 completa (IA Dashboard + imagen render + márgenes)
 ├── Q2 (abr–jun): Fase 5 — Módulo Almacén + integración Siigo
 ├── Q3 (jul–sep): Fase 5 — Portal cliente + firma electrónica
 └── Q4 (oct–dic): App móvil PWA + primer cliente SaaS externo (piloto)

2028
 └── Escala: 5–10 clientes SaaS · $50–200M COP revenue externa
```

---

## 9. Costos y ROI proyectados

### Costos de operación

| Concepto | Año 1 (v1 + Fase 2) | Año 2 (Fase 3-4) | Año 3 (Fase 5) |
|---|---|---|---|
| Infraestructura (Supabase Pro + Vercel Pro + Sentry) | $1.2M COP | $1.5M COP | $2M COP |
| APIs IA (Claude + Fal.ai) | $0 | $3–5M COP | $8–12M COP |
| **Consultor JP (propuesta actual)** | **$90M** | **$100M** | **$110M** |
| Herramientas JP (Claude Max, Cursor, Figma) | $6M (JP) | $6M (JP) | $6M (JP) |
| **Total para DURATA** | **~$91M/año** | **~$105M/año** | **~$120M/año** |

### ROI esperado

| Año | Ahorro tiempo | Aumento ventas | Costo | ROI neto |
|---|---|---|---|---|
| 1 | $23M (tiempo Sebastián + 5 cotizadores) | $0 | $91M | **Break-even en valor intangible** (trazabilidad, escalabilidad) |
| 2 | $45M | $30M (+5% conversión, tickets más altos) | $105M | **-28%** (pagar el año, ganar la infraestructura) |
| 3 | $65M | $120M (+10% conversión, ventas IA, 2 proyectos clientes SaaS) | $120M | **+54%** (DURATA recupera todo) |
| 4+ | Crecimiento compuesto + revenue SaaS externa | $150-500M | $130M | **+200%+** |

**Year 3 el sistema empieza a pagar con creces.** Year 4+ se vuelve activo estratégico.

---

## 10. Decisiones pendientes para Camilo

Antes de arrancar Fase 2, definir con gerencia:

1. **Plan Supabase Pro** ($25/mes) — backups diarios automáticos. **SÍ se necesita.**
2. **Dominio propio** (crm.durata.co) — $80k/año + SSL gratis. **SÍ se necesita.**
3. **Alcance Fase 2** — ¿arrancar Compras o IA Intake primero? **Recomiendo Compras** (más retorno medible, primer paso para escalar a otras áreas)
4. **Champion interno** — ¿quién es el power user además de JP? **Sugiero Omar** (mayor volumen de cotizaciones)
5. **Esquema JP** — empleado vs consultor (ver `_privado/PROPUESTA_ECONOMICA.md`). **Decisión clave para continuidad del proyecto.**
6. **Roadmap externo** — ¿cuándo empezamos a vender a otras PyMEs? **Sugiero Q4 2027** una vez Fase 2-3 probadas en DURATA

---

## 11. Riesgos estratégicos

### Para DURATA

1. **Bus factor = 1 (JP)** — mitigar con documentación viva (hecho), tests (473 ✓), segundo desarrollador junior en Fase 2
2. **Excel en paralelo** — si el equipo sigue usando Excel, las métricas no son reales. Sebastián y Camilo deben bloquear Excel para cotizaciones nuevas post-mayo
3. **Adopción parcial** — si cotizadores usan el sistema solo para estándar y Excel para especiales, se pierde el valor. Fase 2 refuerza el CRM como único sistema válido
4. **Crecimiento tier Supabase** — free tier aguanta hasta ~100 usuarios. Upgrade a Pro ya presupuestado

### Para JP

1. **Código propiedad** — definir en contrato: código del CRM propiedad de DURATA (licencia de uso perpetua); componentes genéricos (motor paramétrico, CPQ core) JP conserva para reutilizar en otros clientes
2. **Licencia SaaS externa** — si DURATA recibe regalía o equity cuando JP venda a otras empresas, debe estar en contrato
3. **Exclusividad** — JP puede tener otros clientes siempre que NO sean competencia directa en mobiliario acero inox

---

## 12. KPIs del roadmap (revisar Q4 cada año)

| KPI | Baseline 2026 | Meta 2026 | Meta 2027 | Meta 2028 |
|---|---|---|---|---|
| Cotizaciones/mes | 130 | 150 | 200 | 250 |
| Tasa cierre cantidad | 27.6% | 30% | 35% | 40% |
| Tasa cierre valor | 8.8% | 12% | 15% | 20% |
| Tiempo prom cotización estándar | 3 min | 2 min | 1 min | <1 min |
| % cotizaciones por CRM (vs Excel) | 80% | 100% | 100% | 100% |
| % cotizaciones automáticas (sin humano) | 0% | 10% | 30% | 50% |
| Proyectos con trazabilidad completa | 0% | 50% | 100% | 100% |
| % precios con freshness <30d | ~20% | 80% | 95% | 98% |
| Revenue SaaS externa | $0 | $0 | $50M | $200M |

---

## 13. Conclusión

La entrega v1 es **solo el primer escalón**. El valor real se construye sobre:

1. **Data limpia y estructurada** que ya existe (5,187 ops, 1,408 precios, 1,550 códigos pendientes de migrar)
2. **Patrones UI consistentes** validados por Claude Design (warm-paper + cool-steel + hairlines)
3. **Motor paramétrico** que escala de 33 productos actuales a cualquier manufacturero
4. **Integraciones planeadas** con compras, almacén, producción, IA

**El sistema que construimos en 3 meses (feb–may 2026) vale $36–61M en el mercado (ver `ENTREGA_V1.md`).**
**El sistema que construiremos en 2 años siguiendo este roadmap vale $200–500M + revenue SaaS recurrente.**

La decisión no es si continuar, sino cómo escalar: con JP como empleado tiene límites estructurales; como consultor estratégico se multiplica por 3–5× el throughput. Esa decisión se negocia aparte (`_privado/PROPUESTA_ECONOMICA.md`).

---

**Referencia:** brief módulo compras completo en `docs/_privado/CONTEXTO_DESIGN_COTIZACIONES.md` · handoff visual en `docs/CQP_DURATA.zip/` · propuesta para Camilo en `docs/_privado/PROPUESTA_ECONOMICA.md`.
