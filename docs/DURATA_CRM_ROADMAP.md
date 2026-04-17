# DURATA CRM + CPQ — ROADMAP CONSOLIDADO

**Última actualización:** 16 abril 2026 (post-demo)
**App:** https://durata-crm.vercel.app | **Repo:** jupramirezes/durata_crm
**Sentry:** https://sentry.io/organizations/durata/issues/

---

## ESTADO ACTUAL DEL SISTEMA

**Tecnología:** React 19 + TypeScript + Tailwind v4 + Vite 7 + Supabase + Vercel + Sentry
**Tests:** 473 pasando (Vitest) en 46 archivos
**Usuarios Auth:** 3 activos (saguirre, presupuestos2, rjuanpablohb) — 2 pendientes crear (araque, dgalindo)
**Datos:** 5,188 oportunidades | 2,304 empresas | 1,413 materiales | 5,176 cotizaciones | 1,150 contactos
**Productos en cotizador:** 33 operables (catálogo completo) + 12 pendientes carga (Ola 4 + especiales)
**Motor:** Genérico basado en datos (evaluar-formula.ts + motor-generico.ts) — 430 variables, 746 materiales, 796 líneas APU
**Adjuntos:** 354 APUs + 379 PDFs del 2026 migrados a Supabase Storage
**Invariantes BD:** 8/8 PASS (skill `durata-qa-invariants`)

### Hitos cumplidos

| Fecha | Hito |
|---|---|
| 18-mar-2026 | Inicio desarrollo |
| 4-abr-2026 | 3 productos verificados, motor genérico en main |
| 7-abr-2026 | 33 productos cargados (Olas 1-3 completas) |
| 13-abr-2026 | Bugs B-01 a C-07 identificados (QA sesiones 1-3) |
| 15-abr-2026 | Bugs originales resueltos, Sentry en producción, 473 tests |
| 16-abr-2026 | Demo con equipo — 16 bugs nuevos descubiertos (D-01 a D-16) |

---

## 🔴 PRIORIDAD ACTUAL — Estabilizar para producción

### Estado post-demo 16-abr: NO LISTO para uso en producción

La demo reveló bugs en flujos que no habían sido probados con usuarios reales. Los bugs originales están resueltos pero aparecieron 16 nuevos. Ver `docs/QA_PROPIO.md` para detalle completo.

### Sprint estabilización (objetivo: 1 semana)

| Prioridad | Bug | Esfuerzo estimado |
|---|---|---|
| P0 | D-01: Editar producto lleva a mesas | 1h — fix routing |
| P0 | D-05: "Configurar primer producto" va a mesas | 30min — misma causa que D-01 |
| P0 | D-04: Configuración no persiste cambios | 2h — debug useConfiguracion + Supabase |
| P0 | D-02: Recotización no carga productos nuevos | 4h — lógica compleja |
| P0 | D-03: PDF/APU no quedan guardados | 3h — conectar generar-pdf con Storage |
| P1 | D-09: Abril no cuadra con Excel | 2h — verificar importación |
| P1 | D-13: Botón guardar precios | 30min |
| P1 | D-06: APU consolidado multi-producto | 4h |
| P1 | D-07: Adjuntar imagen por producto | 3h |
| P2 | D-10: Fuente "Residente" | 15min |
| P2 | D-08: Pipeline busca por # COT + contacto | 1h |
| P2 | D-11+D-12: Etapa recotizada/consolidada | 8h — requiere diseño previo |
| P2 | D-14: Panel cotizaciones utilidad | 2h |
| P2 | D-15: Contacto desde oportunidad | 1h |

### Desbloqueo producción (mínimo viable)

Para que los 5 cotizadores empiecen a usar el sistema, necesitan funcionar SIN fallos:
1. Crear oportunidad → Configurar producto (cualquiera, no solo mesa)
2. Editar producto configurado → cambiar variables → recalcular
3. Generar cotización → PDF descarga Y queda guardado
4. Recotizar → nueva versión con productos actualizados
5. Adjudicar/Perder → KPIs reflejan realidad

---

## ✅ COMPLETADO (verificado 16-abr-2026)

