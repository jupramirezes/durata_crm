# Guía del usuario — DURATA CRM v2

**Para:** Omar, Sebastián, Juan Pablo, Camilo, Daniela
**URL:** https://durata-crm.vercel.app
**Soporte:** WhatsApp JP Ramírez

---

## 1. Qué cambió en la v2 (redesign)

La interfaz fue rediseñada para verse profesional e industrial (no "corporate azul"). Lo importante:

- **Sidebar claro** a la izquierda con grupos Principal/Comercial/Sistema y contadores en tiempo real (Pipeline 1.6k, Empresas 2.3k, Cotizaciones 5.2k)
- **Topbar con breadcrumbs** y búsqueda global (⌘K o Ctrl+K desde cualquier pantalla)
- **Oportunidad** ahora tiene **4 tabs**: Actividad · Productos · Cotizaciones · Adjuntos (antes todo junto en una lista larga)
- **Cotización** ahora tiene **versiones clickables A/B/C** arriba para cambiar entre versiones de la misma cotización
- **Cards uniformes** en Pipeline (siempre 70px de alto, mismo formato)
- **Estado de cotización** con colores específicos: borrador gris · enviada azul · aprobada verde · rechazada rojo · descartada tachada

Todo lo demás funciona igual — los flujos no cambiaron, solo el aspecto.

---

## 2. Primer login

1. Abrir https://durata-crm.vercel.app en Chrome o Edge (no usar Internet Explorer)
2. Entrar con tu email `@durata.co` y la contraseña que te dieron
3. Si olvidaste la contraseña, pedí reset a JP por WhatsApp

**Importante:** no compartir tu sesión. Cada acción queda registrada con tu usuario.

---

## 3. Tu día a día — cotizar una oportunidad nueva

### Paso 1 · Crear la oportunidad

Hay 3 formas según el caso:

**A) Cliente nuevo o no estás seguro si existe**
- Sidebar → **Pipeline** → botón **"+ Nueva"** arriba a la derecha
- El sistema te permite buscar primero si la empresa existe
- Si no existe, la creás ahí mismo en 3 pasos (Empresa → Contacto → Oportunidad)

**B) Cliente ya existe**
- Sidebar → **Empresas** → buscar → click
- Botón **"+ Nueva oportunidad"** desde ahí

**C) Duplicar oportunidad existente**
- Abrí la oportunidad fuente → botón **"Duplicar para otro cliente"**
- Elegís empresa destino (existente o nueva)
- Los productos se copian al nuevo cliente

### Paso 2 · Agregar productos

Desde el detalle de la oportunidad, pestaña **Productos**:

1. Botón **"+ Agregar producto"** → selector con los **33 productos**:
   - **Mesas** (con vista 3D)
   - **Mesones**
   - **Pozuelos** (solo, corrido industrial, cuadrado, esférico, pedestal ancho, quirúrgico)
   - **Campanas** (mural, isla, genérica)
   - **Estanterías** (graduable, ranurada, perforada, escabiladero)
   - **Muebles** (gabinete, gabinete corredizo, inferior, superior)
   - **Barras accesibles** (recta, L, abatible)
   - **Drenaje** (cárcamo, caja sifonada inox/hierro)
   - **Accesorios** (lavaollas, lavaescobas, vertedero, lavabotas, ducto, repisa, deslizador bandejas)
2. Se abre el **configurador** del producto:
   - Dimensiones (largo, ancho, alto)
   - Material (acero 304/430, calibre 14/16/18/20, acabado)
   - Accesorios opcionales (patas, salpicaderos, pozuelos integrados)
   - Servicios (instalación, transporte, póliza)
3. **El APU se calcula automáticamente** — insumos, MO, transporte, láser, póliza
4. Click **"Guardar producto"**

**Si el producto NO está en el catálogo** (pasamanos, estructuras, BBQ especiales):
- Usá **"+ Producto manual"** — escribís el producto a mano y adjuntas archivos generados en excel

### Paso 3 · Generar la cotización

