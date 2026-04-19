# Handoff — próxima sesión de Claude Code

**Actualizado:** 2026-04-18 (post redesign v2)
**Branch activa:** `feat/redesign-v2` · **Último commit:** `38461e4`

---

## Prompt de inicio recomendado

Al abrir nueva sesión en este repo:

```
Contexto: Proyecto DURATA CRM+CPQ. Acabamos de terminar el redesign v2
del CRM completo (feat/redesign-v2). Ahora necesito [describe qué].

Antes de responder, leé:
- docs/HANDOFF.md — estado actual + redesign v2
- docs/ROADMAP.md — visión + módulo compras
- docs/GUIA_USUARIO.md — flujo para cotizadores
- docs/ENTREGA_V1.md — alcance entregado
- docs/_privado/CONTEXTO_DESIGN_COTIZACIONES.md — brief módulo compras
- docs/_design-handoff/ — design system del CRM v2 (referencia visual)
- docs/CQP_DURATA.zip/ — handoff CPQ+Compras (sprint siguiente)

Memoria del proyecto: auto-cargada por Claude Code.
```

---

## Estado actual

### Redesign v2 — ENTREGADO en branch `feat/redesign-v2`

Transformación visual completa del CRM siguiendo el handoff de Claude Design (`docs/_design-handoff/`):

- **Paleta:** warm-paper `#FAFAF9` · cool-steel OKLCH accent · hairlines, no sombras
- **Tipografía:** Inter (UI) + IBM Plex Mono (códigos, precios, fechas)
- **Densidad:** Linear/Attio — 48px topbar, 232px sidebar light, tablas compactas
- **14 commits** en la branch, 473/473 tests pass, TypeScript limpio

Pantallas rediseñadas:

| # | Pantalla | Archivos afectados |
|---|---|---|
| 1 | Tokens globales | `src/index.css` |
| 2 | Shell (Sidebar + Topbar) | `src/components/Sidebar.tsx`, `Topbar.tsx`, `App.tsx` |
| 3 | Dashboard | `src/pages/Dashboard.tsx` (preserva 100% cálculos) |
| 4 | Pipeline kanban | `src/pages/Pipeline.tsx` (cards uniformes 70px) |
| 5 | OportunidadDetalle | `src/pages/OportunidadDetalle.tsx` (tabs + aside 3 cards) |
| 6 | Empresas list | `src/pages/Empresas.tsx` (list-page pattern) |
| 7 | Cotizaciones list | `src/pages/Cotizaciones.tsx` (state-pills) |
| 8 | CotizacionEditor | `src/pages/CotizacionEditor.tsx` (version badges + Totales + Versiones) |
| 9 | Precios + Config | `src/pages/Precios.tsx`, `Configuracion.tsx` |
| 10 | EmpresaDetalle | `src/pages/EmpresaDetalle.tsx` |
| 11 | Modales + Configuradores | `CotizacionModal`, `OportunidadFormModal`, `ConfiguradorMesa`, `ConfiguradorGenerico` |

---

## Stats verificadas

- **Tests:** 473/473 pass en 46 archivos
- **Build:** OK (warning bundle >500KB esperado, Three.js)
- **Invariantes BD:** 8/8 PASS
- **Productos:** 33 operables
- **BD prod:** 5,187 ops · 5,190 cots · 2,303 empresas · 1,149 contactos · 1,408 precios
- **Adjuntos:** 354 APUs + 379 PDFs (2026)

---

## Dashboard conciliado con Excel MAESTRO

Ene-Abr 2026 exacto:
- Ene: 97 cots · $1,620,173,712
- Feb: 132 cots · $2,780,599,549
- Mar: 126 cots · $4,553,893,496
- Abr: 39 cots · $781,177,397
- **Total 2026:** 394 / $9,735,844,154 ✓

---

## Próximos pasos inmediatos

### Esta semana (pre-demo team)

1. **QA visual completo** — login con cada usuario (OC/SA/JR/CA/DG) y recorrer cada pantalla
2. Merge `feat/redesign-v2` a `main` → auto-deploy Vercel
3. Sesión de entrenamiento presencial a Omar, Camilo, Daniela (45 min)
4. Monitoreo Sentry 3x/día primera semana
5. Medir tiempo real de cotización con cronómetro vs 3min objetivo

### Sprint de cierre pendientes v1

Ver `ROADMAP.md` §2 para detalle:

- [ ] **Videotutorial** 10 min del flujo básico (pendiente)
- [ ] 12 productos faltantes del catálogo (Ola 4 + especiales)
- [ ] Export completo de datos desde `/config`
- [ ] Unificar ConfiguradorMesa + ConfiguradorGenerico (hoy son 2 archivos distintos)

---