### CRM Core
- [x] Dashboard: KPIs, comparativo anual, métricas por cotizador, evolución 2021-2026, tasa cierre por cantidad Y por valor
- [x] Dashboard: alertas de cotizaciones >7/14/30 días sin respuesta, clickeables
- [x] Dashboard: Pipeline activo clickeable → abre oportunidad
- [x] Pipeline kanban 7 etapas, drag & drop, modales adjudicación/pérdida
- [x] Pipeline: filtros por año, mes, valor, cotizador, sector, rango fechas
- [x] Pipeline: # COT en badge en cada card (E3)
- [x] Pipeline: dropdown Orden con 7 criterios (M9)
- [x] Pipeline: bordes urgencia amber/rojo >7/14 días
- [x] Búsqueda global Ctrl+K (empresas, contactos, cotizaciones → navega a oportunidad)
- [x] Notas por oportunidad, timeline coloreado
- [x] Detalle oportunidad: 2 columnas, sidebar con datos, ubicación visible
- [x] Cotizador cambiable, contacto editable, fecha de envío visible
- [x] Motivo de pérdida con dropdown (Precio, Tiempo, Competencia, Proyecto congelado, Licitación)
- [x] Fecha de adjudicación con prefill valor cotizado
- [x] Archivos adjuntos por oportunidad y por cotización (schema listo)
- [x] Empresas clasificadas por sector (871 auto-clasificadas)
- [x] Etapas del pipeline editables desde Configuración (E10)
- [x] Sentry SDK capturando errores runtime en producción

### Motor de Cotización Genérico (CPQ)
- [x] Motor genérico: evaluar-formula.ts (mathjs) + motor-generico.ts
- [x] 5 tablas CPQ con 33 productos completos (vars + materiales + líneas APU)
- [x] Funciones: ROUNDUP, CEILING, IF, INT, MAX, MIN, PI
- [x] Templates material dinámicos, fallback MO (tarifas_mo + es_fijo)
- [x] Push pedal con margen independiente (20%)
- [x] Póliza variable (poliza_pct), margen normalizado (0.38 y 38)
- [x] 33 descripciones comerciales con templates condicionales `[var:true|false]`

### ConfiguradorGenerico + ConfiguradorMesa
- [x] UI genérica, secciones colapsables, desglose APU completo
- [x] Líneas APU editables + custom, overrides con persistencia
- [x] ConfiguradorMesa con 3D (Three.js), 35+ variables, captura PNG
- [x] Routing: mesa → 3D, otros → genérico
- [x] Selector de productos con grid de iconos por producto

### Cotización y PDF
- [x] Consecutivo automático, versionado A/B/C
- [x] Recotizar: descarta anterior, copia productos
- [x] Adjudicar: aprueba la activa, descarta demás (respeta selección manual)
- [x] PDF profesional DURATA con firma dinámica
- [x] Condiciones comerciales configurables por tabs
- [x] Duplicar para otro cliente
- [x] APU Excel profesional con header DURATA

### Infraestructura
- [x] Auth email/password, RLS auth.uid() IS NOT NULL en 14 tablas
- [x] 473 tests (APU, reducer, numeración, recotización, motor, QA E2E)
- [x] 8 invariantes SQL verificados (skill durata-qa-invariants)
- [x] Migración datos idempotente desde Excel (script + avance automático)
- [x] Auto-deploy Vercel on push to main
- [x] Env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SENTRY_DSN

---

## 📋 PRODUCTOS POR CARGAR (12 restantes)

### Ola 4 — autoservicios y otros (7)
- [ ] Autoservicio Trampa de Grasa
- [ ] Autoservicio Trampa de Yesos
- [ ] Autoservicio Baño María
- [ ] Autoservicio Frío
- [ ] Estufa con Patas
- [ ] Basurera Espacio Público
- [ ] Revestimiento

### Productos especiales — fuera del motor estándar (5)
- [ ] Pozuelo Pedestal Válvula
- [ ] Cubiertero
- [ ] Mesa Neutra Autoservicio
- [ ] Divisiones de Baño WC (a Piso + Cantiliver — estructura jerárquica de zonas)
- [ ] Passthrough / BBQ (múltiples variantes)

---

## 🎯 POST-ESTABILIZACIÓN FASE 1 — Operación diaria (mayo 2026)

### UI/UX OVERHAUL (definitivamente necesario — feedback de la demo)
La interfaz actual no transmite confianza ni profesionalismo. Los usuarios compararon mentalmente con Excel y el sistema se vio inferior visualmente. **Hay que hacer un overhaul completo de UI/UX:**
- [ ] Migrar a shadcn/ui (componentes profesionales: Button, Dialog, Dropdown, Table, Toast, Tabs)
- [ ] Rediseñar modales: más grandes, más espaciados, inputs más altos, labels claros
- [ ] Rediseñar ConfiguradorGenerico: layout profesional tipo CPQ real (ver Figma/Dribbble refs de cotizadores industriales)
- [ ] Rediseñar Dashboard: cards más limpias, gráficos más informativos, mejor jerarquía visual
- [ ] Pipeline: cards más informativas, mejor contraste, responsive
- [ ] Detalle oportunidad: sidebar rediseñado, timeline mejorado, acciones más claras
- [ ] Paginación y ordenamiento por headers en TODOS los paneles (cotizaciones, precios, empresas)
- [ ] Responsive completo para tablet/móvil
- [ ] Tipografía y espaciado consistentes, sistema de design tokens
- [ ] Flujo de onboarding / tutorial interactivo para nuevos usuarios
- [ ] Auditar las 12 páginas contra un checklist visual de calidad

