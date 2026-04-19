# Herramientas y skills recomendadas — DURATA CRM

**Actualizado:** abril 2026 (post redesign v2)
**Criterio:** open source o free tier + relevancia comprobada para PyMEs manufactureras + mantenibilidad.

---

## 1. Stack actual en producción

| Herramienta | Uso | Plan actual | Plan recomendado |
|---|---|---|---|
| **Supabase** | BD + Auth + Storage + Realtime | Free tier | **Pro $25/mes** (backups diarios) |
| **Vercel** | Hosting + auto-deploy | Free tier | **Pro $20/mes** (si crece el equipo) |
| **Sentry** | Monitoreo errores runtime | Free (5k eventos/mes) | Suficiente por ahora |
| **GitHub** | Versionado + CI/CD | Free (público) | OK |
| **Claude Max** | Desarrollo asistido con IA | Pagado por JP ($1.5M/año) | Mantener (JP) |
| **Supabase MCP** | Queries SQL desde Claude Code | Free | OK |
| **Vercel MCP** | Deploys + env vars desde Claude | Free | OK |
| **n8n MCP** | Automatizaciones Fase 2 | Free self-hosted | Configurar pronto |

---

## 2. Skills custom del proyecto

Ubicación: `.claude/skills/`

| Skill | Uso | Frecuencia |
|---|---|---|
| `durata-qa-invariants` | 8 checks SQL de integridad BD | Semanal |
| `durata-migrate` | Pipeline diagnóstico → migrar → verificar idempotencia desde Excels | Cuando llegue nuevo REGISTRO |
| `durata-dump-catalogo` | Regenera `supabase/productos/_auto/*.sql` desde BD en vivo | Cuando cambies productos |

---

## 3. Handoffs de Claude Design disponibles

**Ubicación:**
- `docs/_design-handoff/` — **CRM v2 rediseñado** (ENTREGADO en branch `feat/redesign-v2`)
- `docs/CQP_DURATA.zip/` — **Módulo Compras + CPQ extendido** (SIGUIENTE sprint, ya diseñado)

### CRM v2 (entregado)

9 archivos en `docs/_design-handoff/project/durata/`:
- `app.jsx` / `shell.jsx` — App shell con Sidebar light + Topbar
- `dashboard.jsx` — KPI strip + pipeline bar + tablas
- `pipeline.jsx` — Kanban 8 columnas con cards compactas
- `detail.jsx` — Oportunidad detalle con tabs + aside
- `other-views.jsx` — Empresas / Cotizaciones / Precios / Configuración / Configurador / ProductGallery / NuevaOportunidadModal
- `data.jsx` / `icons.jsx` — seed data + icons SVG

### Módulo Compras (siguiente)

9 componentes en `docs/CQP_DURATA.zip/components/`:
- `Data.jsx` — Mock MATERIALES (40 samples of 1,550), PROVEEDORES, PRICE_HIST, SOLICITUDES, COTIZACION, GRUPOS
- `Shell.jsx` — Sidebar + Topbar variant con iconos propios del módulo
- `MaterialMaster.jsx` — Catálogo 1,550 códigos con stock pills + freshness badges + sparkline histórico
- `Comparador.jsx` — Spreadsheet multi-proveedor (WESCO, CORTEACEROS, IMPORINOX, INVERSINOX, STECKERL) con estados por celda y ganador destacado
- `OrdenCompra.jsx` — OC formal con trazabilidad + botón WhatsApp verde
- `Bandeja.jsx` — Inbox Oscar con UrgencyDot + warning "sin código" + cards click-to-cotizar
- `APUPane.jsx` — Drawer lateral con precio vigente grande + sparkline + últimas 6 cotizaciones
- `CotizacionEditor.jsx` — Editor completo (YA INTEGRADO en v2) con APU inline editable por producto expansible
- `AdjudicarModal.jsx` — Modal al adjudicar que sugiere OCs consolidadas por proveedor

**Cómo probarlo:** `npx serve -l 4173 docs/CQP_DURATA.zip` → http://localhost:4173

---

## 4. Skills recomendadas para instalar (Mes 1 post-entrega)

### shadcn/ui — UI primitives

