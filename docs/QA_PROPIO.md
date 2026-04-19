# QA propio — DURATA CRM

**Actualizado:** 2026-04-18 (QA-4 pre-merge redesign v2)
**Sesiones de QA:** QA-1 (antes de demo), QA-2 (post-demo 16-abr), QA-3 (cierre v1), **QA-4 (pre-merge redesign v2, 2026-04-18)**

---

## 1. Bugs activos (para sprint de cierre)

### Mejoras de UX pendientes

| # | Descripción | Severidad | Notas |
|---|---|---|---|
| D-07 | Adjuntar imagen por producto → aparece en PDF con header "Imagen alusiva" y mejor layout | Crítico | Ya genera columna IMAGEN en PDF, falta mejorar layout |
| D-16 | Cotizador genérico igualar flexibilidad Excel | Mejora mayor | APU editable con celdas dependientes + guardar como plantilla |
| UX-01 | Overhaul UI con shadcn/ui | Importante | Percepción profesional |
| UX-02 | Modales más grandes y espaciados | Medio | Feedback de cotizadores |
| UX-03 | Notificación al guardar cotización | Medio | Toast visible con resumen |
| UX-04 | Exportar todos los datos desde /config | Medio | CSV/Excel de todas las tablas |
| UX-05 | Plan de onboarding interactivo | Medio | Para usuarios nuevos |

### Productos pendientes (12)

**Ola 4 — autoservicios y otros (7)**:
- [ ] Autoservicio Trampa de Grasa
- [ ] Autoservicio Trampa de Yesos
- [ ] Autoservicio Baño María
- [ ] Autoservicio Frío
- [ ] Estufa con Patas
- [ ] Basurera Espacio Público
- [ ] Revestimiento

**Especiales (5)**:
- [ ] Pozuelo Pedestal Válvula
- [ ] Cubiertero
- [ ] Mesa Neutra Autoservicio
- [ ] Divisiones de Baño WC (a Piso + Cantiliver)
- [ ] Passthrough / BBQ

Proceso por producto: mapear Excel → definir variables → SQL → verificar cálculo vs Excel (<1% diff). ~30 min c/u.

---

## 2. Bugs resueltos (con SHA)

### Bloqueantes originales (pre-demo)

| Bug | Descripción | SHA fix |
|---|---|---|
| B-01 | Data loss RLS presupuestos2 | `65ef0b2` |
| B-02 | Sync reducer/Supabase se pierde | `56a0261` |
| B-03 | Recotización id fantasma | `bcd1672` |

### Críticos (pre-demo)

| Bug | Descripción | SHA fix |
|---|---|---|
| C-01 | Valor cotizado $0 sidebar | `0667b82` + `15797b6` |
| C-02 | Adjudicar no marca ganadora | `73c3695` + `34b043c` |
| C-03 | Descartada no persiste en BD | `639270c` |
| C-04 | Duplicar + Recotizar colisionan | `c89c7d7` |
| C-05 | Productos manuales no persisten | `e9c6b65` |
| C-06 | Empresas con notas en nombre | SQL migration |
| C-07 | Credenciales expuestas | `271dfb6` |

### Altos (pre-demo)

| Bug | Descripción | SHA fix |
|---|---|---|
| A-01 | Ubicación no se muestra | `e9c6b65` |
| A-02 | Etapa no avanza al cotizar | `9babefc` |
| A-03 | Empresas sin sector | `50156f8` + migración |
| A-04 | Estado cotizaciones null | `2f48922` |
| A-06 | Catálogo no versionado | `_auto/` (33 productos) |
| A-07 | Schema drift | `271dfb6` |
| A-08 | Espacios en COT | `2f48922` |

### Post-demo (D-XX)

