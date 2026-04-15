# DURATA CRM — Guía de flujo completo + QA Manual

**Audiencia**: cotizadores DURATA (OC, SA, JPR, CA, DG) y Juan Pablo (admin).
**Uso**: checklist para QA manual de la demo + referencia del proceso soportado.

---

## Arquitectura general

| Capa | Tech | Responsabilidad |
|---|---|---|
| UI | React 19 + Vite | SPA con rutas |
| Estado | Reducer (`store.tsx`) | Fuente única de verdad en memoria |
| Sync | `svcOportunidades`/`svcCotizaciones` | Persistencia a Supabase |
| BD | Supabase PostgreSQL | RLS `auth.uid() IS NOT NULL` en 14 tablas |
| Auth | Supabase Auth | email + password |

**Regla de oro**: cada acción del UI hace `dispatch(ACTION)` → reducer calcula nuevo estado → side effect persiste en BD. Al recargar, el estado se hidrata desde BD y debe ser idéntico al último `dispatch` (B-02 garantiza esto).

---

## Rutas

| Ruta | Página | Propósito |
|---|---|---|
| `/` | Dashboard | KPIs, alertas de seguimiento, top clientes |
| `/pipeline` | Pipeline | Kanban de 7 etapas, drag-and-drop |
| `/empresas` | Empresas | Listado con filtro por sector |
| `/empresas/:id` | EmpresaDetalle | Contactos + oportunidades de la empresa |
| `/oportunidades/:id` | OportunidadDetalle | Detalle de una oportunidad, cotizaciones asociadas, acciones |
| `/oportunidades/:id/configurar` | ConfiguradorMesa | Wizard 3D de mesas con APU |
| `/oportunidades/:id/configurar-producto/:pid` | ConfiguradorGenerico | Wizard genérico (cárcamo, estantería, etc.) |
| `/cotizaciones` | Cotizaciones | Listado global |
| `/cotizaciones/:id/editar` | CotizacionEditor | Editar líneas, generar PDF |
| `/precios` | Precios | Consultar precios_maestro |
| `/precios/importar` | PreciosImportar | Upload Excel de precios |
| `/config` | Configuracion | Variables del sistema |

---

## Pipeline: 7 etapas

```
nuevo_lead (0)
  ↓
en_cotizacion (1)
  ↓
cotizacion_enviada (2)
  ↓
en_seguimiento (3)
  ↓
en_negociacion (4)
  ↓
adjudicada (5) | perdida (5)
```

**Regla**: MOVE_ETAPA nunca retrocede en el script de migración. El UI sí permite retroceder manualmente (drag-and-drop).

---

## Flujo 1 — Cotización nueva desde cero

| # | Acción | Dispatch | Efecto esperado en BD | Checkpoint visual |
|---|---|---|---|---|
| 1 | Crear empresa "X SAS" desde `/empresas` | `ADD_EMPRESA` | Row en `empresas` con `sector` default "Sin clasificar" | Empresa aparece en listado |
| 2 | Agregar contacto "Juan" a empresa | `ADD_CONTACTO` | Row en `contactos` con empresa_id | Contacto visible en EmpresaDetalle |
| 3 | Crear oportunidad desde EmpresaDetalle | `ADD_OPORTUNIDAD` | Row en `oportunidades` etapa=`nuevo_lead` | Aparece columna "Nuevo Lead" del pipeline |
| 4 | Abrir oportunidad → "Agregar producto" → Configurador | `ADD_PRODUCTO` | Row en `productos_oportunidad` | Producto visible en sidebar de oportunidad |
| 5 | Generar cotización | `ADD_COTIZACION` | Row en `cotizaciones`; etapa auto a `en_cotizacion` | Cotización visible; pipeline movida |
| 6 | Editar cotización → Generar PDF | `UPDATE_COTIZACION` (estado='enviada') + `MOVE_ETAPA` | `estado='enviada'`, `fecha_envio=hoy`; etapa=`cotizacion_enviada` | PDF se descarga |
| 7a | Cliente acepta → Drag a "Adjudicada" | `MOVE_ETAPA` (nuevaEtapa='adjudicada', valor_adjudicado, fecha_adjudicacion) | Oportunidad etapa=`adjudicada`; cotización estado=`aprobada` | Modal pide valor + fecha; card se mueve |
| 7b | Cliente rechaza → Drag a "Perdida" | `MOVE_ETAPA` (nuevaEtapa='perdida', motivo_perdida) | Oportunidad etapa=`perdida`, `motivo_perdida`; cotización estado=`rechazada` | Modal pide motivo |

**Verificaciones al recargar (B-02)**:
- `etapa` persiste ✓
- `valor_cotizado` sidebar muestra total correcto (C-01) ✓
- Cotización mantiene su `estado` ✓

---

## Flujo 2 — Recotización

Caso típico: cliente pide ajuste después de recibir la cotización.

| # | Acción | Dispatch | Efecto |
|---|---|---|---|
| 1 | En cotización 2026-100, click "Recotizar" | `RECOTIZAR` (cotizacionId, nuevoNumero='2026-100A', newCotId) | Original → estado=`descartada`; nueva creada estado=`borrador` con mismo total |
| 2 | Editar 2026-100A (cambiar líneas) | `UPDATE_COTIZACION` | total cambia; `valor_cotizado` de oportunidad se actualiza (C-01) |
| 3 | Enviar PDF y marcar `enviada` | igual que Flujo 1 paso 6 | — |
| 4 | Volver a recotizar 2026-100A → 2026-100B | `RECOTIZAR` otra vez | 100A pasa a descartada; 100B es la nueva activa |
| 5 | Adjudicar | `MOVE_ETAPA` | 100B=aprobada; 100 y 100A se mantienen descartada (F7 test) |