Cuando tengas todos los productos:

1. Botón **"Cotización"** (verde) en el header de la oportunidad
2. Modal con 3 tabs:
   - **General:** número automático, tiempo de entrega, incluye transporte
   - **Condiciones:** checkboxes con textos legales completos (IVA, daños, garantía, forma de pago, etc.)
   - **No incluye:** checkboxes con cláusulas típicas (obra civil, acabados, etc.)
3. Confirmar → se crea la cotización en **Borrador** y la oportunidad pasa a **En Cotización**

### Paso 4 · Editar y generar PDF

1. Click en la cotización → abre el **editor completo** con:
   - Header sticky con # cotización + versión badge + empresa
   - Meta-grid con NIT/correo/WhatsApp/ubicación
   - Líneas editables (cantidad, descripción, precio, imagen por producto)
   - Condiciones comerciales (textareas editables con texto completo)
   - No incluye (textareas editables)
   - **Totales sticky** a la derecha con Subtotal + IVA + Total grande
   - Botones: Guardar borrador · APU consolidado · **Descargar PDF**
2. Botón **"Descargar PDF"** → genera el PDF profesional y auto-guarda en Storage
3. La cotización pasa a **Enviada** y la oportunidad a **Cotización Enviada**

Para enviar al cliente: descargás el PDF → WhatsApp o correo como hacés hoy.

### Paso 5 · Seguimiento

El **Dashboard** te avisa:
- Alertas de cotizaciones con **>7 / >14 / >30 días sin respuesta**
- Click en la alerta te lleva a la oportunidad

Desde la oportunidad podés:
- **Agregar nota** con lo que dijo el cliente (campo de nota arriba de la timeline en tab Actividad)
- **Mover de etapa** (drag&drop en Pipeline o dropdown en header del detalle)
- **Recotizar** si el cliente pide cambios (crea versión A, B, C automáticamente — la anterior queda descartada)
- **Reactivar versión anterior** si cliente aprueba una descartada
- **Adjuntar imagen** por producto (se agrega al PDF con header "Imagen alusiva")

### Paso 6 · Cierre

**Ganaste (Adjudicada):**
1. Drag de la oportunidad en el Pipeline a **"Adjudicada"** (o dropdown "Mover etapa" en detalle)
2. Modal pide valor adjudicado (pre-llenado con el cotizado) + fecha
3. La cotización activa queda como **Aprobada** automáticamente
4. Si hay varias cotizaciones activas, el sistema te pregunta cuál ganó

**Perdiste:**
1. Drag a **"Perdida"**
2. Modal pide motivo: Precio, Tiempo, Competencia, Proyecto congelado, Licitación, Cambió alcance, Sin respuesta, Presupuesto cancelado
3. La cotización queda como **Rechazada**

**Te equivocaste** (ej: adjudicaste por error):
- Drag de vuelta a la etapa anterior
- El sistema limpia automáticamente valor_adjudicado / motivo_perdida
- Devuelve la cotización a Enviada

---

## 4. Flujos especiales

### Recotización (cliente pide cambios)

Hay 2 formas:

**A) Desde el editor de cotización (más visible):**
1. Abrí la cotización → en el header sticky ves los **version badges (v1, v2, v3...)** clickables
2. Botón **"Recotizar (precios actuales)"** en el aside
3. Se crea la versión siguiente, la anterior queda descartada

**B) Desde la oportunidad:**
1. Tab Cotizaciones → botón **"Recotizar"** en el header o icono ArrowRightLeft amarillo en la cotización activa
2. Mismo resultado

**Si al final el cliente aprueba una versión anterior:**
- Tab Cotizaciones → ver versiones anteriores (details expandible al final) → botón **"Reactivar"** (icono RotateCcw violeta)
- La versión reactivada vuelve a Enviada, la actual pasa a Descartada
- Ya podés adjudicar la correcta

### Duplicar para otro cliente

