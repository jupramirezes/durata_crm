# Guía del usuario — DURATA CRM

**Para:** Omar, Sebastián, Juan Pablo, Camilo, Daniela
**URL:** https://durata-crm.vercel.app
**Soporte:** JP Ramírez (WhatsApp)

---

## 1. Primer login

1. Abrir https://durata-crm.vercel.app en Chrome o Edge
2. Entrar con tu email `@durata.co` y la contraseña que te dieron
3. Si olvidaste la contraseña, pedir reset a JP

**Importante**: no compartir tu sesión. Cada acción queda registrada con tu usuario.

---

## 2. Tu día a día — cotizar una oportunidad nueva

### Paso 1 · Crear la oportunidad

Hay 3 formas según el caso:

**A) El cliente es nuevo o no estás seguro si existe**
- Sidebar → **Pipeline** → botón **"+ Nueva"** (arriba a la derecha)
- El sistema te permite buscar primero si la empresa existe
- Si no existe, la creás ahí mismo (nombre, NIT, sector, ubicación)
- Asignás contacto, cotizador, fuente del lead, valor estimado

**B) El cliente ya existe**
- Sidebar → **Empresas** → buscar → click
- Botón **"+ Nueva oportunidad"** desde ahí
- Ya conoce la empresa, solo completás el resto

**C) Vas a duplicar una oportunidad existente**
- Abrí la oportunidad fuente → botón **"Duplicar para otro cliente"**
- Elegís empresa destino (existente o nueva)
- Los productos se copian al nuevo cliente

### Paso 2 · Agregar productos

Desde el detalle de la oportunidad:

1. Botón **"+ Producto"** → se abre el selector
2. Elegís entre los **33 productos** del catálogo:
   - **Mesas** (con vista 3D)
   - **Mesones**
   - **Pozuelos** (solo, corrido industrial, cuadrado, esférico, pedestal ancho, quirúrgico)
   - **Campanas** (mural, isla, genérica)
   - **Estanterías** (graduable, ranurada, perforada, escabiladero)
   - **Muebles** (gabinete, gabinete corredizo, inferior, superior)
   - **Barras accesibles** (recta, L, abatible)
   - **Drenaje** (cárcamo, caja sifonada inox/hierro)
   - **Accesorios** (lavaollas, lavaescobas, vertedero, lavabotas, ducto, repisa, deslizador bandejas)
3. Se abre el **configurador del producto**:
   - Dimensiones (largo, ancho, alto)
   - Material (acero 304/430, calibre 14/16/18/20, acabado)
   - Accesorios opcionales (patas, salpicaderos, pozuelos integrados, etc.)
   - Servicios (instalación, transporte, póliza)
4. **El APU se calcula automáticamente** — insumos, MO, transporte, láser, póliza
5. Podés ajustar líneas individuales del APU si el cliente pide algo específico
6. Click **"Guardar producto"**

Repetí para cada producto que tenga la oportunidad. Cada uno queda con su APU Excel descargable.

**Si el producto no está en el catálogo** (pasamanos, estructuras, BBQ especiales):
- Usá **"+ Producto manual"** — escribís el APU a mano (como Excel)
- Detallás insumos + MO + transporte
- El sistema calcula el total

### Paso 3 · Generar la cotización

Cuando tengas todos los productos:

1. Botón **"Generar cotización"**
2. Modal con 3 pestañas:
   - **General**: número de cotización (auto), tiempo de entrega, incluye transporte
   - **Condiciones**: checkboxes con textos estándar (IVA, daños, garantía, forma de pago)
   - **No incluye**: cláusulas típicas (obra civil, acabados finales, etc.)
3. Confirmar → se crea la cotización en **Borrador** y la oportunidad pasa a **En Cotización**

### Paso 4 · Editar y generar PDF

1. Click en la cotización → abre el editor
2. Podés revisar/ajustar líneas
3. Botón **"Descargar PDF"** → genera el PDF profesional
4. **Automáticamente se guarda**:
   - El PDF en la carpeta de la oportunidad
   - El APU Excel consolidado (un libro con una hoja por producto)
5. La cotización pasa a **Enviada** y la oportunidad a **Cotización Enviada**

Para enviar al cliente: descargás el PDF → mandás por WhatsApp o correo como haces hoy.

### Paso 5 · Seguimiento

El Dashboard te avisa si una cotización lleva **más de 7/14/30 días sin respuesta**. Click en la alerta te lleva a la oportunidad.

Desde la oportunidad podés:
- **Agregar notas** con lo que dijo el cliente
- **Mover de etapa** (drag & drop en el Pipeline): En Seguimiento, En Negociación
- **Recotizar** si el cliente pide cambios (crea versión A, B, C automáticamente)
- **Adjuntar imagen** por producto (se agrega al PDF)

### Paso 6 · Cierre

**Ganaste**:
1. Drag de la oportunidad en el Pipeline a **"Adjudicada"**
2. Modal pide valor adjudicado (pre-llenado con el cotizado) + fecha
3. La cotización activa queda como **Aprobada** automáticamente
4. Si hay varias cotizaciones activas, el sistema te pregunta cuál ganó

**Perdiste**:
1. Drag a **"Perdida"**
2. Modal pide motivo: Precio, Tiempo, Competencia, Proyecto congelado, Licitación, Cambió alcance, Sin respuesta, Presupuesto cancelado
3. La cotización queda como **Rechazada**

**Te equivocaste** (ej: adjudicaste por error):
- Drag de vuelta a la etapa anterior
- El sistema limpia automáticamente valor_adjudicado / motivo_perdida
- Devuelve la cotización a Enviada

---

## 3. Flujos especiales