| Bug | Descripción | SHA fix |
|---|---|---|
| D-01 | Editar producto lleva a mesas | `463d9cd` |
| D-02 | Recotización no carga productos nuevos | `463d9cd` |
| D-03 | PDF/APU auto-save | `f187590` + `9d14bd4` |
| D-04 | Config no persiste | `463d9cd` |
| D-05 | Configurar primer producto va a mesas | `463d9cd` |
| D-06 | APU consolidado multi-producto | `3951acc` + `463d9cd` |
| D-07 | Adjuntar imagen por producto (parcial) | `9d14bd4` — pendiente ajuste layout |
| D-08 | Pipeline search por # COT + contacto | `3951acc` |
| D-09 | Abril no cuadra con Excel | `705d94b` (backfill + timezone fix) |
| D-10 | Fuente "Residente" | `463d9cd` + SQL |
| D-11 | Etapa Recotizada/Consolidada | `9d14bd4` |
| D-12 | Revivir cotizaciones descartadas | `f187590` |
| D-13 | Botón guardar precios | `463d9cd` |
| D-14 | Panel cotizaciones sin botón Editar | `9d14bd4` |
| D-15 | Crear contacto desde oportunidad | `3951acc` |

### Otros resueltos

| Item | Descripción | SHA |
|---|---|---|
| M-01 | Modal adjudicación sin valor prefill | `05ad282` |
| M-09 | Días promedio vacío | `30f81fd` + `81fea56` (timezone) |
| E-03 | # COT en pipeline cards | `86cfc8a` |
| M-09b | Orden pipeline | `86cfc8a` |
| E-10 | Editar etapas pipeline | `ef9fea6` |
| M-14 | Descripciones productos | `44b9f5e` |
| Dashboard timezone | new Date('2026-04-01') caía en marzo | `81fea56` |
| Script migrate | Ops existentes sin cotización no se creaban | `06a7958` |
| Dashboard backfill | fecha/fecha_envio/total 100% match Excel | `705d94b` + backfill SQL |

---

## 3. Backlog por priorizar (ver ROADMAP.md para detalle)

### Prioridad Alta — sprint cierre v1 (mayo)

- UI/UX overhaul con shadcn/ui
- Feature "Guardar como plantilla"
- D-07 completar layout PDF con imagen
- Videotutorial
- 12 productos faltantes

### Prioridad Media — Fase 2 (jun-ago 2026)

- M1: Chat Dashboard con Claude API
- M4: Productos por familias con fotos
- M6: APU mejorado
- M7: Imagen render 3D → PDF
- M10: Adjuntos auto por # cotización (parcial hecho)
- M13: Imágenes con IA (Nano Banana)
- E4: Doc estandarización precios
- Notificaciones email/WhatsApp
- Proyectos post-adjudicación
- Intake estructurado

### Prioridad Baja / futuro (ver ROADMAP)

- Módulo Almacén
- Módulo Compras
- Portal cliente
- App móvil PWA
- Multi-tenant (venta externa)

---

## 4. Lecciones de QA

1. **Timezone bugs son sutiles**: `new Date('YYYY-MM-DD')` parsea como UTC. En Colombia (UTC-5) desplaza día al mes anterior. Siempre usar parse local para fechas-sólo-fecha.
2. **Mantener BD y Excel alineados fila por fila**: diffs agregados (totales mensuales) ocultan problemas. Validar por cotización individual.
3. **Cache del frontend**: el store hidrata una vez al montar. Si mutás BD por SQL directo, el usuario necesita F5 o botón "Actualizar datos".
4. **Los bugs de QA interno no son los de uso real**: las demos con usuarios reales encontraron 16 bugs que 346 tests no detectaron.
5. **Valor entregado vs tiempo invertido**: documentar ambos. El bono $1M del proyecto es menor que el valor de mercado de lo construido ($36-61M).
6. **Scripts de migración deben re-verificarse periódicamente**: un bug silencioso (ops sin cotización) afectó reportes durante semanas.

---

## 5. Para el próximo QA dispatch

Cuando se haga la próxima ronda de QA exhaustiva, usar este prompt en una sesión nueva de Claude Code:

```
Actúa como QA Lead Senior. Audita el sistema DURATA CRM en producción
(https://durata-crm.vercel.app) verificando:

FLUJOS CRÍTICOS:
1. Crear oportunidad → configurar Cárcamo (no mesa) → editar producto → guardar
2. Recotizar → agregar nuevo producto → generar PDF → verificar que incluye nuevo
3. Adjudicar → revertir etapa → confirmar estado cotización limpio
4. Login como Omar → crear opp → login como JP → confirmar visibilidad (RLS)
5. Generar PDF → verificar en Supabase Storage + archivo_pdf_url en cotización

DATOS vs EXCEL:
- Dashboard mensual Ene-Abr 2026 debe dar 97/132/126/39 cots y los valores exactos
- Total 2026: 394 cots / $9,735,844,154

INVARIANTES (via skill durata-qa-invariants):
- 8/8 PASS

EDGE CASES:
- Cot con fecha '2026-04-01' debe clasificarse como ABRIL (timezone)
- Borrador con total 0 NO cuenta en KPIs
- Cotización descartada NO cuenta en valor_cotizado
- Etapa 'recotizada' NO cuenta en pipeline activo

Reporta: pasos, esperado, observado, severidad, query SQL evidencia.
```

---

## 6. QA-4 — pre-merge redesign v2 + alineación MAESTRO (2026-04-18)

### ESTADO FINAL — RESUELTO ✓

Tras el dispatch de 4 agentes QA se detectó `valor_desync=14` que destapó un problema mayor: **la BD tenía data legado que NO estaba en el MAESTRO**. Se ejecutó limpieza completa + alineación MAESTRO ↔ Supabase con paridad 100% para los 5 años de histórico.

**Resultado tras 17 UPDATEs + 1 UNIQUE constraint + 1 trigger:**

| Check | Antes | Final |
|---|---|---|
| `valor_desync` | 14 | **0 ✓** |
| `adj_sin_aprobada` | 0 | **0 ✓** |
| `perdida_con_aprobada` | 0 | **0 ✓** |
| `cot_numero_duplicado` | 0 | **0 ✓** |
| `cot_sin_estado` | 0 | **0 ✓** |
| `ops_huerfanas` | 0 | **0 ✓** |
| `ops_sin_empresa` | — | **0 ✓** |
| `cot_asignado_0` | 0 | 13 (fiel a MAESTRO, NO es bug) |

**Cross-check final MAESTRO ↔ Supabase (ver `scripts/_check-cots-maestro.mjs`):**

| Año | MAESTRO cots | Supa cots | Δ cots | MAESTRO $ | Supa $ | Δ $ |
|---|---|---|---|---|---|---|
| 2021 | 152 | 152 | **0** | 9,260,368,893 | 9,260,368,893 | **$0** ✓ |
| 2022 | 1,130 | 1,130 | **0** | 41,104,054,889.308 | 41,104,054,889.308 | **$0** ✓ |
| 2023 | 1,209 | 1,209 | **0** | 25,230,330,410 | 25,230,330,410 | **$0** ✓ |
| 2024 | 1,237 | 1,237 | **0** | 39,829,492,218 | 39,829,492,218 | **$0** ✓ |
| 2025 | 1,035 | 1,035 | **0** | 28,911,682,688 | 28,911,682,688 | **$0** ✓ |
| 2026 | 394 | 394 | **0** | 9,735,844,154 | 9,735,844,154 | **$0** ✓ |
| **TOT** | **5,157** | **5,157** | **0** | **$154,071,773,252.308** | **$154,071,773,252.308** | **$0** ✓ |

Dashboard 2026 mes por mes:

| Mes | MAESTRO | Supa | Δ cots | MAESTRO $ | Supa $ | Δ $ |
|---|---|---|---|---|---|---|
| Ene | 97 | **97** | 0 | 1,620,173,712 | **1,620,173,712** | **$0** ✓ |
| Feb | 132 | **132** | 0 | 2,780,599,549 | **2,780,599,549** | **$0** ✓ |
| Mar | 126 | **126** | 0 | 4,553,893,496 | **4,553,893,496** | **$0** ✓ |
| Abr | 39 | **39** | 0 | 781,177,397 | **781,177,397** | **$0** ✓ |

*Nota: 24 filas con año=1900 en MAESTRO son filas con fecha corrupta en Excel — no se migran por diseño.*