Cuando dos clientes piden cotizaciones muy similares:
1. Oportunidad fuente → tab Cotizaciones → icono Copy en la cotización
2. Elegís empresa destino → crea nueva oportunidad con los mismos productos
3. Ajustás lo específico del segundo cliente
4. Cada oportunidad tiene su propio número de cotización

### Cotización con productos mixtos (catálogo + manual)

Podés combinar: agregás Mesa (del catálogo), Cárcamo (del catálogo) y un Pasamano (manual). Al generar PDF, los 3 aparecen. El APU consolidado tendrá **2 hojas** (solo los del catálogo generan APU automático).

> **Nota importante:** Los productos **manuales no calculan APU automáticamente** — solo permiten ingresar descripción, cantidad, unidad y valor. Si necesitás el APU del producto manual, lo haces aparte en Excel y adjuntás el archivo a la cotización.

---

## 5. Dashboard — qué ver y cuándo

### Cada mañana (5 min)

- **Alert banner superior**: ¿cotizaciones >7 días sin respuesta? Click en "Ver en pipeline"
- **5 KPIs**: oportunidades activas, valor pipeline, cotizaciones del mes, tasa cierre cantidad/valor
- **Alertas de seguimiento** (panel izquierdo): top 8 cotizaciones más urgentes

### Reunión semanal (15 min)

- **Pipeline activo**: lista de oportunidades >$20M ordenadas por urgencia
- Click en la fila te abre la oportunidad para revisar notas

### Fin de mes (30 min)

- **Métricas mensuales**: últimos 6 meses con cotizaciones, adjudicadas, tasa de cierre
- **Comparativo vs año anterior**: Ene–Abr 2025 vs Ene–Abr 2026
- **Top 10 clientes**: quién está cotizando más
- **Métricas por cotizador**: cuántas cots y % adj por cotizador
- **Evolución anual**: 2021–2026

---

## 6. Atajos y tips

### Atajos de teclado

