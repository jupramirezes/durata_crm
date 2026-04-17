# QA Propio — JP Ramírez

## Actualizado: 16 abril 2026 (post-demo con equipo)

---

## 1. BUGS ACTIVOS (post-demo 16-abr — no funciona para producción)

### Bloqueantes de flujo

| # | Bug | Severidad | Detalle |
|---|---|---|---|
| D-01 | **Editar producto lleva a mesas** | BLOQUEANTE | Botón "Editar" en producto (ej: Cárcamo) navega a ConfiguradorMesa en vez del ConfiguradorGenerico del producto correcto |
| D-02 | **Recotización no carga productos nuevos** | BLOQUEANTE | Al recotizar y agregar nuevos productos, "Generar cotización" solo lee los de la versión original. No crea los nuevos en la nueva cotización |
| D-03 | **PDF/APU no quedan guardados en oportunidad** | BLOQUEANTE | El PDF se descarga al disco pero no queda almacenado en el sistema. Igual el APU. No hay trazabilidad |
| D-04 | **Configuración no guarda fuentes de lead** | BLOQUEANTE | Al agregar opciones nuevas en Config y dar "Guardar", parece que guarda pero no persiste. Al volver al panel, desaparecen |
| D-05 | **"Configurar primer producto" va directo a mesas** | ALTO | En oportunidad nueva, el botón navega al ConfiguradorMesa sin pasar por el selector de productos |

### Problemas de lógica de negocio

| # | Bug | Severidad | Detalle |
|---|---|---|---|
| D-06 | **APU consolidado multi-producto** | CRITICO | Cotización con 5 productos debería generar libro Excel con 5 hojas APU. Hoy solo genera APU individual |
| D-07 | **Falta adjuntar imagen por producto** | CRITICO | En editor de cotización necesita botón "adjuntar imagen" por producto para que aparezca en PDF (interim mientras llega IA) |
| D-08 | **Pipeline busca solo por empresa** | MEDIO | Filtro pipeline debería buscar por # COT y contacto también. Ctrl+K sí busca global pero el filtro inline no |
| D-09 | **Abril no cuadra con Excel** | CRITICO | Valores totales cotizados y días promedio de abril no coinciden con REGISTRO Excel. Verificar importación/lectura |
| D-10 | **Falta fuente "Residente"** | MEDIO | Agregar "Residente" como opción de fuente de lead |
| D-11 | **Nueva etapa "Recotizada/Consolidada"** | CRITICO | Recotizaciones van a "Perdida" e inflan cifra. Necesitan etapa propia que NO sume al total |
| D-12 | **Revivir cotizaciones descartadas** | ALTO | Si se recotizó A→B pero cliente aprueba A, poder revertir. Al aprobar una, las otras van a "Recotizada" |
| D-13 | **Botón guardar precios no funciona** | MEDIO | En /precios solo funciona con Enter, no con click en botón |
| D-14 | **Panel cotizaciones sin utilidad clara** | MEDIO | Botón "Editar" abre editor pero no permite editar históricas. Sin ordenamiento por headers |
| D-15 | **Contacto desde oportunidad incompleto** | MEDIO | Verificar que se pueda asignar existente o crear nuevo, y que cambios se reflejen en empresa |
| D-16 | **Cotizador genérico inferior a Excel** | MEJORA MAYOR | Debe poder crear productos nuevos desde el sistema (variables, fórmulas, cálculos), no depender de Excel para nuevos |

### Dato malo persistente

| # | Bug | Detalle |
|---|---|---|
| N-06 | Cot 2026-465 "20557 días" | fecha_envio=null causa cálculo contra epoch. Afecta alertas Dashboard |

---

## 2. BUGS RESUELTOS (verificados con SHA)

