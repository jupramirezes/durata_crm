# Herramientas y skills recomendadas — DURATA CRM

**Actualizado:** Mayo 2026
**Criterio de selección:** open source o free tier + relevancia comprobada para PyMEs manufactureras + mantenibilidad.

---

## 1. Ya instalados y en uso

| Herramienta | Uso | Costo |
|---|---|---|
| **Supabase** | BD + Auth + Storage + Realtime | Free tier (hasta 500MB BD, 1GB bandwidth) |
| **Vercel** | Hosting + auto-deploy | Free tier (100GB bandwidth/mes) |
| **Sentry** | Monitoreo de errores runtime | Free tier (5k eventos/mes) |
| **GitHub** | Versionado + CI/CD | Free (repo público) |
| **Claude Max** | Desarrollo asistido con IA | Pagado por JP (~$1.5M/año) |
| **Supabase MCP** | Queries SQL desde Claude Code | Free |
| **Vercel MCP** | Deploys y env vars desde Claude Code | Free |
| **n8n MCP** | Automatizaciones futuras | Free (self-hosted) |

---

## 2. Skills custom del proyecto

Ubicación: `.claude/skills/`

| Skill | Uso |
|---|---|
| `durata-qa-invariants` | 8 checks SQL de integridad. Ejecutar semanalmente. |
| `durata-migrate` | Pipeline completo: diagnóstico → migrar → verificar idempotencia |
| `durata-dump-catalogo` | Regenera `supabase/productos/_auto/*.sql` desde BD en vivo |

---

## 3. Recomendadas para instalar (prioridad Alta)

### shadcn/ui — UI overhaul
**Qué es:** generador de componentes React + Tailwind profesionales (Radix UI debajo).
**Por qué:** los usuarios compararon el sistema con Excel y lo vieron "inferior visualmente". shadcn cierra ese gap sin inflar el bundle.
**Costo:** gratis, open source.
```bash
npx shadcn@latest init
npx shadcn@latest add button dialog dropdown-menu select toast card table tabs input
```
**Tiempo de implementación:** 1-2 semanas para migrar los 15 componentes custom actuales.

### Playwright — testing E2E
**Qué es:** framework de testing E2E con browser real.
**Por qué:** tenemos 473 unit tests pero 0 tests visuales. Los bugs del 16-abr fueron de interacción UI, no de lógica.
**Costo:** gratis, open source.
```bash
npm install -D @playwright/test
npx playwright install
```
**Uso ideal:** tests de flujos críticos (crear opp → cotizar → generar PDF → adjudicar). Integrar en CI.

### Posthog — product analytics
**Qué es:** analytics de producto (qué pantallas usan, cuánto tiempo, dónde se bloquean).
**Por qué:** con 5 cotizadores usando, necesitamos saber qué features se usan y cuáles no. Hoy estamos a ciegas.
**Costo:** free tier (1M eventos/mes, suficiente para DURATA).

---

## 4. Recomendadas (prioridad Media)

### Resend — emails transaccionales
**Qué es:** API moderna para enviar emails (el SendGrid / Mailgun de 2025).
**Por qué:** Fase 2 requiere enviar recordatorios (>7 días sin respuesta), alertas de adjudicación, etc.
**Costo:** free tier (3,000 emails/mes).

### Dub.co — links cortos + tracking
**Qué es:** acortador de URLs con analytics (quién hizo click, desde dónde).
**Por qué:** si mandamos cotizaciones por WhatsApp con link al PDF en Supabase Storage, Dub nos dice si el cliente lo abrió.
**Costo:** free tier generoso.

### Figma — diseño antes de codear
**Qué es:** herramienta de diseño estándar de la industria.
**Por qué:** para el UI overhaul, diseñar en Figma primero ahorra tiempo de iteración. Claude puede leer Figma via MCP.
**Costo:** free tier (3 archivos) suficiente para proyecto pequeño.

### Notion o Outline — documentación viva
**Qué es:** wiki colaborativa.
**Por qué:** la documentación en Markdown funciona pero los usuarios comerciales no leen GitHub. Notion sí la leen.
**Costo:** Notion free tier para equipos <10 personas.

---

## 5. Para cuando entre automatización (Fase 2 — n8n)

n8n ya está incluido vía MCP. Recomendados workflows a construir:

### Workflow 1: Guardar PDF en carpeta de red
```
Supabase Storage (nuevo PDF) → n8n → Google Drive / Carpeta compartida DURATA
```

### Workflow 2: Alerta >7 días sin respuesta
```
Cron diario → Supabase query → Para cada cot sin respuesta → Email al cotizador asignado
```

### Workflow 3: Envío WhatsApp con cotización
```
Click botón "Enviar WhatsApp" en CRM → n8n → WhatsApp Business API → Cliente
```

