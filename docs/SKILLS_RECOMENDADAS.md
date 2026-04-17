# Skills y herramientas — DURATA CRM

**Actualizado:** 16 abril 2026

## Ya instalados y en uso

| Herramienta | Para qué se usa |
|---|---|
| **Supabase MCP** | Queries SQL directos, migrations, verificar invariantes |
| **Vercel MCP** | Deploys, env vars, logs de producción |
| **Claude_in_Chrome** | Testing visual en browser real |
| **Claude_Preview** | Dev server con hot reload |
| **Sentry SDK** | Captura errores runtime en producción |
| **n8n MCP** | Automatizaciones futuras (PDF a carpeta de red, alertas email) |

## Skills propias del proyecto

| Skill | Comando | Qué hace |
|---|---|---|
| `durata-qa-invariants` | Usar en cualquier sesión | 8 checks SQL de integridad de BD (0 = OK) |
| `durata-migrate` | Cuando hay Excel nuevo | Pipeline: diagnóstico → migrar → verificar → idempotencia |
| `durata-dump-catalogo` | Después de cambiar productos | Regenera `supabase/productos/_auto/*.sql` desde BD |

## Por instalar — prioridad para el proyecto

### 1. shadcn/ui (UI overhaul)
```bash
npx shadcn@latest init
npx shadcn@latest add button dialog dropdown-menu select toast card table tabs input
```
Reemplaza los ~15 componentes custom (Button, Modal, Select, etc.) con versiones accesibles y profesionales. **Prioridad #1 para mejorar percepción de calidad.**

### 2. Playwright (testing E2E visual)
```bash
npm install -D @playwright/test
npx playwright install
```
Permite tomar screenshots antes/después de cambios UI. Evita que un refactor rompa otra página sin enterarte. Útil con el prompt QA (`docs/QA_DISPATCH_PROMPT.md`).

## Skills por crear para el proyecto

| Skill | Para qué | Prioridad |
|---|---|---|
| `durata-new-producto` | Wizard para agregar producto nuevo al catálogo (variables, materiales, líneas APU, tarifas) | Alta — hoy requiere SQL manual |
| `durata-ux-audit` | Auditoría visual de las 12 páginas contra checklist de calidad | Media — post shadcn/ui |
| `durata-price-update` | Pipeline para actualizar precios_maestro desde Excel de proveedor | Media — E4 del backlog |
