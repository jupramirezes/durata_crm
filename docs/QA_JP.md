# QA manual de JP — consolidado y priorizado

Fuente: `P:\Cotización\...\QA propio.txt`
Fecha: 2026-04-15

## Triage

| # | Código | Descripción corta | Severidad | Esfuerzo | Archivo probable |
|---|---|---|---|---|---|
| 1 | **JP-E2** | Recotizar crea nueva con sufijo A/B, pero "Generar cotización" sugiere consecutivo # + 1 → duplicada + fecha día anterior | 🔴 Bloqueante | M | `useCotizaciones.ts` / `CotizacionEditor.tsx` |
| 2 | **JP-E5** | Adjuntar APU/PDF a producto manual → Invalid key error, bloquea borrar y crear más productos | 🔴 Bloqueante | M | `useStorage.ts` + `productos_oportunidad` schema |
| 3 | **JP-E6** | Devolver de adjudicada/perdida a etapa anterior no revierte estado cotización (sigue aprobada/rechazada, sigue sumando) | 🔴 Bloqueante | S | `store.tsx` MOVE_ETAPA |
| 4 | **JP-E8** | Buscar COT en buscador → click → "cotización no encontrada" | 🔴 Bloqueante | S | página de búsqueda |
| 5 | **JP-E1** | "Configurar primer producto" va directo a mesas en vez de selector | 🟠 Crítico | S | `OportunidadDetalle.tsx` |
| 6 | **JP-E7** | Duplicar cotización no permite crear como nueva oportunidad, solo asignar a existente | 🟠 Crítico | M | `DUPLICATE_COTIZACION` + UI |
| 7 | **JP-D1** | Cot 465: "20557 días sin respuesta" (epoch 1970) | 🟠 Crítico | S | query fecha_ultimo_contacto |
| 8 | **JP-E3** | Falta # cotización en tarjeta del pipeline (esquina superior derecha) | 🟡 Alto | XS | `Pipeline.tsx` |
| 9 | **JP-E9** | Panel Cotizaciones: ordering por header + semántica de cambiar estado unclear (idem /precios, /empresas) | 🟡 Alto | M | `Cotizaciones.tsx`, `Precios.tsx`, `Empresas.tsx` |
| 10 | **JP-E10** | Configuración: editar etapas pipeline + textos completos en defaults | 🟡 Alto | M | `Configuracion.tsx` |
| 11 | **JP-E4** | Estandarizar proceso de actualización de precios | 🟢 Medio | Docs | doc de procedimiento |

## Mejoras (post-entrega)
M1. Chat Dashboard que responde preguntas de datos (Claude API)
M2. Tasa de cierre sobre **valor** (no cantidad)
M3. Dashboard → Pipeline activo → ingresar a oportunidad (link)
M4. Productos por familias con fotos (selector visual)
M5. Cuadros auxiliares más grandes/espaciados
M6. APU descargado: producto/dimensiones/material/fórmulas/formato/código
M7. Generar imagen del producto desde botón → PDF
M8. Nombre sugerido para producto en PDF y nombre archivo
M9. Pipeline: ordenar por monto/fecha/alfabéticamente/cotizador/# COT
M10. Guardar info cotización por # (APU + PDF) + transferir en recotización
M11. Re-exportar a Excel toda la info
M12. Estandarizar contactos empresas (sin duplicados)
M13. Imágenes con API Nano Banana
M14. Mejorar descripciones productos generadas

## Plan de ejecución (hoy 15-abril)

**Bloque 1 — Bloqueantes** (E2, E5, E6, E8): ~2h
**Bloque 2 — Críticos** (E1, E7, D1): ~1h
**Bloque 3 — Altos** (E3, E9, E10): ~1h
**Bloque 4 — Mejoras**: post-entrega

Entre bloques: `npm test` + `npm run build` para no romper.