### Mejoras funcionales para adopción
- [ ] D-16: Mejorar ConfiguradorGenerico (crear productos nuevos desde sistema, no Excel)
- [ ] Paso a paso interactivo / onboarding para cotizadores

### Automatización básica
- [ ] Envío WhatsApp con PDF (botón wa.me)
- [ ] Alertas automáticas email a cotizadores (>7 días sin respuesta)
- [ ] Guardar PDF/APU en carpeta de red (n8n)
- [ ] Actualización precios por import Excel + doc proceso (E4)

### Completar catálogo
- [ ] 7 productos Ola 4
- [ ] 5 productos especiales
- [ ] Meta: 45 productos funcionales

---

## 🎯 POST-ESTABILIZACIÓN FASE 2 — Inteligencia y criterio (junio-julio 2026)

### Inteligencia con datos históricos
- [ ] M1: Chat Dashboard (Claude API via Vercel Function) — consultar datos en lenguaje natural
- [ ] Cotización inteligente: sugerir margen basado en historial del cliente
- [ ] Catálogo de preconfigurados: "Mesa buffet estándar HoReCa" como template
- [ ] Análisis automático motivos de pérdida (dashboard)
- [ ] Dashboard predictivo con proyección de ventas
- [ ] Buscar cotizaciones/APUs históricas parecidas por producto/cliente

### Intake estructurado
- [ ] Brief técnico al crear oportunidad: tipo, medidas, material, acabado, cantidad, instalación, transporte, archivos
- [ ] Checklist por tipo de producto antes de cotizar
- [ ] Clasificador: estándar, parametrizable, especial, incompleta
- [ ] El sistema ayuda a pensar ANTES de cotizar, no solo a registrar después

### Workflow comercial real
- [ ] Flujo de aprobación por reglas (monto, tipo, excepción)
- [ ] Seguimiento post-envío: recordatorios, tareas, alertas, fechas objetivo
- [ ] Secuencias automatizadas
- [ ] Razones de pérdida dropdown obligatorio
- [ ] Handoff a producción: paquete con APU, PDF, alcance, exclusiones

---

## 🎯 FASE 3 — IA real, no decorativa (agosto-septiembre 2026)

### IA para intake (primer copilot útil)
- [ ] Leer correo/WhatsApp/PDF/imagen del cliente
- [ ] Extraer estructura: cliente, producto, medidas, material, urgencia, faltantes
- [ ] Generar brief técnico preliminar automático
- [ ] Detectar faltantes: "No puedo cotizar hasta confirmar X, Y, Z"

### IA para apoyo comercial
- [ ] M13: Imágenes de producto con API Nano Banana → PDF
- [ ] M7: Captura render 3D → PDF
- [ ] Redactar descripción comercial con LLM desde variables
- [ ] Sugerir correo de envío y seguimiento personalizado
- [ ] Resumir riesgos del alcance

### IA para análisis
- [ ] Detectar patrones: por qué se pierde (precio, tiempo, claridad)
- [ ] Análisis por cotizador, tipo de cliente, familia de producto
- [ ] IA encadenada a flujo y datos, no suelta en caja de texto

---

## 🏗️ PRODUCTO EXPANDIDO (octubre 2026 - 2027)

### Sección Proyectos post-adjudicación
- [ ] Oportunidad adjudicada → se convierte en Proyecto
- [ ] Vista: residente, productos, APU/PDF, timeline producción
- [ ] Conexión Contapyme (orden de producción desde cotización aprobada)

### Roles y permisos
- [ ] Admin (Sebastián, Camilo): todo + configuración
- [ ] Cotizador (Omar, JP, Daniela): crean/editan oportunidades
- [ ] Residente: solo sus proyectos adjudicados
- [ ] Gerencia: dashboard ejecutivo, solo lectura

### Almacén (pedido de Camilo)
- [ ] Inventario en tiempo real
- [ ] Verificar stock al cotizar
- [ ] Complementar/reemplazar Siigo
- [ ] Codificación de almacén
- [ ] Alerta si no hay material suficiente

