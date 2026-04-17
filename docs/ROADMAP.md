# DURATA — Roadmap de transformación digital

**Última actualización:** Mayo 2026 (post-entrega v1)
**Horizonte:** 2026-2028
**Owner técnico:** JP Ramírez

---

## 0. Contexto

La entrega v1 (Feb-May 2026) fue el **primer módulo**: Cotizaciones + CRM. Cubrió ~30% del potencial de transformación digital de DURATA. El resto del negocio sigue con:

- **Producción**: ordenes manuales post-adjudicación, sin trazabilidad de proceso
- **Almacén**: Siigo genérico, sin integración con cotizaciones ni órdenes
- **Compras**: Excel de precios de proveedores, sin automatización de reordenes
- **RRHH y nómina**: externo, sin integración
- **Clientes post-venta**: ninguna herramienta, relación se pierde tras entrega
- **Marketing/Ventas outbound**: no existe, solo inbound

Este roadmap propone cómo construir el resto, con foco en **retorno medible** antes que features vistosas.

---

## 1. Estado v1 (entregado en mayo 2026)

### ✅ Módulo 1: CRM + Cotizaciones

- 5 cotizadores trabajando simultáneamente
- 33 productos configurables con APU automático
- Pipeline de 8 etapas con drag&drop
- Dashboard con KPIs en tiempo real (conciliado 100% con Excel MAESTRO)
- Generación automática PDF + APU Excel consolidado
- 5,190 cotizaciones + 2,303 empresas + 1,149 contactos + 1,408 precios migrados
- 354 APUs + 379 PDFs adjuntos en Storage
- Motor paramétrico (430 variables, 746 materiales, 796 líneas APU)
- Auth + RLS + Sentry monitoring
- 473 tests automáticos pass
- Stack: React + TypeScript + Supabase + Vercel (todos open-source o tier gratuito)

**Valor de mercado estimado de lo entregado**: $36-61M COP (ver `ENTREGA_V1.md`)
**Inversión DURATA en JP**: $10.6M COP en 3 meses

---

## 2. Sprint de cierre v1 (mayo 2026)

### Completar lo pendiente de v1

- [ ] Bug D-07: adjuntar imagen por producto → aparece en PDF
- [ ] UI/UX overhaul completo con shadcn/ui (~2 semanas)
- [ ] Feature "Guardar como plantilla" (catálogo crece orgánicamente)
- [ ] Cotizador genérico más flexible (D-16) — igualar Excel con celdas editables
- [ ] Export completo de datos desde configuración
- [ ] Notificaciones al guardar cotización
- [ ] 12 productos pendientes del catálogo (Ola 4 + especiales)
- [ ] Videotutorial del flujo completo

**Tiempo estimado**: 3-4 semanas · **Esfuerzo**: 60-80 horas · **Responsable**: JP

---

## 3. Fase 2 — Consolidar operación (junio-agosto 2026)

### Módulo 2: Post-adjudicación (Proyectos)

Cuando un cliente aprueba, la oportunidad se vuelve **Proyecto** con ciclo de vida propio:

- Estado del proyecto (en cola, en producción, listo para entrega, entregado, garantía)
- Asignación a residente / supervisor de producción
- Lista de materiales consolidada (MRP básico)
- Fechas objetivo vs reales (métricas de cumplimiento)
- Adjuntos del proyecto (planos, fotos avance, remisiones)
- Alertas de atraso

**Valor esperado**: visibilidad gerencial del pipeline productivo, reducción de atrasos.

### Módulo 3: Actualización de precios automatizada

Hoy los precios se actualizan manualmente cuando alguien se acuerda. Propuesta:

- Portal para que proveedores suban lista de precios (CSV o Excel)
- Notificación a compras cuando hay variación >5% en materiales críticos
- Historial de precios por material (para cotizaciones históricas)
- Alerta si una cotización está >30 días sin actualizar y los precios han subido

