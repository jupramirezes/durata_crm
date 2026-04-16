# DURATA CRM+CPQ — BUGS CONSOLIDADO

## Actualizado: 16 abril 2026 (post-demo)
## Fuentes: QA Sesiones 1-3, Auditoría Codex, Auditoría Claude Code, Bugs históricos, Demo 16-abr

---

## Estado resumen

- **Bloqueantes originales (B-01 a B-03):** Todos resueltos
- **Críticos originales (C-01 a C-07):** Todos resueltos
- **Bugs nuevos de demo 16-abr:** 15+ bugs activos, varios bloqueantes para producción real

---

## 🔴 BLOQUEANTES NUEVOS (demo 16-abr-2026)

### D-01: Editar producto lleva a ConfiguradorMesa en vez del producto real
- **Estado:** ACTIVO
- **Descripción:** Al editar un producto agregado (ej: Cárcamo) en una oportunidad, el botón "Editar" navega a ConfiguradorMesa (mesas) en vez del ConfiguradorGenerico con el producto correcto.
- **Impacto:** No se pueden editar productos ya configurados. Solo sirve para mesas.
- **Archivos probables:** routing en OportunidadDetalle.tsx (botón editar producto)

### D-02: Recotización no carga productos nuevos en nueva versión
- **Estado:** ACTIVO
- **Descripción:** Al recotizar, si agrego nuevos productos a la versión A/B y le doy "Generar cotización", solo lee los productos de la cotización original, no los nuevos. Los nuevos productos no se crean realmente en la nueva cotización.
- **Impacto:** Las recotizaciones con cambios de alcance (agregar/quitar productos) no funcionan.

### D-03: PDF y APU generados no quedan guardados en la oportunidad
- **Estado:** ACTIVO
- **Descripción:** Al generar PDF de cotización, este se descarga al disco local pero NO queda guardado dentro de la oportunidad en el sistema. Lo mismo con el APU Excel. Deberían quedar como adjuntos accesibles desde la oportunidad.
- **Impacto:** No hay trazabilidad de qué se envió al cliente. Cada vez hay que regenerar.
- **Relacionado:** M10 (adjuntos por cotización) — schema existe (archivo_apu_url, archivo_pdf_url) pero el flujo de generar PDF no los guarda automáticamente.

### D-04: Configuración no guarda cambios (fuentes de lead, etc.)
- **Estado:** ACTIVO
- **Descripción:** En el panel de Configuración, al agregar nueva fuente de lead (u otras opciones) y dar "Guardar cambios", aparece confirmación visual pero los datos NO persisten. Al salir y volver, desaparecen. No aparecen en el dropdown de crear oportunidad.
- **Archivos probables:** Configuracion.tsx, useConfiguracion.ts — verificar que el INSERT/UPDATE a configuracion_sistema funciona y que el hook re-hidrata

### D-05: "Configurar primer producto" va directo a mesas
- **Estado:** ACTIVO
- **Descripción:** En una oportunidad nueva, el botón "Configurar primer producto" navega directamente al ConfiguradorMesa en vez de abrir el selector de productos.
- **Archivos probables:** OportunidadDetalle.tsx — la ruta debería ser al selector modal, no a `/oportunidades/:id/configurar`

---

## 🟠 CRÍTICOS NUEVOS (demo 16-abr-2026)

### D-06: APU consolidado faltante (multi-producto)
- **Estado:** ACTIVO
- **Descripción:** Si una cotización tiene 5 productos, debería generar un libro Excel con las 5 hojas APU consolidadas + APU individual descargable por producto. Hoy solo genera APU individual.
- **Impacto:** Cotizaciones multi-producto no tienen APU unificado como el Excel actual.

### D-07: Falta botón "adjuntar imagen" por producto en editor de cotización
- **Estado:** ACTIVO
- **Descripción:** Al editar cotización para generar PDF, cada producto necesita un botón para importar imagen que aparezca en el PDF junto al producto. Es paso intermedio mientras se implementa generación de imagen con IA.
- **Impacto:** PDFs salen sin imagen de producto — inferior al proceso actual en Excel.

### D-08: Pipeline busca solo por empresa, no por # COT ni contacto
- **Estado:** ACTIVO — parcial
- **Descripción:** El buscador del Pipeline solo filtra por empresa. Debería buscar también por número de cotización y nombre de contacto.
- **Nota:** Ctrl+K (búsqueda global) sí busca por COT y contacto, pero el filtro inline del pipeline no.