### 6.0.1 Acciones ejecutadas (en orden cronológico)

1. **9 cots legado `-N`** (`2021-1208B-1..B-8`, `2021-1172A`) → `descartada`. NO estaban en MAESTRO.
2. **1173B** → `enviada` (fiel a MAESTRO: COTIZADA — no rechazada)
3. **2026-271A + 2026-427** → `aprobada` (MAESTRO: ADJUDICADA)
4. **7 cots `-HIST*` + `2025-739A`** → `descartada` (legado no-MAESTRO)
5. **3 cots 2021 rechazadas sin fecha** + **5 cots 2026 rechazadas vacías** → `descartada`
6. **UNIQUE constraint** en `cotizaciones.numero`
7. **Trigger `sync_oportunidad_valor_cotizado`** en AFTER INSERT/UPDATE/DELETE
8. **Recalculo global** de `oportunidades.valor_cotizado` (4 opps actualizadas)
9. **2 opps** `perdida → adjudicada` (efecto de corregir 271A/427)
10. **7 opps legado** `adjudicada → perdida` (sus cots `-HIST` fueron descartadas)

### 6.0.2 Defensas permanentes aplicadas

| Capa | Qué hace | Previene |
|---|---|---|
| **UNIQUE** en `cotizaciones.numero` | Postgres rechaza duplicados por número | Dupes futuros |
| **Trigger** `sync_oportunidad_valor_cotizado` | Recalcula `opp.valor_cotizado` en AFTER INSERT/UPDATE/DELETE cots | Desync silencioso |
| **`upsert`** con `onConflict:'numero'` en `migrar-historico.ts` L686 | Idempotencia real del script | Re-corridas accidentales |
| **WARN huérfanas** nuevo bloque en migrar-historico PASO 7.5 | Log de cots activas en BD ausentes de MAESTRO | Detecta deriva futura |

### 6.0.3 Script de cross-check reutilizable

`scripts/_check-cots-maestro.mjs` — compara MAESTRO.TOTAL vs Supabase. Reporta:
- A: cots con total=0
- B: conteos+sumas año por año
- C: Dashboard 2026 mes por mes
- D: cots en BD ausentes de MAESTRO
- E: cots en MAESTRO ausentes de BD
- F: mismatches de total/fecha en 2026

Correrlo cuando:
- Se corrija el MAESTRO
- Se sospeche de deriva
- Después de cualquier script de migración

---

## 6. QA-4 — pre-merge redesign v2 (reporte original del dispatch)

**Branch:** `feat/redesign-v2` · **SHA base:** `761448b` (post cherry-pick fix 53 TS errors)

Ejecutado con dispatch de 4 agentes en paralelo + humo visual manual. Objetivo: validar mergeable a `main` y enviable a los 5 cotizadores.

### 6.1 Resultado global

| Check | Status | Bloqueante entrega |
|---|---|---|
| `npm run build` | ✅ Limpio en 28s | — |
| `npm test -- --run` | ✅ 854/854 pass (82 archivos) | — |
| Smoke visual (console + network) | ✅ Zero errors, zero 4xx/5xx | — |
| Invariantes BD (7/8) | ✅ PASS | — |
| Invariante `valor_desync` | 🟡 14 ops afectadas | **Sí — fix antes de enviar** |
| Sentry últimas 24h | ⚠️ Chequeo manual pendiente | No — revisar post-deploy |
| Vercel runtime logs 24h | ✅ Zero errores 5xx | — |
| Supabase errores Postgres | 🟡 2 errores (`numero_op`, `precios`) | No — NO es frontend (grep vacío en `src/`) |
| Tokens v2 residuales | 🟡 ~95 violaciones cosméticas | No — backlog post-entrega |

### 6.2 Hallazgo bloqueante — `valor_desync = 14`

14 oportunidades con `valor_cotizado` desincronizado vs `SUM(cotizaciones.total WHERE estado NOT IN (descartada,rechazada))`.

