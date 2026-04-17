# Handoff — próxima sesión de Claude Code

**Actualizado**: 2026-05-XX (post-entrega v1, pre-sprint cierre)
**Último commit**: `705d94b` (Dashboard 100% match Excel MAESTRO)

---

## Prompt de inicio recomendado

Pegar al empezar una nueva sesión de Claude Code en el repo:

```
Contexto: Proyecto DURATA CRM+CPQ. Acabo de cerrar la entrega v1 al equipo
comercial (feb-may 2026). Ahora estoy en [describe qué necesitás].

Antes de responder, leé:
- docs/HANDOFF.md — estado actual
- docs/ROADMAP.md — visión + pendientes
- docs/QA_PROPIO.md — bugs abiertos
- docs/OPERACION.md — arquitectura + migración + QA

Memoria del proyecto: auto-cargada por Claude Code.
```

---

## Estado al cerrar entrega v1

### Stats verificadas

- **Tests**: 473/473 pass en 46 archivos
- **Build**: OK (warning bundle size >500KB esperado por Three.js)
- **Invariantes BD**: 8/8 PASS
- **Productos**: 33/33 operables (12 pendientes Ola 4 + especiales)
- **BD prod**: 5,187 ops · 5,190 cots · 2,303 empresas · 1,149 contactos · 1,408 precios
- **Usuarios auth**: 4 activos
- **Adjuntos**: 354 APUs + 379 PDFs (2026)

### Dashboard conciliado con Excel MAESTRO

Ene-Abr 2026 exacto:
- Ene: 97 / $1,620,173,712
- Feb: 132 / $2,780,599,549
- Mar: 126 / $4,553,893,496
- Abr: 39 / $781,177,397
- **Total**: 394 / $9,735,844,154 ✓

---

## Bugs resueltos en la última iteración

Ver `QA_PROPIO.md` para lista completa con SHAs.

Highlights últimas 2 semanas:
- D-01 a D-15 resueltos (editor producto, recotización, config persiste, etc.)
- Timezone bug Dashboard (new Date('2026-04-01') → marzo en Colombia)
- Bug script migrate (ops existentes sin cotización no se creaban)
- Backfill BD 5,157 cotizaciones desde Excel MAESTRO (fechas + DIAS correctos)
- Dashboard usa `fecha_envio` (alinea con Excel MES COTIZACIÓN)

---

## Sprint de cierre pendiente (mayo 2026)

Ver `ROADMAP.md` sección 2. Pendientes para entrega final:

1. [ ] D-07 imagen por producto con header "Imagen alusiva"
2. [ ] D-16 cotizador genérico igualar flexibilidad Excel
3. [ ] UI/UX overhaul con shadcn/ui
4. [ ] Feature "Guardar como plantilla"
5. [ ] 12 productos faltantes (Ola 4 + especiales)
6. [ ] Videotutorial
7. [ ] Export completo desde /config

---

## Comandos útiles

```bash
npm run dev          # Vite :5173
npm test -- --run    # 473 tests
npm run build        # TS + Vite bundle
npm run migrate      # Excel → Supabase (idempotente)

# Diagnóstico
node scripts/_diag-migracion.mjs
node scripts/_diag-estancadas.mjs
node scripts/_dump-productos.mjs
```

---

## Personas

- **JP Ramírez** (rjuanpablohb@gmail.com): owner técnico + cotizador
- **Sebastián Aguirre** (saguirre@durata.co): gerente comercial, aprobador
- **Omar Cossio** (presupuestos2@durata.co): cotizador mayor volumen
- **Camilo Araque** (araque@durata.co): gerente general
- **Daniela Galindo**: cotizadora

### Preferencias del proyecto

- BD: híbrida (auto-limpiar seguro, marcar dudoso con sufijo -REV)
- Commits: conventional (feat/fix/chore) con referencias a bug IDs
- Tests antes de push siempre
- Trust but verify: nunca decir "está arreglado" sin verificar BD/UI

---

## URLs

- App: https://durata-crm.vercel.app
- Repo: https://github.com/jupramirezes/durata_crm
- Supabase: https://supabase.com/dashboard/project/qzgvhpxnlvesskibgqcg
- Vercel: https://vercel.com/juan-pablos-projects-16ae5c40/durata-crm
- Sentry: https://sentry.io/organizations/durata/issues/

---

## Docs del proyecto (estructura consolidada)

| Doc | Propósito |
|---|---|
| `README.md` | Índice del repo |
| `docs/GUIA_USUARIO.md` | Manual para los 5 cotizadores |
| `docs/ROADMAP.md` | Estado + visión 2026-2028 |
| `docs/ENTREGA_V1.md` | Cumplimiento vs Documento Base (para gerencia) |
| `docs/OPERACION.md` | Arquitectura + migración + backup + QA |
| `docs/QA_PROPIO.md` | Bugs abiertos + resueltos |
| `docs/HANDOFF.md` | Este archivo |
| `docs/SKILLS_RECOMENDADAS.md` | Herramientas y skills |
| `docs/_privado/` | No versionado (propuesta económica, etc.) |

---

## Skills custom disponibles

En `.claude/skills/`:

- `durata-qa-invariants` — 8 checks SQL de integridad
- `durata-migrate` — pipeline diagnóstico → migrar → verificar
- `durata-dump-catalogo` — regenerar SQL de productos

Invocar en Claude Code: *"usa el skill `durata-qa-invariants`"*