### D-09: Abril no cuadra con Excel registro (valores y días promedio)
- **Estado:** ACTIVO
- **Descripción:** Los datos del mes de abril, al cruzarlos con el Excel REGISTRO, no dan el mismo valor total cotizado ni los mismos días promedio. Posible error en importación o en lectura de datos.
- **Impacto:** Desconfianza en los KPIs del Dashboard.

### D-10: Falta fuente de lead "Residente"
- **Estado:** ACTIVO
- **Descripción:** Cuando el residente trae el lead, no hay opción para registrarlo como fuente. Agregar "Residente" a la lista de fuentes de lead.
- **Fix:** Agregar a FUENTES_DEFAULT en types/index.ts + INSERT en configuracion_sistema.

### D-11: Estado "recotizada/consolidada" como nueva etapa
- **Estado:** ACTIVO — requiere diseño
- **Descripción:** Cuando se recotiza o consolidan varias cotizaciones, las versiones anteriores no deberían ir a "Perdida" (infla cifra) sino a una nueva etapa "Recotizada" o "Consolidada" que NO sume al valor cotizado total.
- **Impacto:** El pipeline muestra valor total inflado por recotizaciones que cuentan como perdidas.
- **Complejidad:** Requiere nueva etapa en pipeline + lógica de no-sum + posibilidad de "revivir" una versión anterior si el cliente cambia de opinión.

### D-12: Revivir cotizaciones descartadas
- **Estado:** ACTIVO — requiere diseño
- **Descripción:** Si se recotiza A→B pero el cliente aprueba la A original, se necesita poder "revivir" A y descartar B. Al aprobar una versión, las otras deberían pasar a "recotizada" (no "perdida").

### D-13: Panel precios — botón guardar no funciona, solo Enter
- **Estado:** ACTIVO
- **Descripción:** Al editar un precio en /precios y dar click en "Guardar", no pasa nada. Solo funciona si se presiona Enter.
- **Archivos probables:** Precios.tsx — el onClick del botón guardar.

### D-14: Panel cotizaciones — utilidad y ordenamiento
- **Estado:** ACTIVO
- **Descripción:** En /cotizaciones, el botón "Editar" abre editor pero como son importadas no permite editar. No queda clara la utilidad. Además, no se puede ordenar por headers de columna (lo mismo en precios y empresas).

### D-15: Contacto editable desde oportunidad — verificar flujo completo
- **Estado:** ACTIVO — verificar
- **Descripción:** Si una oportunidad no tiene contacto, se debe poder asignar uno existente O crear uno nuevo (y que quede ligado a la empresa). Si se actualizan datos del contacto, deben actualizarse también en la empresa.

### D-16: Cotizador genérico "muy pobre" vs Excel
- **Estado:** ACTIVO — mejora mayor
- **Descripción:** El ConfiguradorGenerico debe ser tan flexible como Excel: crear productos nuevos desde el sistema (agregar variables, fórmulas, cálculos), revisar y mejorar descripciones generadas, mejor visualización. Hoy para un producto nuevo hay que ir a Excel y subirlo.
- **Impacto:** Si el cotizador no iguala la flexibilidad del Excel, los usuarios no migran.

---

## ✅ BLOQUEANTES ORIGINALES — RESUELTOS

### B-01: Data loss — RLS presupuestos2 ~~[ABIERTO]~~
- **Resuelto:** `65ef0b2` fix(rls): use auth.uid() IS NOT NULL
- **Verificado:** RLS funciona para todos los usuarios autenticados

### B-02: Divergencia reducer/Supabase ~~[ABIERTO]~~
- **Resuelto:** `56a0261` fix(sync): persist every reducer-side state change
- **Verificado:** 52 tests cubren sincronización (commit `2bc46d5`)

### B-03: Recotización — id fantasma ~~[ABIERTO]~~
- **Resuelto:** `bcd1672` fix(recotizacion): eliminate ghost-id bug
- **Verificado:** Test de recotización pasa

---

## ✅ CRÍTICOS ORIGINALES — RESUELTOS

### C-01: Valor cotizado $0 en sidebar ~~[ABIERTO]~~
- **Resuelto:** `0667b82` + `15797b6` fix(critical): restore valor_cotizado historico
- **Verificado:** 8/8 invariantes QA PASS