### Módulo 4: Automatizaciones (n8n)

- Envío automático de PDF por WhatsApp al cliente (con tracking)
- Guardado automático de PDF y APU en carpeta de red
- Alerta email al cotizador cuando su cotización lleva >7 días sin respuesta
- Recordatorio al cliente con plantilla estándar
- Backup automático diario de Supabase a Google Drive

### Módulo 5: Intake estructurado

Hoy los requerimientos llegan desordenados (audio, foto, texto de WhatsApp). Propuesta:

- Formulario público durata.co/cotizar para clientes (o Camilo/Sebastián)
- Campos estructurados: tipo producto, medidas, material, cantidad, ubicación
- Sube archivos (planos, fotos)
- Genera una oportunidad preliminar en el CRM automáticamente
- Cotizador recibe notificación y completa

**Valor esperado**: -50% de idas y vueltas con cliente para entender lo que quiere.

---

## 4. Fase 3 — Inteligencia con IA real (septiembre-diciembre 2026)

Entra IA donde ya hay estructura de datos (no antes).

### Módulo 6: IA para intake

- Claude/GPT lee correo, WhatsApp, PDF del cliente
- Extrae: empresa, producto tipo, medidas, material, urgencia, cantidades
- Detecta qué falta y genera preguntas concretas
- Pre-llena oportunidad en CRM con confianza (alta/media/baja)
- Cotizador valida y ajusta

### Módulo 7: IA en Dashboard

- Chat en lenguaje natural: "¿cuánto cotizamos a Hospital X en abril?", "¿cuál cotizador tiene mejor tasa de cierre?"
- Análisis predictivo: "este cliente históricamente aprueba al 15% de descuento"
- Alertas inteligentes: "la tasa de cierre bajó 3pp este mes, revisar motivos"

### Módulo 8: IA para generación de imagen

- Producto configurado → prompt generado con dimensiones y material
- Nano Banana / Flux / Ideogram genera render fotográfico del producto
- Imagen se incluye en PDF (hoy se adjunta manual)
- Con el histórico de fotos reales de productos fabricados, se puede fine-tunear

### Módulo 9: IA para sugerencia de márgenes

- Basado en histórico del cliente: "a este cliente le han aprobado cotizaciones con margen 35-38%, no 42%"
- Basado en producto: "mesas estándar se aprueban al 38%, pozuelos quirúrgicos al 45%"
- Cotizador decide, IA sugiere

---

## 5. Fase 4 — Módulos industriales (2027)

### Módulo 10: Almacén (pedido explícito de Camilo)

Hoy usan Siigo, que es contable pero no operativo. Propuesta:

- Catálogo de insumos con codificación DURATA
- Stock en tiempo real (entradas por compra, salidas por orden de producción)
- Alertas de stock bajo
- Integración con cotizador: "no hay stock suficiente para esta cotización"
- Costo promedio ponderado
- Integración bidireccional con Siigo (contable queda en Siigo, operativo en CRM)

### Módulo 11: Compras

- Órdenes de compra desde el sistema
- Catálogo de proveedores con histórico
- Comparador de precios entre proveedores
- Alerta de reposición automática

### Módulo 12: Portal cliente

- Cliente ve sus cotizaciones online (link personal)
- Puede descargar PDF, hacer comentarios, aprobar digitalmente
- Firma electrónica para órdenes de compra
- Ve avance de producción de sus proyectos adjudicados

### Módulo 13: App móvil (PWA)

- Para cotizar desde el celular en obra
- Tomar foto del sitio → crear oportunidad
- Aprobar cotizaciones en movilidad (Sebastián/Camilo)
- Alertas push de eventos del CRM

---

## 6. Fase 5 — Producto/servicio externo (2027-2028)

### Si el sistema funciona bien en DURATA, se puede vender a otras PyMEs manufactureras