Patrones observados:
- **3 ops** en etapa `cotizacion_enviada` con `valor_cotizado=0` pero cotizaciones activas por $7.3M–$29.4M → trigger de update no corrió al crear cots
- **11 ops** en etapa `adjudicada` con `valor_op` exactamente la mitad de `suma_cots` → doble conteo: probable cot aprobada + cot extra activa sin marcar descartada

IDs top: `cad0f425…`, `5c9d62b9…`, `c629584f…`.

**Fix propuesto** (SQL, reversible vía backup Supabase):
```sql
UPDATE oportunidades o
SET valor_cotizado = COALESCE((
  SELECT SUM(c.total)
  FROM cotizaciones c
  WHERE c.oportunidad_id = o.id
    AND c.estado NOT IN ('descartada','rechazada')
), 0)
WHERE o.etapa != 'perdida'
  AND o.id IN (<14 ids>);
```

### 6.3 Hallazgos NO bloqueantes para entrega

**Supabase Postgres logs (24h):**
- `column o.numero_op does not exist` — query con columna inexistente. Grep en `src/`: **0 matches**. Origen probable: script admin o query manual en Supabase Studio. Investigar en Fase 2.
- `relation "precios" does not exist` — código usa nombre viejo. Grep en `src/`: **0 matches** (el frontend usa `precios_maestro`). Mismo diagnóstico.

**Nombres de tablas en HANDOFF.md (actualizar doc):**
- HANDOFF dice "precios" → real: `precios_maestro`
- HANDOFF dice "productos" → real: `productos_catalogo`

**Drift natural dashboard 2026:**
- Esperado (abr): 394 cots / $9.73B
- Observado (hoy 18-abr): 408 cots / $9.73B → drift = +14 cots del mes en curso, total exacto

### 6.4 Tokens v2 residuales — backlog cosmético post-entrega

**Total violaciones:** ~95 hits en 20 archivos.

**Distribución por categoría:**
- Colores legacy (`bg-slate-*`, `bg-gray-*`, `text-slate-*`, hex hardcoded `#334155`/`#64748b`/`#e2e8f0`): **45+ hits**
- Sombras residuales (`shadow-sm`, `shadow-lg`, `shadow-2xl`, `hover:shadow-*`, custom): **20 hits**
- Border-radius off-spec (`rounded-xl`, `rounded-2xl`): **18 hits**
- Padding excessive (`p-8`, `p-10`): **6 hits**
- CSS inline gradients hardcoded: **2 hits**
- Otros (rounded-full en spinners): **4 hits**

**Top 3 archivos con más residuos:**
1. `src/pages/ConfiguradorGenerico.tsx` — 35+ hits (colores slate/gray en toda la UI)
2. `src/pages/OportunidadDetalle.tsx` — 12 hits (sombras modales + colores cards/badges)
3. `src/pages/Mesa3DViewer.tsx` — 10 hits (hex hardcoded + sombras overlay)

**5 quick-wins para sprint de pulido (cubren ~70%):**
| # | Fix | Archivos | Cobertura |
|---|---|---|---|
| 1 | Replace `bg-slate-*`/`text-slate-*` → CSS vars | ConfiguradorGenerico, SpreadsheetPrototype, OportunidadDetalle | 37% |
| 2 | Remove `shadow-*` → `var(--shadow-*)` o nada | Login, Toast, Mesa3DViewer, ConfiguradorGenerico, OportunidadDetalle | 21% |
| 3 | Replace `rounded-xl/2xl` → `var(--radius-lg)` en cards | ConfiguradorGenerico, ConfiguradorMesa, OportunidadDetalle | 13% |
| 4 | Replace hex hardcoded → CSS vars | Mesa3DViewer | 7% |
| 5 | Reducir `p-8`/`p-10` → `p-5`/`p-6` | App, ConfiguradorGenerico, ConfiguradorMesa | 6% |

**Decisión pendiente (no arreglar ciego):**
- `rounded-full` en badges/pills: handoff lo permite en badges circulares → mantener
- `rounded-full` en spinners: OK → mantener
- Hex hardcoded en Mesa3DViewer canvas 3D: podrían ser intencionales por WebGL → validar con diseño