| Bug original | Descripción | SHA del fix |
|---|---|---|
| B-01 | Data loss RLS presupuestos2 | `65ef0b2` |
| B-02 | Sync reducer/Supabase se pierde | `56a0261` |
| B-03 | Recotización id fantasma | `bcd1672` |
| C-01 | Valor cotizado $0 sidebar | `0667b82` + `15797b6` |
| C-02 | Adjudicar no marca ganadora | `73c3695` + `34b043c` |
| C-03 | Descartada no persiste en BD | `639270c` |
| C-04 | Duplicar + Recotizar colisionan | `c89c7d7` |
| C-05 | Productos manuales no persisten | `e9c6b65` |
| C-06 | Empresas con notas en nombre | SQL migration |
| C-07 | Credenciales expuestas | `271dfb6` |
| A-01 | Ubicación no se muestra | `e9c6b65` |
| A-02 | Etapa no avanza al cotizar | `9babefc` |
| A-03 | Empresas sin sector | migración + `50156f8` |
| A-04 | Estado cotizaciones null | `2f48922` |
| A-06 | Catálogo no versionado | `_auto/` (33 productos) |
| A-07 | Schema drift | `271dfb6` |
| A-08 | Espacios en COT | `2f48922` |
| M-01 | Modal adjudicación sin valor | `05ad282` |
| M-09 | Días promedio vacío | `30f81fd` |
| E-03 | # COT en pipeline cards | `86cfc8a` |
| M-09b | Orden pipeline | `86cfc8a` |
| E-10 | Editar etapas pipeline | `ef9fea6` |
| M-14 | Descripciones productos | `44b9f5e` |
| Buscador COT | Ahora navega a oportunidad | `86cfc8a` |
| Adjuntar en producto manual | Error "Invalid key" | `e9c6b65` |
| Devolver de adjudicada/perdida | Estado no se limpiaba | `34b043c` |

---

## 3. BACKLOG DE MEJORAS (ya en BACKLOG.md, no duplicar)

### Prioridad alta (primeras semanas post-estabilización)
- **M1** Chat Dashboard con Claude API — consultar datos en lenguaje natural
- **M4** Productos por familias con fotos — selector visual en grid
- **M6** APU mejorado — producto, dimensiones, material, fórmulas, formato, código
- **M7** Imagen render 3D → PDF
- **M10** Adjuntos auto-guardados por # cotización (schema existe, falta flujo)
- **M13** Imágenes con API Nano Banana
- **E4** Doc estandarización proceso actualización precios

### Prioridad media (post-adopción)
- **M14** Seguir mejorando descripciones productos (parcial hecho — 33 templates)
- Re-exportar a Excel toda la información (cotizaciones, oportunidades, etc.)
- Estandarizar contactos de empresas (dedup)
- Paginación y ordenamiento por headers en todos los paneles
- Responsive completo
- Paso a paso / flujo interactivo para onboarding cotizadores

### Prioridad baja (futuro)
- Tasa cierre sobre valor → YA implementado (`15797b6`)
- Pipeline activo clickeable → YA implementado
- Pipeline orden por # COT → YA implementado (`86cfc8a`)

---

## 4. CONCLUSIÓN POST-DEMO 16-ABR

**La demo del 16-abr reveló que el sistema NO está listo para producción.** Los bugs originales (B-01 a C-07) fueron resueltos correctamente, pero al presentar al equipo aparecieron 16 bugs nuevos que afectan los flujos core:

1. **El configurador no deja editar productos** (D-01) — los usuarios no pueden modificar productos ya creados
2. **La recotización tiene bugs graves** (D-02, D-11, D-12) — el flujo más complejo del negocio
3. **PDFs y APUs no se guardan** (D-03) — sin trazabilidad
4. **La configuración no persiste** (D-04) — features visibles pero no funcionales
5. **El cotizador es inferior a Excel** (D-16) — no convence para migrar

**Siguiente paso:** Priorizar D-01 a D-05 (bloqueantes de flujo) antes de volver a presentar. D-11/D-12 (etapa recotizada) requiere diseño antes de implementar.

## Nuevos bugs
- Nombre de APU generado debe ser solo numero de cotización
- Persiste que al generar cotización no queda guardado el APU en la oportunidad