### C-02: Adjudicar no marca cotización ganadora ~~[ABIERTO]~~
- **Resuelto:** `73c3695` Merge hardcore-moser + `34b043c` yaAprobada sync
- **Verificado:** Test qa-bug-fixes.test.ts

### C-03: Estado "descartada" no persiste ~~[ABIERTO]~~
- **Resuelto:** `639270c` feat: recotización flow with auto-discard
- **Verificado:** Recotización test pasa

### C-04: Duplicar + Recotizar crean números colisionados ~~[ABIERTO]~~
- **Resuelto:** `c89c7d7` Merge flujo-recotizaciones
- **Verificado:** "Duplicar en esta oportunidad" eliminado

### C-05: Productos manuales no persisten ~~[ABIERTO]~~
- **Resuelto:** `e9c6b65` fix(ux): manual products persist
- **Verificado:** Producto manual escribe a productos_oportunidad

### C-06: Empresas con notas en vez de nombre ~~[ABIERTO]~~
- **Resuelto:** SQL migration — 14 empresas "POR IDENTIFICAR" limpiadas
- **Verificado:** 0 empresas con nombre chatarra

### C-07: Credenciales expuestas ~~[ABIERTO]~~
- **Resuelto:** `271dfb6` fix(seguridad+schema): placeholders in .env.example
- **Verificado:** .env.example tiene placeholders, scripts usan env vars

---

## ✅ ALTOS ORIGINALES — RESUELTOS

### A-01: Ubicación no se muestra → `e9c6b65`
### A-02: Etapa no se mueve al crear cotización → `9babefc`
### A-03: Empresas sin sector → migración (871 auto-clasificadas) + `50156f8`
### A-04: Estado cotizaciones null → SQL migration `2f48922`
### A-05: Cotizaciones históricas no editables → aceptado MVP (isHydrated guard `34b043c`)
### A-06: Catálogo no versionado → `supabase/productos/_auto/` (33 productos dump)
### A-07: Schema drift productos_cliente → `271dfb6`
### A-08: Espacios en COT → `2f48922` normalización SQL

---

## ✅ MEDIOS/BAJOS ORIGINALES — RESUELTOS

### M-01: Modal adjudicación no sugiere valor → `05ad282` (valor prefill + fecha)
### M-02: Cotizaciones borrador tras adjudicar → cubierto por C-02
### M-08: Camilo Araque falta en Dashboard → agregado en configuración
### M-09: Columna Días Prom. vacía → `30f81fd` fix(dashboard)
### E3: # COT en pipeline cards → `86cfc8a`
### M9: Dropdown Orden pipeline (7 criterios) → `86cfc8a`
### E10: Editar etapas pipeline desde Configuración → `ef9fea6`
### M14: Descripciones productos mejoradas → `44b9f5e` (33 templates)
### Buscador COT → oportunidad completa → `86cfc8a`

---

## 🟡 MEDIOS — SIGUEN PENDIENTES

### M-03: Errores migración nombres contactos [QA-BUG-19]
### M-04: Valores decimales largos en APU [BUG-08]
### M-05: Falta botón "Crear empresa" desde listado [UX-06]
### M-06: Sin confirmación eliminar oportunidad [UX-07]
### M-07: Fecha actualización precios [UX-08]
### M-10: Falta paginación en tablas [BUG-10]
### M-11: Diseño no responsive [BUG-06]
### M-12: Fechas "31/12/1969" — cotizaciones con fecha_envio=null muestran epoch
### M-13: Precios negativos aceptados [BUG-003]
### M-14: Sin límite dimensiones configurador [BUG-005]
### M-15: 417 materiales sin precio (29.6%) [BUG-009]
### L-01: Logout doble click [QA-BUG-02]
### L-02: Nombre default producto en PDF genérico [QA-BUG-13]

---

## ❓ PENDIENTES DE VERIFICAR

### P-01: APU Excel por línea [QA-BUG-14]
### P-02: Adjuntos upload end-to-end
### P-03: Variables calculadas crashean UI
### P-04: Addon margen push pedal → `7a3baa9` (verificar funcionalidad completa)

---

## 📊 Conteo final

| Categoría | Cantidad |
|---|---|
| Bloqueantes nuevos (demo 16-abr) | 5 |
| Críticos nuevos (demo 16-abr) | 11 |
| Bloqueantes originales resueltos | 3/3 |
| Críticos originales resueltos | 7/7 |
| Altos originales resueltos | 8/8 |
| Medios pendientes | 13 |
| Por verificar | 4 |
| **Total activos** | **16** |