- **Qué es:** generador de componentes React + Tailwind + Radix UI.
- **Por qué:** aunque el redesign v2 ya está fiel al handoff de Claude Design, shadcn da primitives accesibles (dropdown, popover, tooltip, command palette) que no escribimos manualmente.
- **Costo:** gratis.
- **Instalar:** `npx shadcn@latest init` + agregar command, popover, dialog, tooltip.
- **Beneficio inmediato:** command palette para ⌘K, tooltips accesibles, dialogs ARIA-compliant.

### Playwright — testing E2E

- **Qué es:** framework de testing con browser real.
- **Por qué:** tenemos 473 unit tests pero 0 tests visuales. Los bugs del 16-abr fueron de interacción UI, no de lógica. El bug de `getAvatarColor` y `Plus` no importados no se detectaron hasta que el usuario reportó white screen.
- **Costo:** gratis.
- **Instalar:** `npm i -D @playwright/test && npx playwright install`
- **Tests mínimos a escribir:**
  1. Login → navegar a cada ruta principal (pipeline, empresas, cotizaciones, precios, config, detalle opp, editor cotización) — prevenir white screens
  2. Crear oportunidad completa (wizard 3 pasos)
  3. Generar cotización PDF end-to-end
  4. Adjudicar oportunidad → verificar estado cotización

### Posthog — product analytics

- **Qué es:** analytics de producto (qué pantallas usan, cuánto tiempo, dónde se bloquean).
- **Por qué:** con 5 cotizadores usando a diario, necesitamos saber qué features se usan y cuáles no.
- **Costo:** free tier (1M eventos/mes, suficiente).

---

## 5. Para Fase 2 (módulo compras, jun–ago 2026)

### n8n — automatizaciones

Ya está el MCP disponible. Workflows recomendados:

1. **Backup diario Supabase → Google Drive** (protección extra al plan Pro)
2. **Alerta >7 días sin respuesta** — cron diario → query Supabase → email al cotizador asignado
3. **Envío WhatsApp con cotización** — click botón "Enviar WhatsApp" → n8n → WhatsApp Business API
4. **Sync PDF → carpeta de red** — cuando se genera PDF en Storage → copia a `\\Srv-durata1\Cotización\...`

### Resend — emails transaccionales

- **Qué es:** API moderna (el SendGrid/Mailgun de 2025).
- **Por qué:** Fase 2 requiere recordatorios, alertas de adjudicación, notificaciones al proveedor de la OC.
- **Costo:** free tier (3,000 emails/mes).

### Dub.co — links cortos con analytics

- **Qué es:** acortador con tracking.
- **Por qué:** si mandamos PDFs por WhatsApp con link al Storage, Dub nos dice si el cliente lo abrió.
- **Costo:** free tier generoso.

---

## 6. Para Fase 4 (IA, nov 2026 – feb 2027)

### Claude API

- Ya tenemos experiencia y Max suscrito.
- Intake estructurado: leer correo/WhatsApp y extraer data de requerimiento
- Chat Dashboard con function calling sobre BD
- Generación de descripciones comerciales mejoradas
- Análisis predictivo sobre 5+ años de histórico

### Fal.ai (Nano Banana / Flux)

- Generación de imágenes fotorrealistas del producto cotizado para PDF
- Costo: ~$0.05 USD por imagen · 150 cots/mes × 3 imágenes ≈ $22 USD/mes
- Con histórico de fotos reales de productos fabricados se puede fine-tunear (Fase 5)

### Whisper (OCR/Speech to Text)

- Interpretar audios de WhatsApp de clientes
- Se integra con Claude para estructurar la info
- Fase 4

---

## 7. Para Fase 5 (industriales, 2027)

### Almacén

- **ERPNext** (open source) — si Camilo quiere ir más allá de Siigo, es ERP completo con inventario. Integración custom.
- **Appsmith / Budibase** — build interfaces admin custom sin código (útil para Oscar o almacén).

### Portal cliente

- **Clerk o Supabase Auth** — auth mejorada (social login, MFA, magic links)
- **Resend** + emails transaccionales
- **DocuSign** (pago, estándar) o **DropboxSign** (HelloSign, barato) — firma electrónica

---

## 8. Skills custom que vale la pena crear

Si la relación con DURATA continúa, skills a construir:

| Skill | Para qué | Cuándo |
|---|---|---|
| `durata-new-producto` | Wizard para mapear Excel → producto en motor genérico. Hoy requiere SQL manual | Mes 1 post-entrega |
| `durata-ux-audit` | Auditoría visual de las N páginas contra checklist de calidad + Playwright tests visuales | Mes 1 |
| `durata-price-update` | Pipeline para actualizar precios_maestro desde Excel de proveedor con estrategia híbrida | Fase 2 (entra al módulo compras) |
| `durata-monthly-report` | Genera resumen ejecutivo del mes para Camilo: cots, adj, pipeline, top clientes | Mes 1 |
| `durata-backup-drive` | Backup manual de Supabase a Drive vía n8n | Fase 2 |
| `durata-migrar-materiales` | Script de migración 1,550 códigos + mapping precios_maestro → codigo_10 | Fase 2 (arranque) |
| `durata-cpq-deploy` | Deploy del módulo compras (tablas SQL + seed data + rutas) | Fase 2 |

---

## 9. Alternativas descartadas

### Univer.js / Handsontable (spreadsheet embebido)

- Evaluado en prototipo (abril 2026) — ver `src/pages/SpreadsheetPrototype.tsx`
- Descartado como feature productivo: replicar Excel en web es más costoso que mejorar el ConfiguradorGenerico
- Mantenido como referencia en repo (accesible solo por URL directa)

### Salesforce CPQ / Hubspot

- Genéricos, caros, no manejan manufactura a medida
- Descartados para DURATA

### Odoo

- ERP completo open source. Pros: todo integrado. Contras: curva alta, customización requiere desarrolladores Odoo específicos
- **Decisión:** seguir con stack actual (Supabase + React), más mantenible por JP y portable a SaaS externo

### Zoho CRM

- Free tier limitado, no tiene motor CPQ a medida. Descartado.

---

## 10. Presupuesto estimado herramientas (año 1)

| Herramienta | Plan | Costo anual |
|---|---|---|
| Supabase Pro | $25/mes | $300 USD ≈ $1.2M COP |
| Vercel Pro | $20/mes | $240 USD ≈ $960k COP |
| Sentry Team | $26/mes | $312 USD ≈ $1.25M COP |
| Dominio crm.durata.co | anual | ~$80k COP |
| **Subtotal infraestructura** | | **~$3.5M COP/año** |
| Resend emails | free tier | $0 |
| Posthog analytics | free tier | $0 |
| n8n self-hosted | en Supabase free | $0 |
| **Total Año 1 herramientas** | | **~$3.5M COP** |

### Año 2 (con IA)

| Adicional | Estimado |
|---|---|
| Claude API (100k tokens × 200 requests/mes) | ~$600k COP/año |
| Fal.ai imágenes (150 × 12 × $0.05 USD) | ~$400k COP/año |
| **Total adicional Año 2** | **~$1M COP/año extra** |

**Herramientas totales año 1:** $3.5M COP · año 2: $4.5M COP.

**Muy asumible para DURATA** — representa <1% del revenue anual.

---

## 11. Plan de adopción herramientas (cronograma)

### Mes 1 post-entrega (mayo-junio 2026)

1. Playwright — 5 tests E2E críticos (login + flujo cotización)
2. Posthog — instalar y empezar a recolectar data
3. shadcn/ui — agregar command palette + tooltips

### Mes 2–3 (julio–agosto)

1. n8n — backup diario + alerta 7 días + sync PDFs a carpeta de red
2. Resend — emails transaccionales al cotizador
3. Dominio `crm.durata.co` configurado

### Mes 4–6 (sep–nov)

1. Plan Supabase Pro (backups diarios)
2. Plan Vercel Pro (si crece a 10+ usuarios)
3. Evaluar IA en intake según volumen real

### Año 2

1. Fase 4 IA (Claude API + Fal.ai)
2. ERP modular si almacén escala
3. Multi-tenant para vender a otras empresas

---

## 12. Decisión para Camilo

Ya hay que pagar el plan Supabase Pro ($25/mes) **ahora** porque:
- Backups diarios automáticos (hoy dependemos de snapshot manual semanal)
- Point-in-time recovery
- 7 días de retención de logs (útil para debugging)

Si no se paga, el riesgo es perder hasta 7 días de cotizaciones si alguien borra por error.

**Recomendación:** activar Supabase Pro ya. $1.2M/año vs riesgo de perder data crítica = no hay competencia.
