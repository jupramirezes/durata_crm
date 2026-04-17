# QA propio — DURATA CRM

**Actualizado:** 2026-05-XX (cierre entrega v1)
**Sesiones de QA:** QA-1 (antes de demo), QA-2 (post-demo 16-abr), QA-3 (cierre v1)

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