### 6.5 Humo visual manual (JP, 2026-04-18)

Login real con Omar + recorrido 1 cotización end-to-end.

| Paso | Esperado | Observado | OK? |
|---|---|---|---|
| Login Omar | Dashboard carga | _pendiente de completar_ | ? |
| Crear oportunidad | Form valida, guarda | _pendiente_ | ? |
| Configurar Cárcamo | Editor abre, guarda | _pendiente_ | ? |
| Generar PDF | Descarga + Supabase Storage | _pendiente_ | ? |
| Adjudicar | Marca ganadora, cot estado limpio | _pendiente_ | ? |
| RLS cross-user (JP ve opp de Omar) | Visible | _pendiente_ | ? |
| Cronómetro cotización | <3 min | _pendiente_ | ? |

_(Completar esta tabla después del humo visual)_

### 6.6 Plan de cierre post-QA-4

1. **Fase 2 — bloqueantes (15 min)**
   - Ejecutar UPDATE `valor_desync=14`
   - `grep -r "numero_op\|from.*['\"]precios['\"]" scripts/` → identificar script roto
   - Actualizar HANDOFF.md con nombres correctos tablas

2. **Fase 3 — quick-wins cosméticos (2h)**
   - Top 30 violaciones de alta severidad (colores + sombras en 5 archivos top)
   - Build + tests tras cada batch

3. **Fase 4 — pulido final (2-3h, sprint siguiente)**
   - 65 violaciones restantes (radius, padding, hex hardcoded)
   - Validación visual pantalla por pantalla

4. **Merge `feat/redesign-v2` → `main`**
5. **Deploy Vercel automático**
6. **Enviar guía + link + audio a los 5 cotizadores**

### 6.7 Comandos de evidencia

```bash
# Reproducir QA-4 localmente
git checkout feat/redesign-v2
git log --oneline -1                    # debe mostrar 761448b
npm run build                           # debe dar ✓ en ~28s
npm test -- --run                       # debe dar 854/854

# Verificar valor_desync post-fix
# (vía Supabase MCP o psql directo)
```