### Workflow 4: Backup diario Supabase → Drive
```
Cron diario → Supabase pg_dump → Comprimir → Upload a Google Drive
```

---

## 6. Para Fase 3 — IA

### Claude API (ya tenemos experiencia)
- Intake estructurado: leer correo/WhatsApp y extraer datos
- Chat Dashboard con function calling sobre BD
- Generación de descripciones comerciales mejoradas

### Fal.ai (Nano Banana / Flux)
- Generación de imágenes de producto para PDF
- Costo: ~$0.05 USD por imagen. 150 cotizaciones/mes × 3 imágenes = ~$22 USD/mes.

### Whisper (OCR/Speech to Text)
- Para interpretar audios de WhatsApp de clientes
- Se integra con Claude para estructurar la info

---

## 7. Para Fase 4 — Módulos industriales

### Para Almacén
- **ERPNext** (open source): si Camilo quiere ir más allá de Siigo, es ERP completo con inventario.
- **Appsmith / Budibase**: construir interfaces admin custom sin código.

### Para Portal cliente
- **Clerk o Supabase Auth**: auth mejorada (social login, MFA, magic links)
- **Resend** + emails transaccionales

### Para firma electrónica
- **DocuSign** (pagado, estándar)
- **Alternativa barata**: DropboxSign (HelloSign)

---

## 8. Skills custom que podríamos crear

Si esta relación con DURATA continúa, skills que valdría crear:

| Skill | Para qué |
|---|---|
| `durata-new-producto` | Wizard para mapear Excel → producto en motor genérico. Hoy requiere SQL manual. |
| `durata-ux-audit` | Auditoría visual de las N páginas contra checklist de calidad. |
| `durata-price-update` | Pipeline para actualizar precios_maestro desde Excel de proveedor. |
| `durata-monthly-report` | Genera resumen ejecutivo del mes para Camilo: cotizaciones, adjudicaciones, pipeline, top clientes. |
| `durata-backup` | Backup manual de Supabase a Drive vía n8n. |

---

## 9. Análisis de alternativas descartadas

### Univer.js / Handsontable (spreadsheet embebido)
- **Evaluado en prototipo (abril 2026)** — ver código en `src/pages/SpreadsheetPrototype.tsx`
- **Descartado como feature productivo**: replicar Excel en web es más costoso que mejorar el ConfiguradorGenerico
- **Mantenido como referencia** por si en 6 meses se necesita

### Salesforce CPQ / Hubspot
- Genéricos, caros, no manejan manufactura a medida
- Descartados para DURATA

### Odoo
- ERP completo open source
- **Pros**: todo integrado (CRM, inventario, nómina, contabilidad)
- **Contras**: curva de aprendizaje alta, customización requiere desarrolladores Odoo específicos
- **Decisión**: seguir con stack actual (Supabase + React), más mantenible por JP

### Zoho CRM
- Free tier limitado
- No tiene motor de CPQ a medida
- Descartado

---

## 10. Presupuesto estimado de herramientas

### Año 1 (mayo 2026 — mayo 2027)

| Herramienta | Plan | Costo anual |
|---|---|---|
| Supabase Pro | $25/mes | $300 USD = ~$1.2M COP |
| Vercel Pro | $20/mes | $240 USD = ~$960k COP |
| Sentry Team | $26/mes | $312 USD = ~$1.25M COP |
| Dominio crm.durata.co | anual | ~$80k COP |
| **Subtotal infra** | | **~$3.5M COP/año** |
| Resend (emails) | free tier | $0 |
| Posthog | free tier | $0 |
| n8n self-hosted | en Supabase free | $0 |
| **Total Año 1** | | **~$3.5M COP** |

### Año 2 (con IA)

| Adicional | Estimado |
|---|---|
| Claude API (100k tokens × 200 requests/mes) | ~$600k COP/año |
| Fal.ai imágenes (150 × 12 × $0.05) | ~$400k COP/año |
| **Total Año 2** | **~$4.5M COP/año** |

**Muy asumible para DURATA** — representa <1% del revenue anual.

---

## 11. Recomendación de adopción

### Mes 1 post-entrega v1

1. shadcn/ui (UI overhaul)
2. Playwright (al menos 5 tests E2E de flujos críticos)
3. Posthog instalado (empezar a recolectar data)

### Mes 2-3

1. n8n con 2-3 workflows básicos (backup + alerta 7 días)
2. Resend para emails transaccionales
3. Domain crm.durata.co (SSL + redirect)

### Mes 4-6

1. Evaluar IA en intake según volumen real
2. Figma para diseño de módulo Proyectos

### Año 2

1. ERP modular si almacén escala
2. Multi-tenant para vender a otras empresas