## Sprint siguiente — Módulo Compras + Material Master (NUEVO)

**Handoff ya diseñado:** `docs/CQP_DURATA.zip/` (7 componentes + tokens.css)

**Alcance:** Unificar los 3 Excels desconectados (precios_maestro · codificación 2020 · Oscar comparador) en un sistema integrado con:

1. Material Master con 1,550 códigos jerárquicos
2. Bandeja de solicitudes (Oscar)
3. Comparador multi-proveedor tipo spreadsheet
4. Órdenes de compra con trazabilidad
5. APUPane drawer con histórico precios
6. AdjudicarModal con sugerencia de OCs consolidadas

**Estimado:** 3-4 semanas · ver `docs/_privado/CONTEXTO_DESIGN_COTIZACIONES.md` para brief completo.

---

## Comandos útiles

```bash
npm run dev              # Vite :5173
npm test -- --run        # 473 tests
npm run build            # TS + Vite bundle
npm run migrate          # Excel → Supabase (idempotente)

# Diagnóstico
node scripts/_diag-migracion.mjs
node scripts/_diag-estancadas.mjs
node scripts/_dump-productos.mjs

# Serve handoff CPQ para ver el prototipo (después de cerrar preview con login)
npx serve -l 4173 docs/CQP_DURATA.zip
```

---

## Personas

- **JP Ramírez** (rjuanpablohb@gmail.com): owner técnico + cotizador
- **Sebastián Aguirre** (saguirre@durata.co): gerente comercial, aprobador
- **Omar Cossio** (presupuestos2@durata.co): cotizador mayor volumen
- **Camilo Araque** (araque@durata.co): gerente general
- **Daniela Galindo**: cotizadora
- **Oscar** (futuro usuario módulo compras): jefe de compras

### Preferencias del proyecto

- BD: híbrida (auto-limpiar seguro, marcar dudoso con sufijo `-REV`)
- Commits: conventional (feat/fix/chore) con referencias a bug IDs
- Tests antes de push siempre
- Trust but verify: nunca decir "está arreglado" sin verificar BD/UI
- Design fidelity: handoffs de Claude Design son la fuente de verdad visual

---

## URLs

- App: https://durata-crm.vercel.app
- Repo: https://github.com/jupramirezes/durata_crm
- Supabase: https://supabase.com/dashboard/project/qzgvhpxnlvesskibgqcg
- Vercel: https://vercel.com/juan-pablos-projects-16ae5c40/durata-crm
- Sentry: https://sentry.io/organizations/durata/issues/

---

## Docs del proyecto (estructura v2)

| Doc | Propósito |
|---|---|
| `README.md` | Índice del repo |
| `docs/HANDOFF.md` | **Este archivo** — estado + prompt inicio |
| `docs/GUIA_USUARIO.md` | Manual para los 5 cotizadores |
| `docs/ROADMAP.md` | Visión 2026-2028 + módulo compras |
| `docs/ENTREGA_V1.md` | Cumplimiento vs Documento Base |
| `docs/OPERACION.md` | Arquitectura + migración + backup + QA |
| `docs/QA_PROPIO.md` | Bugs abiertos + resueltos |
| `docs/SKILLS_RECOMENDADAS.md` | Herramientas y skills |
| `docs/_design-handoff/` | **Handoff Claude Design v2** (CRM rediseñado) |
| `docs/CQP_DURATA.zip/` | **Handoff CPQ + Compras** (sprint siguiente) |
| `docs/_privado/CONTEXTO_DESIGN.md` | Brief que se pegó a Claude Design v2 |
| `docs/_privado/CONTEXTO_DESIGN_COTIZACIONES.md` | Brief del módulo compras |
| `docs/_privado/PROPUESTA_ECONOMICA.md` | Propuesta para Camilo |
| `docs/plantillas-excel/` | Excels origen + DIAGNOSTICO_COTIZADOR.md |

---

## Skills custom del proyecto

En `.claude/skills/`:

- `durata-qa-invariants` — 8 checks SQL de integridad
- `durata-migrate` — pipeline diagnóstico → migrar → verificar
- `durata-dump-catalogo` — regenerar SQL de productos

Invocar: *"usa el skill `durata-qa-invariants`"*

---

## Memoria auto-cargada (punto-en-el-tiempo)

Claude Code carga automáticamente `C:/Users/USUARIO/.claude/projects/C--Personal-Negocios-DURATA-durata-crm/memory/MEMORY.md`. Claves:

- `project_overview.md` — qué es DURATA CRM
- `project_critical_analysis.md` — análisis crítico pre-demo (2026-04-15)
- `feedback_hybrid_data_cleanup.md` — estrategia limpieza BD híbrida

Las memorias tienen fecha: validar contra estado actual antes de actuar.
