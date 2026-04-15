# Backlog post-entrega (17-abril-2026)

Items del QA de JP que quedan para después de la entrega. Agrupados por categoría de esfuerzo y valor.

## 🔴 Grandes — requieren diseño/integración (>1 día)

### M1 — Chat en Dashboard que responde preguntas de datos
**Esfuerzo**: 2-3 días
**Stack**: Claude API + prompt engineering sobre el schema de Supabase + RAG sobre notas/historial
**Valor**: alto para gerencia (reportes verbales "¿cuánto se adjudicó en marzo?")
**Plan**:
- Integrar `@anthropic-ai/sdk` via Vercel Function
- System prompt con schema + descripción de tablas
- Function calling para queries SQL restringidas (read-only, WHERE auth.uid())
- Render de respuesta + tabla de datos debajo

### M4 — Productos por familias con fotos (selector visual)
**Esfuerzo**: 2 días
**Archivos**: `ProductSelectorModal.tsx` (nuevo) + agregar `imagen_url` a `productos_catalogo`
**Plan**:
- Subir 33 imágenes de productos a Supabase Storage
- Grid agrupado por `grupo` (Mesas, Pozuelos, Campanas, etc.)
- Cada card con foto + nombre + click para configurar
- Reemplaza dropdown actual

### M6 — APU descargado mejoras (producto/dimensiones/material/fórmulas/formato/código)
**Esfuerzo**: 1-2 días
**Archivo**: `src/lib/exportar-apu.ts`
**Requerimiento**: JP debe especificar exactamente qué campos faltan. Plan:
- Agregar hoja 2 "Metadatos" con producto_id, variables, dimensiones calculadas
- Columna de código de material + código interno DURATA
- Fórmulas activas (no valores) cuando aplique (preserva auditoria)
- Formato tabular consistente con el Excel viejo

### M7 — Generar imagen del producto desde botón → PDF
**Esfuerzo**: 1 día
**Archivos**: `ConfiguradorMesa.tsx` / `ConfiguradorGenerico.tsx` + `generar-pdf.ts`
**Plan**:
- Botón "Capturar render 3D" en configurador → `canvas.toDataURL()` → guardar en `productos_oportunidad.imagen_render`
- PDF layout con imagen en el encabezado del producto (120x120px)

### M10 — Guardar info cotización identificada por # (APU + PDF) + transferir en recotización
**Esfuerzo**: 1-2 días
**Archivo**: extender `cotizaciones` schema (nuevo `adjuntos_json jsonb` o tabla `cotizacion_adjuntos`)
**Plan**:
- Migración schema
- Al recotizar, copiar referencias a adjuntos de la cotización original
- UI para listar adjuntos de cotización específica (no solo de oportunidad)

### M13 — Imágenes con API Nano Banana
**Esfuerzo**: 1 día
**Stack**: Fal.ai nano-banana endpoint, inference async
**Plan**: prompt del producto + dimensiones → genera imagen 3D render → sube a Storage → asigna a `productos_oportunidad.imagen_render`

### M14 — Mejorar descripciones productos generadas
**Esfuerzo**: medio día
**Archivo**: `src/lib/evaluar-formula.ts` (template condicional `[var:true|false]`)
**Plan**: auditar los 33 productos y mejorar `desc_template` con condicionales más expresivos (basado en feedback de JP sobre las descripciones actuales)

---

## 🟡 Medios — feasibles en una sesión

### E4 — Estandarizar proceso de actualización de precios
**Esfuerzo**: 2 horas
**Tipo**: documentación
**Plan**:
- Doc `docs/ACTUALIZACION_PRECIOS.md` con:
  - Quién actualiza precios (roles)
  - Frecuencia (semanal/mensual)
  - Fuente canónica (hoja Excel maestra? cotizaciones proveedores?)
  - Checklist pre/post upload
  - Cómo usar `/precios/importar` con validaciones
- Agregar `updated_by` columna a `precios_maestro` para auditoría

### E10 (parte 1) — Editar etapas del pipeline desde Configuración
**Esfuerzo**: 3-4 horas
**Archivos**: `Configuracion.tsx` + tabla nueva `etapas_config` o JSON en `configuracion_sistema`
**Plan**:
- Persistir lista de etapas (label, color, orden, activa)
- UI drag-and-drop para reordenar
- Cambiar `ETAPAS` hardcoded a lectura desde `configuracion_sistema.clave='etapas'`
- Migración de defaults
- **Caveat**: requiere re-probar reducer MOVE_ETAPA con etapas dinámicas

---

## Mejoras técnicas sugeridas (no del QA de JP)

- **Code splitting**: bundle actual 2.1MB → code-split por ruta con `React.lazy`
- **Unused_index cleanup**: después de 1-2 semanas de producción, el advisor de Supabase mostrará cuáles de los 6 índices FK realmente se usan
- **Leaked password protection**: habilitar en Supabase Auth dashboard (1 click)
- **Test coverage**: extender `qa-flujo-completo.test.ts` con escenarios que aparezcan en QA dispatch
- **Monitoreo**: agregar Sentry o similar para capturar errores en producción (actualmente solo `console.log`)

---

## Referencias
- [QA_JP.md](QA_JP.md) — QA manual original de JP
- [QA_DISPATCH_PROMPT.md](QA_DISPATCH_PROMPT.md) — prompt para QA E2E automatizado
- [FLUJO_CRM.md](FLUJO_CRM.md) — documentación del flujo completo
- [project-memory feedback_hybrid_data_cleanup](../../Users/USUARIO/.claude/projects/C--Personal-Negocios-DURATA-durata-crm/memory/) — convención para limpiezas BD