- **⌘K / Ctrl+K**: buscador global (empresa, contacto, # cotización) desde cualquier pantalla
- **Escape**: cerrar modal o dropdown
- **Enter** en input de nota: guardar nota rápido
- **Esc** en edición inline de precio/proveedor: cancelar

### Pipeline

- **Drag & drop**: mover oportunidad entre etapas
- **Chips superiores**: filtrar por cotizador (segmented), año, mes, rango, sector, valor
- **"Mis cots"** chip: solo tus cotizaciones (detecta tu email)
- **"Históricas"** chip: ver también terminadas (adjudicadas + perdidas)
- **Orden**: dropdown con 7 criterios (valor, fecha, empresa A-Z, cotizador, #COT)

### Detalle de oportunidad

- **Tabs** cambian la vista central sin perder la info lateral (aside)
- Aside: cotizador editable en dropdown, empresa y contacto clickables
- **Header actions**: Nota · Producto · Cotización · Mover etapa (dropdown) · Eliminar

### Editor de cotización

- **Version badges clickables** arriba para saltar entre versiones A/B/C
- **Inline edit** en líneas: click en cantidad/precio/descripción para editar
- **Adjuntar imagen** por producto: aparece en PDF con header "Imagen alusiva"
- **APU consolidado**: si hay 2+ productos, botón para descargar un Excel con 1 hoja por producto

### Empresas / Cotizaciones / Precios (listas)

- **Columnas ordenables** (click en el header)
- **Filtros persistentes** hasta cambiar o limpiar
- **Paginación** al pie con "Cargar más" o números de página

### Precios (`/precios`)

- 1,408 materiales
- **Inline edit**: click en precio o proveedor → escribir → Enter para guardar
- Highlight primary-weak por 2.5s después de editar

### Configuración (`/config`)

- Tabs: Empresa · Equipo · Pipeline · Cotización · Fuentes · Sectores
- **Cotización → Condiciones comerciales**: editá los textos legales completos que aparecen por defecto en cada cotización nueva
- **`__TIEMPO__`** en el texto se reemplaza automáticamente por el tiempo de entrega que pongas al generar la cotización

---

## 7. Reglas que NO podés romper

1. **No borres oportunidades adjudicadas o perdidas** — rompe reportes históricos
2. **No modifiques manualmente el valor_adjudicado** después de adjudicar sin razón clara
3. **Los números de cotización siguen el año + consecutivo** (2026-501, 2026-502...). El sistema los sugiere — no los inventes
4. **Recotizar ≠ Duplicar**:
   - **Recotizar**: nueva versión en la MISMA oportunidad (2026-501A → 2026-501B)
   - **Duplicar**: misma cotización base para OTRO cliente (nueva oportunidad)
5. **Si ves algo raro** (número en 0, etapa mal, ops duplicadas), avisá a JP **antes** de corregir
6. **El Excel REGISTRO** queda solo como backup — no actualizar ahí, todo en el CRM

---

## 8. Qué hacer si algo falla

1. Tomá un **screenshot** completo (incluyendo URL en la barra)
2. Anotá: qué estabas haciendo, qué esperabas, qué pasó
3. Mandá por WhatsApp a JP

Si el error es **bloqueante** (no podés trabajar), volvé al Excel como respaldo y avisá inmediatamente.

---

## 9. Lo que NO hace el sistema (todavía)

Estas funciones están en el roadmap pero aún no están disponibles:

- ❌ Chat con datos ("¿cuánto cotizamos a Hospital X el mes pasado?") — llega en Fase 4 (nov 2026)
- ❌ Generación de imagen 3D del producto → PDF (hoy solo se adjunta manual) — Fase 4
- ❌ Envío automático por WhatsApp del PDF — Fase 2 con n8n
- ❌ Recordatorios automáticos por email/SMS al cliente — Fase 2 con Resend
- ❌ App móvil nativa (funciona en browser del celular pero no optimizado) — Fase 5
- ❌ Integración con Contapyme (órdenes de producción post-adjudicación) — Fase 5

---

## 10. Próximas mejoras (te lo cuento para que estés preparado)

### Junio–Agosto 2026: Módulo Compras + Material Master

Cuando alguien (ej. Oscar de compras, o un residente) pide un material, hoy se hace por WhatsApp/Excel manual. Lo vamos a integrar al CRM:

- **Catálogo de 1,550 materiales** con código único (AILAL00102, AIHL00201...) en vez de texto libre
- **Comparador multi-proveedor**: cargar 3-5 cotizaciones de WESCO, IMPORINOX, STECKERL... lado a lado, el sistema sugiere el ganador
- **Órdenes de Compra** con trazabilidad: "esta OC viene de la cotización Y del cliente X"
- **APU con freshness**: verde si precio <30 días, rojo si >60 días (alerta antes de cotizar con precio viejo)

### Septiembre–Octubre 2026: Módulo Proyectos

Cuando adjudicás una cotización, hoy la oportunidad queda en "Adjudicada" y ahí termina. Vamos a crear el siguiente paso:

- Proyecto productivo con estado: en cola → producción → entrega → garantía
- Residente asignado + fechas objetivo vs reales
- Lista consolidada de materiales necesarios (sugerida automáticamente al adjudicar)
- Alertas de atraso

---

## 11. Datos de producción al 16-abr-2026

- **5,187 oportunidades** históricas (2021–2026)
- **5,190 cotizaciones** migradas
- **2,303 empresas** clasificadas por sector
- **354 APUs + 379 PDFs** del 2026 adjuntos
- **33 productos** configurables con APU automático
- **1,408 materiales** en precios_maestro

---

## 12. Soporte y contacto

- **Bugs o dudas técnicas**: WhatsApp JP
- **Nuevas features**: WhatsApp/email JP
- **Capacitación**: solicitar sesión con JP (45 min, individual o grupal)

### URLs de referencia

- **App**: https://durata-crm.vercel.app
- **Guía** (este documento): `docs/GUIA_USUARIO.md` en el repo
- **Videotutorial**: pendiente de grabar (mayo 2026)