### Recotización (cliente pide cambios)

1. Abrí la cotización original → botón **"Recotizar"**
2. Se crea la versión A (o B, C...) con los mismos productos
3. La versión anterior queda **Descartada** (sin borrarse, para histórico)
4. Modificás lo que el cliente pidió → generar nueva cotización/PDF
5. La oportunidad pasa a **Recotizada/Consolidada**

**Si al final el cliente aprueba una versión anterior**:
- Abrir la oportunidad → ver cotizaciones descartadas → botón **"Reactivar"**
- La versión reactivada vuelve a Enviada, la actual pasa a Descartada
- Ya podés adjudicar la correcta

### Duplicar para otro cliente

Cuando dos clientes piden cotizaciones muy similares:
1. Oportunidad fuente → botón **"Duplicar para otro cliente"**
2. Elegís empresa destino → crea nueva oportunidad con los mismos productos
3. Ajustás lo específico del segundo cliente
4. Cada oportunidad tiene su propio número de cotización

### Cotización con productos mixtos (catálogo + manual)

Podés combinar: agregás Mesa (del catálogo), Cárcamo (del catálogo) y un Pasamano (manual). Al generar PDF, los 3 aparecen. El APU consolidado tendrá 3 hojas.

---

## 4. Dashboard — qué ver y cuándo

### Cada mañana (5 min)

- **Alertas de seguimiento**: ¿tengo cotizaciones sin respuesta hace más de 7 días?
- **Oportunidades activas**: ¿cuántas están vivas hoy?
- **Cotizaciones del mes**: ¿vamos bien o mal vs lo normal?

### Reunión semanal (15 min)

- **Pipeline activo**: lista de oportunidades >$20M ordenadas por urgencia
- Click en la fila te abre la oportunidad para revisar notas

### Fin de mes (30 min)

- **Métricas mensuales**: comparar con meses anteriores
- **Top clientes**: quién está cotizando más
- **Tasa de cierre** (cantidad y valor): ¿estamos mejorando?
- **Evolución anual**: ¿este año vs anterior?

---

## 5. Atajos y tips

### Atajos de teclado

- **Ctrl+K**: buscador global (empresa, contacto, # cotización)
- **Escape**: cerrar modal

### Pipeline

- **Drag & drop**: mover oportunidad entre etapas
- **Filtros** (arriba): cotizador, año, mes, rango valor, sector
- **Orden**: dropdown con 7 criterios (valor, fecha, empresa A-Z, cotizador, # COT)
- **Click en tarjeta**: abre detalle

### Empresas

- Columnas ordenables (click en el header)
- Filtro por sector
- Click en empresa → ver todas sus oportunidades

### Precios (/precios)

- 1,408 materiales
- Filtro por grupo, subgrupo, proveedor
- Ordenar por cualquier columna
- Editar precio: click en el valor → **Enter** para guardar (o botón Guardar)

### Configuración (/config)

- Datos empresa (logo, NIT, dirección)
- Equipo comercial (agregar/desactivar cotizadores)
- Etapas del pipeline (cambiar labels/colores)
- Defaults de cotización (condiciones, no incluye)
- Fuentes de lead
- Sectores

---

## 6. Reglas que NO podés romper

1. **No borres oportunidades adjudicadas o perdidas** — rompe reportes históricos
2. **No modifiques manualmente el valor_adjudicado después de adjudicar** sin razón clara
3. **Los números de cotización siguen el año + consecutivo** (2026-501, 2026-502...). El sistema los sugiere — no los inventes
4. **Recotizar ≠ Duplicar**:
   - **Recotizar**: nueva versión en la MISMA oportunidad (2026-501A)
   - **Duplicar**: misma cotización base para OTRO cliente (nueva oportunidad)
5. **Si ves algo raro** (número en 0, etapa mal, ops duplicadas), avisá a JP **antes** de corregir
6. **El Excel REGISTRO** queda solo como backup — no actualizar ahí, todo en el CRM

---

## 7. Qué hacer si algo falla

1. Tomá un **screenshot** completo (incluyendo URL)
2. Anotá: qué estabas haciendo, qué esperabas, qué pasó
3. Mandá por WhatsApp a JP

Si el error es **bloqueante** (no podés trabajar), volvé al Excel como respaldo y avisá inmediatamente.

---

## 8. Lo que NO hace el sistema (todavía)

Estas funciones están en el roadmap pero aún no están disponibles:

- ❌ Chat con datos ("¿cuánto cotizamos a Hospital X el mes pasado?")
- ❌ Generación de imagen 3D del producto → PDF
- ❌ Envío automático por WhatsApp del PDF
- ❌ Recordatorios automáticos por email/SMS al cliente
- ❌ App móvil nativa (funciona en browser del celular pero no está optimizado)
- ❌ Integración con Contapyme (órdenes de producción post-adjudicación)

---

## 9. Datos de producción al 16-abr-2026

- **5,187 oportunidades** históricas (2021-2026)
- **5,190 cotizaciones** migradas
- **2,303 empresas** clasificadas por sector
- **354 APUs + 379 PDFs** del 2026 adjuntos
- **33 productos** configurables con APU automático
- **1,408 materiales** en precios_maestro

---

## 10. Soporte y contacto

- **Bugs o dudas técnicas**: WhatsApp JP
- **Nuevas features**: Whatsapp/email JP
- **Capacitación**: solicitar sesión con JP (45 min, individual o grupal)

### URLs de referencia

- **App**: https://durata-crm.vercel.app
- **Guía** (este documento): `docs/GUIA_USUARIO.md` en el repo
- **Videotutorial**: (pendiente de grabar — mayo 2026)
