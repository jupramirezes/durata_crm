# Handoff — para la próxima sesión de Claude Code

Actualizado: 2026-04-15 23:XX (noche antes de la entrega)

## Cómo arrancar una sesión nueva sin perder contexto

### Paso 1: leer estos docs en orden
1. **CLAUDE.md** (si existe) — convenciones del proyecto
2. **docs/FLUJO_CRM.md** — arquitectura, rutas, pipeline de 7 etapas
3. **docs/HANDOFF.md** (este archivo) — estado actual
4. **docs/GUION_PRESENTACION_17ABR.md** — qué se mostró en la demo
5. **docs/GUIA_USUARIO.md** — qué deberían hacer los 5 usuarios
6. **docs/BACKLOG.md** — qué queda para después
7. **Memory en `C:\Users\USUARIO\.claude\projects\...\memory\MEMORY.md`** — auto-cargado por Claude Code

### Paso 2: pedirle a la nueva sesión
Pega este prompt al inicio:

```
Contexto: proyecto DURATA CRM+CPQ, entrega fue 17-abril-2026. Estoy
usándolo con 5 cotizadores. Leé docs/HANDOFF.md, docs/FLUJO_CRM.md y
la memory cargada antes de responder. Estoy en [describe qué necesitás].
```

---

## Estado al 16-abril 23:XX

### Último commit en main
- `30f81fd` fix(dashboard): días promedio mostraba '—' aunque hubiera datos
- `15797b6` fix(critical): restore valor_cotizado histórico
- `772538b` feat(ux): Sentry + 3 skills + CSS polish
- `d275614` fix(critical): blank screen Vercel
- `73c3695` Merge hardcore-moser (QA bug fixes)

### BD Producción (Supabase qzgvhpxnlvesskibgqcg)
- **Oportunidades: 5189** | **Cotizaciones: 5177** | **Empresas: 2304** | **Contactos: 1150**
- 8 invariantes SQL en 0 (verificar con skill `durata-qa-invariants`)
- 354 APUs + 379 PDFs del 2026 en Storage bucket `archivos-oportunidades`

### Deployment
- Vercel: https://durata-crm.vercel.app (auto-deploy on push to main)
- Variables env en Vercel: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SENTRY_DSN

### MCPs activos
- Supabase (qzgvhpxnlvesskibgqcg)
- Vercel
- Claude_in_Chrome, Claude_Preview
- Notion

### Skills instaladas en .claude/skills/
- `durata-migrate`
- `durata-qa-invariants`
- `durata-dump-catalogo`

---

## Qué quedó pendiente (prioridad de mañana en adelante)

### Monitoreo post-demo (primeras 48h)
- [ ] Revisar Sentry cada 2-3h por errores runtime
- [ ] Responder WhatsApp de los 5 usuarios rápido si reportan bugs
- [ ] Verificar cada día con `durata-qa-invariants` skill

### UX overhaul (~2 días, post-demo)
- Instalar shadcn/ui (ver docs/SKILLS_RECOMENDADAS.md)
- Reemplazar Button, Dialog, Dropdown, Toast custom con shadcn
- Auditar las 12 páginas contra checklist visual
- Mobile responsive (Pipeline especialmente)

### Backlog funcional (docs/BACKLOG.md)
1. **M7 + M13**: Imagen de producto por IA (Gemini Nano Banana). Requiere prompt + endpoint + integrar en PDF
2. **M10 parte 2**: si hay archivos adicionales (planos, fotos) más allá de APU/PDF
3. **M1**: Chat Dashboard (Claude API via Vercel Function) — 2-3 días
4. **M6**: mejoras APU descargado (requiere spec de JP)
5. **M4**: productos por familias con fotos (requiere las imágenes)
6. **E10 parte 2**: agregar/reordenar etapas desde config
7. **E4**: docs de proceso de actualización de precios

### Conocidos sin fixear
- Chunk size > 500KB (warning en build, no bloqueante). Solución: code-split con React.lazy
- 0 tests de concurrencia (dos usuarios editando la misma oportunidad)
- Sin backup automático (contratar Supabase PITR)

---

## Comandos útiles de referencia

```bash
# Dev
npm run dev                                    # Vite en :5173
npm test                                       # 346 tests
npm run build                                  # TypeScript + Vite bundle

# Data
npm run migrate                                # Desde Excel → Supabase (idempotente)
node scripts/_diag-migracion.mjs               # Preview sin tocar BD
node scripts/_diag-estancadas.mjs              # Detecta ops que deberían avanzar
node scripts/_dump-productos.mjs               # Re-dump catálogo a supabase/productos/_auto/
node scripts/_migrate-adjuntos-2026.mjs --dry-run --fuzzy   # Preview de migración de APU/PDF

# Git
git log --oneline -10                          # Últimos commits
git status -s                                  # Estado

# Supabase (usar MCP)
# Invariantes rápidos: skill durata-qa-invariants
```

---

## Personas / contexto

- **JP Ramírez**: owner técnico del proyecto + cotizador
- **Sebastián Aguirre**: gerente comercial, cotizador senior, aprobador
- **Omar Cossio**: cotizador con más volumen
- **Camilo Araque**: gerente general
- **Daniela Galindo**: cotizadora

### Preferencias de trabajo
- Estrategia de BD: híbrida (auto-limpiar lo seguro, marcar lo dudoso para revisión) — ver memoria `feedback_hybrid_data_cleanup`
- Commits: conventional (feat/fix/chore) con referencias a bug IDs
- Tests antes de push siempre

---

## URLs importantes
- App: https://durata-crm.vercel.app
- Vercel dashboard: https://vercel.com/dashboard (proyecto durata-crm)
- Supabase: https://supabase.com/dashboard/project/qzgvhpxnlvesskibgqcg
- Sentry: https://sentry.io/organizations/durata/issues/ (DSN configurado en .env y Vercel)
- GitHub: https://github.com/jupramirezes/durata_crm
