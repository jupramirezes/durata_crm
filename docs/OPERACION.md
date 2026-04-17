# Operación — DURATA CRM

Guía operativa para tareas recurrentes: migración de datos, backup, QA, arquitectura técnica.

---

## 1. Arquitectura rápida

### Stack
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: Vercel con auto-deploy on push to `main`
- **Monitoreo**: Sentry

### Data flow
```
UI (React) → dispatch(ACTION) → Reducer (store.tsx) → sync → Supabase
                                                          ↓
                                                  Hidrata al recargar
```

### Rutas principales
- `/` — Dashboard (KPIs, alertas, top clientes, pipeline activo)
- `/pipeline` — Kanban 8 etapas drag&drop
- `/oportunidades/:id` — Detalle completo + productos + cotizaciones
- `/oportunidades/:id/configurar-producto/:pid` — ConfiguradorGenerico (Cárcamo, Pozuelo, etc.)
- `/oportunidades/:id/configurar` — ConfiguradorMesa (solo Mesa, con 3D)
- `/empresas` · `/empresas/:id` — Listado y detalle
- `/cotizaciones` — Listado global
- `/cotizaciones/:id/editar` — Editor con APU
- `/precios` — Maestro de precios
- `/config` — Configuración del sistema

### Tablas clave (Supabase)

| Tabla | Rows (abr 2026) | Descripción |
|---|---|---|
| `oportunidades` | 5,187 | Oportunidades comerciales, una por "COT" del Excel |
| `cotizaciones` | 5,190 | Cotizaciones (puede haber varias por oportunidad — A/B/C) |
| `empresas` | 2,303 | Clientes, con `sector` clasificado |
| `contactos` | 1,149 | Personas por empresa |
| `precios_maestro` | 1,408 | Materiales con precio, unidad, proveedor |
| `productos_catalogo` | 33 | Productos base + futuras plantillas |
| `producto_variables` | 430 | Variables por producto (largo, ancho, etc.) |
| `producto_materiales` | 746 | Materiales que usa cada producto |
| `producto_lineas_apu` | 796 | Líneas APU (insumos, MO, etc.) con fórmulas |
| `productos_oportunidad` | 0+ | Productos configurados por oportunidad (snapshot del APU) |
| `historial_etapas` | 90 | Log de cambios de etapa |
| `configuracion_sistema` | 5 | Configuraciones editables desde UI |

### Pipeline de 8 etapas

```
nuevo_lead → en_cotizacion → cotizacion_enviada → en_seguimiento → en_negociacion
                                                                         ↓
                                                         adjudicada | perdida | recotizada
```

La etapa `recotizada` es terminal alternativa — no cuenta en valor pipeline activo.

---

## 2. Migración de datos desde Excel

### Cuándo correr

- Cada semana o cuando llegue un REGISTRO actualizado
- Después de cambios masivos manuales al Excel

### Archivos necesarios (en `scripts/data/`)

- `REGISTRO_MAESTRO.xlsx` — histórico completo (hoja TOTAL)
- `REGISTRO COTIZACIONES DURATA 2026.xlsx` — cotizaciones año actual

### Comandos

```bash
# 1. Diagnóstico previo (NO modifica BD)
node scripts/_diag-migracion.mjs

# 2. Detecta oportunidades estancadas que deben avanzar
node scripts/_diag-estancadas.mjs

# 3. Migra (idempotente — se puede correr varias veces)
npm run migrate

# 4. Verificar conteos
npx tsx scripts/check-counts.ts
```

### Qué hace el script internamente

1. Lee estado actual Supabase
2. Lee 2 Excels (MAESTRO + 2026)
3. Inserta empresas nuevas (dedup por nombre lowercased)
4. Inserta contactos nuevos (dedup por nombre+empresa)
5. Inserta oportunidades nuevas (dedup por COT normalizado)
6. **PASO 5.5**: avanza ops estancadas en `nuevo_lead`/`en_cotizacion` cuando MAESTRO ya dice COTIZADA/ADJUDICADA/PERDIDA. Nunca retrocede etapa.
7. Enriquece 2026 con `fecha_envio`, `ubicacion`, `notas`
8. Inserta cotizaciones nuevas. **Ahora también detecta oportunidades existentes sin cotización y las crea** (fix crítico de mayo 2026).

