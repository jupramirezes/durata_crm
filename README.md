# DURATA CRM + CPQ

Sistema interno de CRM + cotización automática para **DURATA S.A.S.** (fabricante de mobiliario en acero inoxidable).

**App en producción:** https://durata-crm.vercel.app

---

## ¿Qué es esto?

Reemplaza un Excel de 45 MB de cotizaciones con un sistema web que:

- **Cotiza automáticamente** 33 productos en minutos (Mesa, Cárcamo, Pozuelo, Campana, etc.)
- **Gestiona pipeline comercial** de 8 etapas con drag&drop
- **Genera PDFs profesionales** + APU Excel consolidado en un click
- **Dashboard en tiempo real** con KPIs conciliados 100% con el Excel histórico
- **Trazabilidad** de 5,190 cotizaciones históricas (2021-2026)

---

## Stack

- **Frontend:** React 19 + TypeScript + Vite + TailwindCSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Vercel (auto-deploy on push to `main`)
- **Monitoreo:** Sentry

---

## Setup local (2 minutos)

```bash
git clone https://github.com/jupramirezes/durata_crm.git
cd durata_crm
npm install

# Configurar .env (pedir credenciales a JP si no las tienes)
cp .env.example .env
# Editar .env con VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SENTRY_DSN

npm run dev
# → http://localhost:5173
```

---

## Documentación

| Documento | Para quién |
|---|---|
| [docs/GUIA_USUARIO.md](docs/GUIA_USUARIO.md) | Cotizadores (Omar, Sebastián, JP, Camilo, Daniela) — flujo diario |
| [docs/ENTREGA_V1.md](docs/ENTREGA_V1.md) | Gerencia — cumplimiento del Documento Base del Proyecto |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Visión 2026-2028 — estado + futuro |
| [docs/HANDOFF.md](docs/HANDOFF.md) | Próxima sesión de desarrollo — estado técnico |
| [docs/OPERACION.md](docs/OPERACION.md) | Arquitectura + migración + backup + QA |
| [docs/QA_PROPIO.md](docs/QA_PROPIO.md) | Bugs abiertos + resueltos con SHAs |
| [docs/SKILLS_RECOMENDADAS.md](docs/SKILLS_RECOMENDADAS.md) | Herramientas y tooling |

---

## Comandos clave

```bash
npm run dev          # Dev server (http://localhost:5173)
npm test -- --run    # 473 tests automáticos
npm run build        # Build de producción
npm run migrate      # Migrar datos desde Excel (idempotente)

# Diagnóstico
node scripts/_diag-migracion.mjs      # Preview migración (no modifica BD)
node scripts/_diag-estancadas.mjs     # Ops que deberían avanzar de etapa
node scripts/_dump-productos.mjs      # Re-dump catálogo a SQL
```

---

## Estado actual

- **Versión:** v1 (entregada mayo 2026)
- **Tests:** 473/473 pass
- **Invariantes BD:** 8/8 PASS
- **Productos operables:** 33/33 (12 pendientes fase 2)
- **Datos:** 5,187 oportunidades · 5,190 cotizaciones · 2,303 empresas · 1,408 precios

---

## Contacto

**Owner técnico:** Juan Pablo Ramírez — rjuanpablohb@gmail.com
**Gerente General DURATA:** Camilo Araque — araque@durata.co
**Gerente Comercial:** Sebastián Aguirre — saguirre@durata.co
