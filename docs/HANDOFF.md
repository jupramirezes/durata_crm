# Handoff — para la próxima sesión de Claude Code

Actualizado: 2026-04-16 (post-demo, sprint estabilización)

## Cómo arrancar una sesión nueva

### Paso 1: leer estos docs en orden
1. **docs/FLUJO_CRM.md** — arquitectura, rutas, pipeline de 7 etapas
2. **docs/HANDOFF.md** (este archivo) — estado actual
3. **docs/QA_PROPIO.md** — bugs activos post-demo
4. **docs/BUGS_CONSOLIDADO.md** — todos los bugs con SHAs
5. **docs/BACKLOG.md** — roadmap funcional
6. **Memory** — auto-cargada por Claude Code

### Paso 2: prompt de inicio
```
Contexto: proyecto DURATA CRM+CPQ, post-demo 16-abr-2026. Hay 10 bugs
activos de la demo (docs/QA_PROPIO.md). Leé docs/HANDOFF.md y
docs/FLUJO_CRM.md antes de responder. Estoy en [describe qué necesitás].
```

---

## Estado al 16-abril-2026

### Último commit
```
6786c0d fix(config,apu,docs): nombre APU simplificado + config feedback + docs consolidados
463d9cd fix(D-01,D-02,D-03,D-04,D-10,D-13): 6 bugs demo resueltos + UI/UX roadmap
4630bc2 docs: bugs consolidado + QA propio + roadmap actualizado post-demo 16-abr
```

### Stats
- **Tests:** 473/473 pass (46 archivos)
- **Invariantes BD:** 8/8 PASS
- **Productos:** 33/33 operables
- **BD:** 5,188 ops | 5,176 cots | 2,304 empresas | 1,150 contactos
- **Auth:** 3 usuarios activos (saguirre, presupuestos2, rjuanpablohb) — faltan araque, dgalindo

### Deployment
- **Vercel:** https://durata-crm.vercel.app (auto-deploy on push)
- **Env vars:** VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SENTRY_DSN
- **Sentry:** activo en producción

### Bugs resueltos esta sesión
D-01 (routing productos), D-02 (recotización snapshot), D-03 (PDF/APU auto-save),
D-04 (config persist), D-08 (pipeline search), D-10 (fuente Residente),
D-13 (botón guardar precios), D-15 (crear contacto desde oportunidad)

### Bugs abiertos (ver QA_PROPIO.md para detalle)
D-06, D-07, D-09, D-11, D-12, D-16

---

## Comandos útiles

```bash
npm run dev          # Vite en :5173
npm test             # 473 tests
npm run build        # TypeScript + Vite bundle
npm run migrate      # Excel → Supabase (idempotente)

# Diagnóstico
node scripts/_diag-migracion.mjs
node scripts/_diag-estancadas.mjs
node scripts/_dump-productos.mjs
```

### Skills
- `durata-qa-invariants` — 8 checks SQL
- `durata-migrate` — pipeline migración
- `durata-dump-catalogo` — dump productos

---

## Personas
- **JP Ramírez**: owner técnico + cotizador
- **Sebastián Aguirre**: gerente comercial, aprobador
- **Omar Cossio**: cotizador mayor volumen
- **Camilo Araque**: gerente general
- **Daniela Galindo**: cotizadora

### Preferencias
- BD: híbrida (auto-limpiar seguro, marcar dudoso)
- Commits: conventional (feat/fix/chore)
- Tests antes de push siempre

---

## URLs
- App: https://durata-crm.vercel.app
- Supabase: https://supabase.com/dashboard/project/qzgvhpxnlvesskibgqcg
- Sentry: https://sentry.io/organizations/durata/issues/
- GitHub: https://github.com/jupramirezes/durata_crm