**Garantías**: NUNCA borra datos. Solo inserta o actualiza lo que corresponde. Corrida 2× no duplica.

### Adjuntos APU/PDF (2026)

```bash
# Preview (sin subir nada)
node scripts/_migrate-adjuntos-2026.mjs --dry-run --fuzzy

# Ejecutar — sube a Supabase Storage
node scripts/_migrate-adjuntos-2026.mjs --fuzzy
```

Matchea archivos de la carpeta de red con cotizaciones en BD por número. `--fuzzy` permite match 2026-128A → 2026-128 si solo existe la base.

### Dump del catálogo (después de cambios)

```bash
node scripts/_dump-productos.mjs
```

Regenera `supabase/productos/_auto/*.sql` desde BD en vivo.

---

## 3. Backup

### Automático (Supabase Pro)

Supabase hace backups diarios automáticos si tienes plan Pro ($25/mes). Con tier gratuito **no hay backup automático**.

### Backup manual (plan gratuito — hoy)

**Cada viernes (5 min)**:

1. Abrir https://supabase.com/dashboard/project/qzgvhpxnlvesskibgqcg
2. Database → Backups → **Create backup** (botón arriba a la derecha)
3. Snapshot se guarda en tu cuenta Supabase
4. Puedes descargar el .sql si quieres copia offsite

### Restaurar desde backup

Desde el dashboard de Supabase → Backups → Restore. Restaura todo el proyecto al punto del snapshot.

### Recomendación

Cuando el CRM esté en uso diario, **pasar a plan Pro de Supabase** ($25/mes) para:
- Backups automáticos diarios
- Point-in-time recovery
- 7 días de retención de logs

---

## 4. QA — checklist para auditar el sistema

### Invariantes BD (ejecutar semanalmente)

Usar skill `durata-qa-invariants` o ejecutar este SQL:

```sql
SELECT
  'cot_asignado_0' AS inv, COUNT(*)::text AS val, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END AS status
  FROM oportunidades WHERE cotizador_asignado = '0'
UNION ALL
SELECT 'adj_sin_aprobada', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END
  FROM oportunidades o WHERE o.etapa='adjudicada' AND NOT EXISTS (SELECT 1 FROM cotizaciones c WHERE c.oportunidad_id=o.id AND c.estado='aprobada')
UNION ALL
SELECT 'perdida_con_aprobada', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END
  FROM oportunidades o WHERE o.etapa='perdida' AND EXISTS (SELECT 1 FROM cotizaciones c WHERE c.oportunidad_id=o.id AND c.estado='aprobada')
UNION ALL
SELECT 'valor_desync', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END
  FROM oportunidades o WHERE o.etapa NOT IN ('perdida','recotizada') AND o.valor_cotizado != COALESCE((SELECT SUM(c.total) FROM cotizaciones c WHERE c.oportunidad_id=o.id AND c.estado NOT IN ('descartada','rechazada')), 0)
UNION ALL
SELECT 'cot_sin_estado', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END FROM cotizaciones WHERE estado IS NULL OR estado = ''
UNION ALL
SELECT 'cot_numero_duplicado', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END
  FROM (SELECT 1 FROM cotizaciones GROUP BY numero HAVING COUNT(*)>1) t
UNION ALL
SELECT 'ops_huerfanas', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END
  FROM oportunidades WHERE empresa_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM empresas WHERE id = oportunidades.empresa_id);
```

Todos deben dar PASS. Si alguno falla, investigar.

### Tests automatizados

```bash
npm test -- --run
```

Debería dar **473/473 tests pass** al momento de la entrega v1.

### Build de producción

```bash
npm run build
```

Debe completar sin errores de TypeScript. Warning de chunk size >500KB es esperado (ConfiguradorMesa con Three.js).

### Prompt QA para Claude Code (investigar en profundidad)

Para auditoría exhaustiva, usar este prompt en una sesión nueva:

```
Actúa como QA Lead Senior de un CRM+CPQ en producción. Verifica:

1. Pipeline persistencia: crear opp → avanzar etapas → recargar → verificar BD
2. Recotización: hacer v2 con productos nuevos → confirmar que se guardan
3. Adjuntos: subir PDF y APU → descargar → verificar Storage
4. Dashboard: contra Excel MAESTRO cada métrica mensual
5. Invariantes BD: correr skill durata-qa-invariants
6. Edge cases: adjudicación/pérdida → revertir etapa → verificar estado cotización
7. Cross-user: login como Omar, crear opp → login como JP, verificar visibilidad
8. Config: cambiar fuente de lead → persistir tras F5

Para cada caso reporta: pasos, esperado, observado, query SQL de evidencia, severidad.
```

---

## 5. Deployment

### Auto-deploy
Cada push a `main` en GitHub triggerea build + deploy automático en Vercel. Typical: 2-3 min.

### Variables de entorno (Vercel Production)

```
VITE_SUPABASE_URL=https://qzgvhpxnlvesskibgqcg.supabase.co
VITE_SUPABASE_ANON_KEY=<jwt>
VITE_SENTRY_DSN=<dsn>
```

Si se necesita agregar variables:
```bash
npx vercel env add NOMBRE_VAR production
npx vercel deploy --prod
```

### Rollback

Si un deploy rompe producción:
1. Vercel dashboard → Deployments → elegir el anterior → Promote to production
2. O revertir el commit en Git: `git revert HEAD && git push`

---

## 6. Monitoreo de producción

### Sentry (errores runtime)

https://sentry.io/organizations/durata/issues/

Revisar 2-3 veces al día las primeras 2 semanas post-entrega. Cada error tiene stack trace, usuario afectado, navegador, etc.

### Vercel (logs de deploy)

https://vercel.com/juan-pablos-projects-16ae5c40/durata-crm

Logs de build y runtime functions.

### Supabase (queries lentas, uso)

https://supabase.com/dashboard/project/qzgvhpxnlvesskibgqcg

- Database → Query Performance: queries más lentas
- Usage: consumo mensual (free tier = 500MB DB, 1GB bandwidth)
- Auth → Users: usuarios activos

---

## 7. Skills custom del proyecto

Ubicación: `.claude/skills/`

| Skill | Uso |
|---|---|
| `durata-qa-invariants` | Ejecutar checks SQL de integridad |
| `durata-migrate` | Pipeline completo diagnóstico → migrar → verificar |
| `durata-dump-catalogo` | Re-dump de productos a SQL files |

Se invocan desde Claude Code con: "usa el skill `durata-qa-invariants`"

---

## 8. Cuando algo falla — troubleshooting rápido

| Síntoma | Probable causa | Fix |
|---|---|---|
| Dashboard muestra datos desactualizados | Cache del frontend | Click "Actualizar datos" o Ctrl+Shift+R |
| Build falla con TS error | `File` de lucide colisiona con `File` nativo, u otro import | Revisar imports con `as FooIcon` |
| Números Dashboard ≠ Excel | Script no migró filas o BD tiene fechas desalineadas | Correr `_diag-migracion.mjs` + `backfill` si es necesario |
| Cotización sin PDF | Storage falló silenciosamente | Revisar Sentry, ver logs de `uploadCotizacionFile` |
| Usuario no ve una oportunidad | RLS (auth.uid() IS NULL) | Verificar login activo |
| Blank screen | Error de runtime no capturado | Sentry debería tenerlo. Revisar. |

---

## 9. Contactos

- **Owner técnico**: JP Ramírez (rjuanpablohb@gmail.com)
- **Gerente comercial**: Sebastián Aguirre (saguirre@durata.co)
- **Gerente general**: Camilo Araque (araque@durata.co)
- **Cotizadores**: Omar Cossio, Daniela Galindo

### URLs
- App: https://durata-crm.vercel.app
- GitHub: https://github.com/jupramirezes/durata_crm
- Supabase: https://supabase.com/dashboard/project/qzgvhpxnlvesskibgqcg
- Vercel: https://vercel.com/juan-pablos-projects-16ae5c40/durata-crm
- Sentry: https://sentry.io/organizations/durata/issues/