**Arquitectura multi-tenant**:
- Core reutilizable (CRM, pipeline, cotización, PDF, auditoría)
- Motor de reglas por empresa (productos, fórmulas, márgenes, branding)
- Adaptadores intercambiables (WhatsApp, correo, ERP, almacenamiento)

**Mercado potencial en Colombia**:
- PyMEs manufactureras con $2-20B COP anuales: aprox 5,000 empresas
- Pain point común: Excel frágil, cotización lenta, cero trazabilidad
- Competencia: Salesforce CPQ (caro, genérico), odoo (complejo), Zoho (genérico)
- **Diferenciador DURATA**: motor paramétrico + 3D + específico para manufactura a medida

**Modelo de negocio**:
- SaaS: $500-2,000 USD/mes según tamaño
- Implementación: $5-15M COP one-time (mapeo productos, entrenamiento equipo)
- Soporte: paquetes mensuales

**Primer caso de éxito**: DURATA con métricas antes/después. Ya tenemos la data para construir el pitch.

---

## 7. Consideraciones transversales

### Transformación digital más allá de tecnología

Para que todo esto funcione, DURATA debe:

1. **Adoptar el sistema como fuente de verdad única**: dejar de actualizar Excel en paralelo
2. **Entrenar al equipo**: no solo en uso técnico, en pensar digitalmente (buscar antes de preguntar, registrar antes de resolver)
3. **Designar un "Champion" interno**: persona que no sea JP, que conozca el sistema y resuelva dudas internas
4. **Medir siempre**: antes/después en tiempos, conversión, errores
5. **Priorizar por ROI**: cada nuevo módulo debe justificar su costo en 6 meses

### Costos de operación proyectados

| Concepto | Año 1 (v1 + Fase 2) | Año 2 (Fase 3-4) |
|---|---|---|
| Infraestructura (Supabase Pro + Vercel Pro + Sentry) | $600k/año | $1.2M/año |
| APIs IA (Claude + Nano Banana uso estimado) | $0 | $2-4M/año |
| Desarrollador principal (JP consultor) | $42M/año | $50M/año |
| Herramientas JP (Claude Max, Cursor, Figma) | $6M/año (JP lo paga) | $6M/año (JP lo paga) |
| **Total costo para DURATA** | **~$42.6M/año** | **~$53-55M/año** |

### ROI esperado

| Año | Ahorro tiempo | Aumento ventas | Costo | ROI |
|---|---|---|---|---|
| Año 1 | $23M (tiempo Sebastián + cotizadores) | $0 | $42.6M | **Break-even** |
| Año 2 | $35M (efecto compuesto) | $20M (+5% conversión) | $55M | **+0%** (cubre el año) |
| Año 3 | $50M | $80M (+10% conversión + 2 casos IA real) | $60M | **+100%** |

**Vale la pena la inversión**: año 3 empieza a pagar con creces el sistema acumulado.

---

## 8. Decisiones pendientes para Camilo

Antes de arrancar Fase 2, definir con el gerente:

1. **Plan Supabase Pro ($25/mes)**: ¿lo pagamos? Da backups diarios automáticos
2. **Dominio propio** (crm.durata.co en lugar de durata-crm.vercel.app): ¿compramos SSL y redirect?
3. **Alcance Fase 2**: ¿hacer Proyectos+Intake primero, o IA primero?
4. **Champion interno**: ¿quién va a ser el primer usuario power interno además de JP?
5. **Modelo JP**: ¿consultor externo (ver PROPUESTA_ECONOMICA) o sigue como empleado?
6. **Roadmap externo**: ¿cuándo empezamos a vender a otras empresas?

---

## 9. Deudas técnicas heredadas (no urgentes)