- QA Manual Juan Pablo
* En pantalla de oportunidad modal "Actividad" debería aparecer a la derecha solo hora y fecha (Formato estandar de cada actividad registrada). Además no corresponde exactamente el formato con el del durata-redesign (Más completo). Lo mismo para el modal cotizaciones (Como se ven los adjuntos en el durata-redesign vs en el actual, colores, posición, tamaño de archivo y demás, TODO). Verificar tambien modal productos en cuanto a diseño (en la descripción debería mostrar la descripcion completa), que sea exacto y lo mismo modal adjuntos.
* En la pantalla de la oportunidad los botones arriba a la derecha (Donde está Nota, Producto, Mover etapa), debería ser igual que durata-redesign, que incluye Adjunto (Para adjuntar archivos). Además encima del nombre está apareciendo un código (No sé a qué corresponde ese codigo), pero además tal como en durata-redesign, debería aparecer el numero de la oportunidad sobre la cual se está trabajando (Año-numero_op). 
* Al dar "Agregar producto", en la pantalla auxiliar que sale, tiene aún un estilo viejo no concordante con el nuevo diseño, debería tener iconos acordes a cada producto (Tener en cuenta que esto está en backlog, clasificar los productos en familias y tener imagen para cada uno).
* La pantalla de configurador no la alcanzó a diseñar del todo el redesign, pero quiero que seas proactivo y basado en el diseño actual, hacerla más clara y visualmente atractiva, además de agregarle funcionalidades que le permitan al usuario configurar mejor los productos e información más relevante en los headers.
* En en PDF generado el header de las imagenes debe ser "IMAGEN ALUSIVA", además el Valor unitario está quedando montado sobre la descripción cuando se agrega imagen al PDF, revisar muy bien este formato
* Algo relevante, en este momento, en Durata, cuando genero un APU y un PDF de una cotización queda cada uno en su carpeta, luego si quiero buscar esa oportunidad, si es el APU busco en la carpeta el número, pero lo más util a hoy es buscar en la carpeta de PDFs por ejemplo "Gabinete" para saber cuando hice un gabinete y tomarlo como base si es que voy a hacer otro gabinete (O si quería buscar esa cotización y solo me acordaba que es un gabinete). Por lo tanto a hoy buscar una cotización pór el nombre del PDF de la misma e smuy facil y util. Con el sistema, no me queda tan claro esta facilidad ni como queda guardado el repositorio de APUs y PDfs para su busqueda futura.
* Al dar en el botón "Recotizar", pasa a descartada la versión original, pero de nuevo, no se puede identificar en ningún lugar en la pantalla en que número de oportunidad estoy trabajando en ese momento, además dar en "Recotizar" ya me aparece la oportunidad con 2 cotizaciones (Bien), pero la de la nueva oportunidad aparece como 0 productos y $0, lo cual no es correcto, ya que al darle en "Abrir" si muestra que tiene como base los productos ya cotizados en la versión anterior. Al ir a "generar cotización en esta recotizada", aparece en el asside derecho y arriba junto al número los botones de las versiones, está bien, pero la original debe aparecer como V0 o algo distinto, a hoy aparece como vA ambas 
* Cuando agrego un producto manual queda con nombre "Otro (Manual)" debería ser otra cosa.
* Al generar recotizaciones, el modal actividad se desordena (Revisar muy bien como se ordena la línea de tiempo de lo que se va haciendo), por ejemplo la CotA quedo con fecha anterior a la original, no tiene sentido 8verificar que fechas y horas sean actualizada en Bogotá
* Algo muy relevante al recotizar, al generar la recotización, esta (La de letra A o B o lo que corresponda), se mueve a la etapa "Recotizada/Consolidada", cuando lo que debería pasar es que a esa etapa se mueva la cotización original (O las originales si es que fueron varias cotizaciones), por que esas ya no van a sumar para el total y quedan como descartadas y la ultima recotización (O la que esté activa de las de la oportunidad), debe quedar en "Cotización enviada" porque es la activa que si suma (O si se marca como adjudicada o perdida obvio en la etapa que corresponda) 
* Al dar en duplicar una cotización (Para crear una nueva oportunidad basada en esta), debería preguntarme el mismo proceso de creación de oportunidad, empresa, contacto, etc, solo que pasando como base esta duplicada. Además al duplicarla no se están duplicando los productos y cotización que es lo importante, que se duplique todo y ya editar como corresponda a la nueva oportunidad
* En panel Empresas, a hoy el botón Crear empresa y exportar no funcionan
* Me di cuenta que a hoy, las cotizaciones historicas importadas (Solo las de 2026 que son las que se cruzan con Cotizaciones 2026), tienen en notas, el nombre del proyecto, por lo menos como se guardó en el excel y ahoy eso no aparece en la info de la oportunidad. Dejar en Backup
* En backup, en precios está botón importar csv de precios pero no sé si está funcionando bien, igual va en mejora con sistema CPQ y nuevas mejoras de compras

* Como queda el APU y como se guarda y demás es de los backlogs más relevantes a tener en cuenta
* Corregir en supabase (Y en el config) el correo de Camilo araque, es araque@durata.co
* Quiero hacer un video de Guía- Usuario pero no sé como
* Uno de los backups del sistema como tal más relevantes (Bueno varios), es poder migrar mejor la información al sistema de las cotizaciones históricas, porque todas tiene un PDF con los datos de los productos cotizados, su o sus APUs, información de contactos, muy relevante para la base de datos de durata pero a hoy solo se migran las columnas de excel. Además de que se pierde la información de los APUs y PDFs hay que estandarizar sectores de las empresas y contactos, a hoy fue muy manual y hay contactos redundantes, muchas empresas mal sectorizadas, y cosas a corregir muchas
* La guía de usuario debe estar actualizada y para gente no técnica en el sistema sino en el flujo de cotización y comercial
* La guia a hoy dice que al agregar un producto manual se calcula el APU y esto es mentira, a hoy solo se pide descripción, valor cantidad y unidad, no se calcula el APU, solo se agrega el producto.