### Sitio web durata.co con configurador
- [ ] Configurador visual en web pública
- [ ] Cliente configura, ve precio estimado
- [ ] Solicitud de cotización directa
- [ ] Catálogo digital interactivo para ferias

---

## 🚀 VISIÓN MÁXIMA (2027+)

### IA avanzada
- [ ] IA lee planos PDF y extrae medidas automáticamente
- [ ] Pre-llenado del configurador desde brief técnico
- [ ] Chatbot WhatsApp: cliente pide cotización por chat
- [ ] Chatbot interno en la app (consultar datos, guía de uso)
- [ ] Sugerencia de precio óptimo basada en historial
- [ ] Cotización asistida por IA para productos especiales

### Visual y experiencia
- [ ] 3D parametrizado para familias de producto (no solo mesas)
- [ ] SVG 2D esquemático para productos simples
- [ ] Generación de imágenes con IA para cotizaciones
- [ ] Catálogo digital interactivo para ferias y ventas

### Plataforma
- [ ] Portal autoservicio: cliente configura online
- [ ] App móvil / PWA para cotizar en obra
- [ ] Firma electrónica en cotizaciones
- [ ] Responsive completo tablet/móvil
- [ ] Multi-sede si DURATA crece
- [ ] API pública para integraciones externas

### Visión producto/servicio (venta a terceros)
- [ ] Separar core reusable (CRM, pipeline, cotización, PDF, auditoría)
- [ ] Separar motor de reglas por empresa (productos, fórmulas, márgenes, branding)
- [ ] Separar adaptadores (WhatsApp, correo, ERP, almacenamiento)
- [ ] Multi-tenancy: datos por empresa, branding configurable
- [ ] Primer caso de éxito documentado: DURATA con métricas antes/después
- [ ] Mercado: PYMEs manufactureras en Colombia ($2-20B COP anuales)
- [ ] Modelo: SaaS mensual o implementación + soporte
- [ ] Diferenciador: motor de fórmulas genérico + 3D + específico para manufactura

---

## 🔧 DEUDA TÉCNICA

### Resuelta
- [x] T.2 Motor legacy → genérico (ConfiguradorMesa solo para 3D)
- [x] T.5 FK constraints e índices (schema-motor-generico.sql)
- [x] T.9 tarifas_mo "muerta" → confirmado: Mesa la usa (6 rows), resto usa es_fijo. Es diseño, no bug.
- [x] T.10 ConfiguradorGenerico: inputs numéricos con unidad (parcial, mejorado)
- [x] T.14 Unificar MO → decidido: dos estrategias conviven por diseño

### Pendiente
- [ ] T.1 Refactorizar OportunidadDetalle.tsx (1,200+ líneas → componentes)
- [ ] T.3 Separar Context monolítico (Precios vs CRM vs Auth)
- [ ] T.6 Migrar a React Query o Zustand (reemplazar Context/Reducer)
- [ ] T.7 Cobertura tests: hoy ~10% líneas, meta 30%+ (pero 473 tests funcionales)
- [ ] T.8 Race condition con 5 usuarios simultáneos
- [ ] T.11 Export APU/PDF debe leer del snapshot genérico
- [ ] T.12 Bundle size: code-split con React.lazy (main chunk >500KB)
- [ ] T.13 Store fire-and-forget: falta capa de dominio/backend real
- [ ] T.15 Fixes 3D: pozuelo rectangular, vertedero, baberos laterales

---

## 📊 MÉTRICAS DEL PROYECTO

| Métrica | Valor |
|---|---|
| Días de desarrollo | ~30 (18-mar a 16-abr-2026) |
| Líneas de código | ~15,000+ |
| Features completadas | 90+ |
| Tests | 473 (Vitest) |
| Datos migrados | 5,188 oportunidades, 2,304 empresas, 5,176 cotizaciones |
| Productos operables | 33 de 45 |
| Adjuntos migrados | 354 APUs + 379 PDFs (2026) |
| Bugs originales resueltos | 18/18 (B + C + A) |
| Bugs nuevos post-demo | 16 activos |
| Costo herramientas | ~$1.5M COP (Claude Max 3 meses) |
| Valor del sistema en mercado | $15-40M COP |

### Métricas de negocio a medir (desde prueba piloto)
- Tiempo promedio cotización: Excel vs CRM (antes/después)
- % de cotizaciones hechas por CRM vs por Excel
- Tasa de conversión: cotización → adjudicación
- Motivos de pérdida más frecuentes
- Productos más cotizados
- Cotizador más productivo
- Tiempo desde recepción hasta envío de cotización

---

## 📝 NOTAS OPERATIVAS