| Deuda | Impacto | Cuándo atacar |
|---|---|---|
| OportunidadDetalle.tsx: 2000+ líneas en un solo file | Mantenimiento lento | Refactor en Fase 2 |
| Context monolítico (Store con todo) | Re-renders innecesarios | Migrar a Zustand o React Query en Fase 3 |
| Bundle size 2.2 MB (ConfiguradorMesa con Three.js) | Carga inicial lenta | Code-split con React.lazy Fase 2 |
| Sin tests de concurrencia | Race conditions posibles con 5 usuarios | Agregar Playwright tests Fase 2 |
| `tarifas_mo_producto` solo usada por Mesa | Inconsistencia del modelo | Unificar en Fase 3 |

---

## 10. Riesgos estratégicos

### Para DURATA

1. **Dependencia de JP**: si JP se enferma/va, nadie más conoce el sistema a profundidad. **Mitigación**: documentación actualizada + 2do desarrollador junior en Fase 2
2. **El Excel como "seguro"**: si el equipo sigue usando Excel en paralelo, ninguna métrica será real. **Mitigación**: Sebastián y Camilo bloquean el uso de Excel para cotización nueva post-mayo 2026
3. **Adopción**: si los cotizadores encuentran el sistema más lento que Excel para CIERTOS casos (productos especiales), no lo usan. **Mitigación**: Fase 2 mejora el cotizador para igualar flexibilidad de Excel
4. **Costos de infraestructura**: si el sistema crece a 100+ usuarios, Supabase free tier se queda corto. **Mitigación**: presupuesto desde ahora para plan Pro

### Para JP

1. **Bus factor = 1**: si JP quiere escalar a otras empresas, necesita un junior que mantenga el BAU de DURATA
2. **Código propiedad de DURATA o JP**: definir en contrato claramente
3. **Licencia del sistema**: si JP lo vende a otra empresa, ¿DURATA recibe regalía? Definir

---

## 11. Cronograma ejecutivo

```
2026
 ├── Q2 (Abr-Jun): Entrega v1 + sprint cierre + Fase 2 inicio
 ├── Q3 (Jul-Sep): Fase 2 completa (Proyectos + Precios + Intake)
 └── Q4 (Oct-Dic): Fase 3 (IA intake + Dashboard chat + Imágenes)

2027
 ├── Q1-Q2 (Ene-Jun): Módulo Almacén + Compras + Portal cliente
 ├── Q3 (Jul-Sep): App móvil PWA + refinamiento
 └── Q4 (Oct-Dic): Primer cliente SaaS externo (PyME piloto)

2028
 └── Escala: 5-10 clientes SaaS · $50-200M COP revenue externa
```

---

## 12. KPIs del roadmap

### Anuales (revisar Q4 cada año)

| KPI | Baseline (hoy) | Meta 2026 | Meta 2027 | Meta 2028 |
|---|---|---|---|---|
| Cotizaciones/mes | 130 | 150 | 200 | 250 |
| Tasa de cierre cantidad | 27.6% | 30% | 35% | 40% |
| Tasa de cierre valor | 8.8% | 12% | 15% | 20% |
| Tiempo prom cotización estándar | 3 min | 2 min | 1 min | <1 min |
| % cotizaciones por CRM (vs Excel) | 80% | 100% | 100% | 100% |
| Cotizaciones automáticas (sin humano) | 0% | 10% | 30% | 50% |
| Proyectos con trazabilidad completa | 0% | 50% | 100% | 100% |
| Revenue externa SaaS | $0 | $0 | $50M | $200M |

---

## Apéndice — Herramientas open source evaluadas

Ver `SKILLS_RECOMENDADAS.md` para análisis de cada una.

Highlights:
- **n8n**: automatización de flujos (WhatsApp, correo, Drive)
- **shadcn/ui**: componentes UI profesionales
- **Univer / Handsontable**: spreadsheet editable embebido (evaluado, pospuesto)
- **Playwright**: testing E2E visual
- **Dub.co**: links cortos para compartir cotizaciones
- **Resend**: envío de emails transaccionales
- **Posthog**: analytics de producto (ver cómo usan los cotizadores el sistema)
- **Outline / Notion**: documentación viva para el equipo
- **Appsmith / Budibase**: build internal tools para operaciones