**Regla clave (C-03)**: `descartada` persiste en BD, se muestra como "descartada" en la UI.

---

## Flujo 3 — Múltiples cotizaciones activas

Caso: 2 o más cotizaciones enviadas al mismo cliente (no recotizaciones, sino alternativas) — ej. con y sin instalación.

| # | Acción | Dispatch | Efecto |
|---|---|---|---|
| 1 | Enviar 2026-200 (opción A) | normal | `estado=enviada` |
| 2 | Enviar 2026-201 (opción B) | normal | `estado=enviada` |
| 3 | Cliente elige B → en OportunidadDetalle click "Marcar como ganadora" sobre 2026-201 | `UPDATE_COTIZACION` estado='aprobada' | 2026-201 queda marcada |
| 4 | Drag a "Adjudicada" | `MOVE_ETAPA` | Reducer respeta `aprobada` pre-seleccionada; 2026-200 → `rechazada` (F4 test) |

**Garantía (bug encontrado hoy + fixed)**: si una cotización ya fue marcada `aprobada` antes del MOVE_ETAPA, el reducer NO la pisa con otra. La selección del usuario gana.

---

## Flujo 4 — Migración de datos históricos

Para JP (admin).

```bash
# Desde el repo:
npm run migrate
```

El script [`scripts/migrar-historico.ts`](../scripts/migrar-historico.ts) es **additive-only + advance-stalled**:

| Paso | Qué hace |
|---|---|
| 1 | Lee estado actual de Supabase (empresas, contactos, ops, cotizaciones) |
| 2 | Lee 2 Excels: `REGISTRO_MAESTRO.xlsx` + `REGISTRO COTIZACIONES DURATA 2026.xlsx` |
| 3 | Inserta empresas nuevas (dedup case-insensitive por nombre) |
| 4 | Inserta contactos nuevos (dedup por nombre + empresa_id) |
| 5 | Inserta oportunidades nuevas (dedup por COT normalizado) |
| **5.5** | **Avanza etapa de ops estancadas** cuando MAESTRO tiene COTIZADA/ADJUDICADA/PERDIDA y la op en BD sigue en `nuevo_lead`/`en_cotizacion`. Nunca retrocede. |
| 6 | Enriquece 2026 con `fecha_envio`, `ubicacion`, `notas` (solo avanza etapa si es strictly greater) |
| 7 | Inserta cotizaciones nuevas |

**Diagnóstico pre-migración**:
```bash
node scripts/_diag-migracion.mjs
# o para ops estancadas:
node scripts/_diag-estancadas.mjs
```

---

## QA manual — Checklist rápido antes de presentar

- [ ] Login con `saguirre@durata.co` → ver Dashboard con KPIs
- [ ] Login con `presupuestos2@durata.co` → ver las mismas oportunidades (RLS — B-01)
- [ ] Pipeline: contar cards por etapa coincide con KPI del Dashboard
- [ ] Sidebar de una oportunidad con cotización: muestra valor total (no $0) — C-01
- [ ] Crear empresa nueva → aparece en listado con sector "Sin clasificar"
- [ ] Filtrar empresas por sector "Construcción" (101 empresas) — A-03
- [ ] Crear oportunidad nueva → etapa `nuevo_lead`
- [ ] Agregar producto desde configurador → oportunidad avanza a `en_cotizacion` (A-02)
- [ ] Generar cotización → botón "Marcar como enviada" → avanza a `cotizacion_enviada`
- [ ] Recotizar → original pasa a `descartada`, nueva queda activa con mismo total
- [ ] Drag a "Adjudicada" → modal pide valor (pre-llenado con cotización activa) + fecha (default hoy)
- [ ] Drag a "Perdida" → modal pide motivo con opciones: Precio, Tiempo, Competencia, **Proyecto congelado**, **Licitación del cliente** (A-08)
- [ ] Recargar página → estado persiste 100% (B-02)

---

## Bugs estado actual (post-sesión 2026-04-15)

### ✅ Corregidos y verificados en código + BD
B-01 (RLS), B-02 (reducer sync), B-03 (id fantasma), C-01 (rollup $0), C-02 (adjudicar ganadora), C-03 (descartada persiste), C-04 (eliminado duplicar), C-05 (productos manuales), C-06 (14 empresas "POR IDENTIFICAR"), C-07 (credenciales), A-01, A-02, A-03 (871 empresas autoclasificadas), A-04, A-07, A-08 + bug nuevo descubierto en QA E2E (selección de ganadora manual respetada).

### 🟡 Pendientes (no bloqueantes para demo)
- A-05: cotizaciones históricas no editables (MVP acceptable)
- A-06: catálogo versionado (3 de 30+ productos — esfuerzo mayor)
- M-01 a M-15: mejoras UX varias
- P-01 a P-04: features sin probar (APU Excel línea, adjuntos E2E)

### Drift aceptado
- 6 COTs `-A` solo en BD (recotizaciones históricas sin reflejo en Excel)
- 10 oportunidades sin COT en BD (creadas desde UI como `nuevo_lead`)

---

## Equipo

| Alias BD | Nombre | Rol |
|---|---|---|
| OC | Omar Cossio | Cotizador (mayor volumen) |
| SA | Sebastián Aguirre | Gerente comercial + cotizador + aprobador |
| JPR | Juan Pablo Ramírez | Cotizador + ingeniero de proceso |
| CA | Camilo Araque | Gerente General + cotizador |
| DG | Daniela Galindo | Cotizador |