### Activas
- Revisar APUs con Sebastián y Omar — pendiente fecha
- Complementar precios con Almacén y proveedores — pedir archivo actualizado
- Camilo quiere estandarizar almacén (hoy usan Siigo genérico)
- El Excel NO se abandona — productos especiales (~20%) se registran como manual
- Para mesas en L: subtipo futuro con geometría diferente
- Codificación de almacén — pendiente para módulo Almacén
- Métricas de conservación de clientes (clasificar y priorizar en pipeline)

### Resueltas
- ~~Poner + razones de pérdida~~ → hecho (05ad282)
- ~~Preguntar fecha adjudicación~~ → hecho (05ad282)
- ~~Push pedal margen independiente~~ → hecho (7a3baa9)
- ~~Hacer más intuitivo recotización~~ → parcial (bcd1672, aún bugs D-02/D-11)
- ~~Subir datos históricos APU/PDF~~ → 354 APU + 379 PDF migrados
- ~~Mejorar descripciones productos~~ → parcial (44b9f5e, 33 templates)

---

## ⚠️ RIESGOS

### Crítico ahora
- **16 bugs nuevos post-demo** — el sistema no se puede usar en producción hasta resolverlos
- **Adopción del equipo**: la demo no convenció. El cotizador genérico se percibió como inferior a Excel
- **Dependencia de JP como único desarrollador** — bus factor = 1

### Estratégicos
- Sin métricas de antes/después — difícil justificar valor ante Camilo
- La narrativa "IA" está por delante del producto real — riesgo de sobre-prometer
- Propuesta económica pendiente — el trabajo sigue sin compensación proporcional

---

## 📚 LECCIONES APRENDIDAS

1. **La carga masiva automatizada no funciona para plantillas no uniformes.** Traducción manual (15-45 min/producto) es más lenta pero correcta.
2. **Validar sintaxis ≠ validar valores.** La validación real: ¿el precio del CRM coincide con el Excel?
3. **3 productos verificados manualmente > 29 cargados automáticamente.**
4. **El motor de cálculo funciona. El problema es la migración de datos.**
5. **Separar auditor de ejecutor es valioso.** Codex como auditor detectó problemas que Claude Code no vio.
6. **IF() e INT() faltaban en el evaluador.** Bug invisible que afectó 29 productos.
7. **Los bugs de QA interno no equivalen a bugs de uso real.** La demo reveló 16 bugs que las sesiones de QA automatizado no detectaron. **Los usuarios encuentran cosas diferentes a los tests.**
8. **El cotizador debe igualar la flexibilidad de Excel antes de pedir que migren.** Si el nuevo sistema es más rígido, los usuarios no van a adoptarlo aunque tenga más features.

---

## 🧭 ANÁLISIS ESTRATÉGICO

### Posicionamiento real del sistema

El sistema es "reglas + formularios + automatización operativa". No hay LLMs, OCR serio, ni sugerencia inteligente en producción. El valor real hoy: **digitalización del proceso de cotización estándar con trazabilidad, velocidad y motor de cálculo parametrizable**.

### Brechas entre software y negocio real
- El proceso arranca con insumos caóticos (audios, fotos, notas). La app asume que alguien ya interpretó.
- La dependencia de Sebastián baja pero no desaparece.
- Para cotizaciones no estándar o estratégicas, el sistema no ayuda todavía.
- **Post-demo**: los cotizadores ven el Excel como más flexible, y tienen razón en el estado actual.

### Arquitectura a largo plazo (4 capas)
1. **Ordenar el caos:** Maestro de precios, catálogo estándar, plantillas, checklist, taxonomía.
2. **Motor de cotización:** Fórmulas, materiales, MO, transporte, reglas en datos. **El corazón vendible.**
3. **Flujo comercial:** Intake → Validación → Cotización → Aprobación → Envío → Seguimiento → Cierre → Aprendizaje.
4. **IA:** Entra cuando hay estructura, históricos y reglas. Si metes IA antes, solo automatizas desorden.

### Para venderlo como servicio
Separar: core reusable (CRM, pipeline, PDF) / motor de reglas por empresa / adaptadores (WhatsApp, correo, ERP).

### Fronteras del sistema
- **Automático**: cotización estándar con variables claras
- **Asistido**: cotización con interpretación de brief
- **Humano obligatorio**: productos especiales, excepciones comerciales
- Esa frontera es parte del valor del sistema, no una limitación.

### El mayor riesgo
No es técnico sino estratégico: venderlo como solución total y chocar con que el problema más difícil es la entrada desordenada y el criterio técnico/comercial.
