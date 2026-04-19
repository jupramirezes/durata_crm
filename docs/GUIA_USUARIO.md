# Guía del Usuario — DURATA CRM

Esta guía es para vos que cotizás todos los días. **No hace falta saber nada técnico.** Lo que importa es el flujo comercial: cliente pide → cotizás → enviás → se adjudica o se pierde.

---

## 1. Entrar al sistema

1. Abrí https://durata-crm.vercel.app
2. Entrá con tu correo de Durata y tu clave.
3. La primera pantalla que ves es el **Pipeline**: todas las oportunidades abiertas agrupadas por etapa.

> Si olvidás la clave, pedísela a JP Ramírez por WhatsApp. Es personal — no la compartas.

---

## 2. De qué se compone el sistema

Cinco pantallas que vas a usar:

| Pantalla | Para qué sirve |
|---|---|
| **Pipeline** | Ver todas las oportunidades por etapa (Nuevo lead, En cotización, Enviada, Adjudicada…). |
| **Empresas** | Listado de clientes. Acá creás empresas nuevas. |
| **Productos** | Catálogo de productos que se pueden cotizar (mesas, cárcamos, pozuelos, etc.). |
| **Precios** | Precios vigentes de materiales y mano de obra. Los edita JP o Sebastián. |
| **Configuración** | Tus datos personales, preferencias, lista de cotizadores. |

En la esquina superior derecha hay un **buscador** (`Ctrl+K`) que te encuentra cualquier empresa, cotización o producto escribiendo pocas letras.

---

## 3. El flujo completo de una cotización (paso a paso)

### Paso A — Un cliente pide una cotización

**Ejemplo:** Felipe de *Entorno Azul* te escribe por WhatsApp pidiendo precio para un cárcamo y una mesa de trabajo.

1. Vas al **Pipeline** → botón **"Nueva oportunidad"**.
2. Si Entorno Azul ya existe como empresa, la elegís. Si no, **"Crear empresa"** ahí mismo: nombre, NIT (opcional), sector.
3. Elegís el contacto (Felipe). Si no está, **"Crear contacto"**: nombre, cargo, correo, celular.
4. Llenás los datos de la oportunidad:
   - **Ubicación:** dónde es el proyecto (ej. "Eco Square CR × 50 und")
   - **Fuente:** cómo llegó el cliente (Referido, Página web, WhatsApp, Licitación…)
   - **Fecha de ingreso:** hoy (autocompletada).
5. La opp queda en etapa **"Nuevo lead"** en el pipeline.

### Paso B — Agregar productos

Abrí la oportunidad (click en su tarjeta). Arriba vas a ver la empresa, el contacto, el número de cotización cuando exista (ej. `COT 2026-341`) y botones **Nota · Producto · Adjunto · Mover etapa**.

1. Click **"Producto"**.
2. Se abre un panel con las familias (Mesas, Cárcamos, Pozuelos, Estanterías, etc.).
3. Elegís la familia → abre el configurador.
4. Llenás las dimensiones (largo, ancho, alto), material (acero 304 o 430), calibre, refuerzos, etc.
5. El sistema **calcula el precio automáticamente** usando el APU (Análisis de Precios Unitarios). Ves el total en la derecha.
6. Click **"Agregar al pedido"**. El producto queda guardado en la oportunidad.
7. Repetís para cada producto del pedido.

**Si el producto NO está en el catálogo** (un pasamano especial, una reja, algo único):

- Click **"Producto manual"** en el mismo panel.
- Escribís descripción, cantidad, unidad (und/m/m²) y precio unitario.
- Opcionalmente adjuntás un Excel con el APU que armaste por fuera. **El sistema no calcula el APU de productos manuales** — solo guarda lo que le des.

### Paso C — Generar la cotización

Con todos los productos cargados:

1. Botón **"Cotización"** (verde) arriba a la derecha.
2. Confirmás las condiciones:
   - **Tiempo de entrega** (ej. "20 días hábiles después de anticipo")
   - **Incluye transporte** (sí/no)
   - **Condiciones** (anticipo, forma de pago, vigencia)
   - **No incluye** (obra civil, instalación, etc.)
3. El sistema genera:
   - **PDF** para enviarle al cliente
   - **APU Excel** consolidado de todos los productos
4. Los 2 archivos se guardan en la oportunidad y podés descargarlos cuando quieras.
5. La oportunidad pasa a etapa **"Cotización enviada"**.

### Paso D — Enviar al cliente

1. Abrís el PDF → lo revisás (¿números bien? ¿descripciones claras? ¿imagen sí?).
2. Lo mandás por correo o WhatsApp al cliente.
3. En la oportunidad, botón **"Nota"** y dejás registro: *"PDF enviado a felipe@entornoazul.co el 01-mar a las 3:42 PM"*.

La **línea de tiempo** (tab Actividad) te muestra todo lo que pasó en orden: cuándo se creó la opp, qué productos configuraste, cuándo enviaste el PDF.

### Paso E — El cliente pide cambios (recotizar)

Si el cliente dice *"el cárcamo mejor con tapa más gruesa"*:

1. En la oportunidad, tab **Cotizaciones** → botón **"Recotizar"**.
2. Se crea una nueva versión (ej. si la original era `2026-341`, la nueva es `2026-341A`).
3. La original queda marcada como **descartada** (tachada, más tenue).
4. Abrís la nueva versión → editás lo que el cliente pidió cambiar.
5. Generás el PDF nuevo → enviás al cliente.

Si hace falta otra ronda, recotizás otra vez y queda `2026-341B`. Las versiones se ven arriba como pills (`v0 · vA · vB`).

### Paso F — Adjudicación o pérdida

**Si el cliente acepta:**
1. Botón **"Mover etapa"** → **Adjudicada**.
2. El sistema te pregunta:
   - **Valor adjudicado** (por si es distinto al cotizado por descuento)
   - **Fecha de adjudicación**
3. La última versión activa queda como **aprobada**.
4. La oportunidad se cierra como ganada.

**Si el cliente elige otro proveedor o cancela:**
1. **"Mover etapa"** → **Perdida**.
2. Elegís **motivo**: precio, tiempo de entrega, eligió competencia, etc.
3. Dejás una nota si querés más contexto.

---

## 4. Cosas útiles del día a día

### Buscar una cotización vieja

Escribí `Ctrl+K` (o el icono de lupa arriba) y poné cualquier cosa:
- Número de cotización (`2026-341`)
- Nombre del cliente (`Entorno Azul`)
- Nombre del contacto (`Felipe`)
- Tipo de producto (`Cárcamo`)

### Duplicar una cotización (para otro cliente parecido)

En la tab Cotizaciones, botón **Duplicar** al lado de una cotización:
- Te pregunta qué cliente destino (empresa + contacto).
- **Copia todos los productos con sus APUs** a la nueva opp.
- Vos editás lo que haga falta y generás el PDF.

Esto es útil cuando dos restaurantes piden lo mismo y solo cambia el cliente.

### Revivir una cotización descartada

Si por error recotizaste o querés volver a una versión anterior, en la tab Cotizaciones desplegás **"Ver versiones anteriores"** → botón **reactivar** sobre la que querés. Vuelve a ser la activa y la actual queda descartada.

### Adjuntar archivos al cliente

En la oportunidad → botón **Adjunto** → subís cualquier archivo (planos, RFQ, fotos del cliente).
Esos archivos quedan en la oportunidad (tab Adjuntos). No aparecen en el PDF que enviás, son para tu registro interno.

### Actualizar el catálogo de productos

Si un producto tiene precio viejo o falta un producto nuevo, **no lo editás vos**. Avisale a JP Ramírez en WhatsApp y él lo actualiza desde la pantalla Precios / Productos.

---

## 5. Preguntas frecuentes

**¿Qué pasa si cambio el precio de un material? ¿Se actualizan las cotizaciones viejas?**
No. Las cotizaciones ya enviadas quedan **congeladas** con los precios del momento de generarlas. Solo las NUEVAS toman el precio actualizado. Esto es intencional — el cliente vio el PDF con ese precio.

**¿Cómo sé cuánto llevo cotizado este mes?**
En el **Dashboard** (ícono casa arriba a la izquierda) tenés el resumen: cotizaciones del mes, valor total, tasa de cierre, promedio de días para cotizar.

**¿Cómo veo lo que cotiza mi compañero?**
En Pipeline podés filtrar por **Cotizador**. Sebastián/Camilo ven todo; Omar/Daniela ven lo suyo más lo asignado.

**El sistema dice "datos incompletos" en un contacto. ¿Qué falta?**
Probablemente el correo o el teléfono. Click en el contacto → **Completar contacto**.

**Perdí el PDF de una cotización. ¿Cómo lo recupero?**
En la oportunidad, tab Cotizaciones, cada cotización tiene un botón de **descarga** al lado. Ahí lo bajás.

**Tuve que hacer una cotización rápida por WhatsApp sin meterla al sistema. ¿Cómo la subo después?**
Creá la oportunidad normal, agregá el producto (o el manual), generá la cotización con **fecha retroactiva** (podés editarla en el modal). Adjuntá el PDF original como archivo si querés.

---

## 6. Errores comunes y cómo evitarlos

| Síntoma | Causa más común | Qué hacer |
|---|---|---|
| El valor del pipeline no cambia al cotizar | No recargaste la página | Click botón **"Actualizar"** arriba a la derecha |
| El cliente no aparece al buscar | Lo creaste con una tilde distinta | Buscá sin tilde (`entorno` encuentra `Éntorno` también) |
| El PDF sale sin imagen | El producto no tenía imagen cargada | Abrí el producto → subí la imagen → regenerá el PDF |
| Dos cotizaciones con el mismo número | **Casi imposible desde 2026-04-18** — hay protección a nivel BD. Si pasa, avisá a JP | — |
| El margen da negativo | Precio unitario menor al costo calculado | Revisá en el configurador los precios de materiales |

Si el sistema te tira un mensaje de error raro, **sacale una foto con el celular y mandala** a JP Ramírez. No cierres la ventana antes de mandar la foto.

---

## 7. Quién hace qué en Durata

| Persona | Rol |
|---|---|
| **JP Ramírez** | Dueño técnico del sistema. Le avisás cualquier bug, cualquier precio viejo, cualquier pedido de mejora. WhatsApp directo. |
| **Sebastián Aguirre** | Gerente comercial. Aprueba descuentos grandes, revisa cotizaciones antes de enviar a clientes top. |
| **Camilo Araque** | Gerente general. Ve todo el pipeline. |
| **Omar Cossio** | Cotizador — máximo volumen, especialmente en proyectos grandes. |
| **Daniela Galindo** | Cotizadora — proyectos medianos y chicos. |

---

## 8. Atajos de teclado

| Atajo | Qué hace |
|---|---|
| `Ctrl+K` | Abrir buscador global |
| `Ctrl+N` (en Pipeline) | Nueva oportunidad |
| `Esc` | Cerrar modal/panel |
| `Enter` (en nota) | Publicar nota |
| `F5` | Recargar datos del servidor |

---

## 9. Qué hacer si algo no entendés

1. Primero, revisá esta guía — usá `Ctrl+F` para buscar la palabra clave.
2. Si no está acá, preguntále a un compañero (Omar sabe el día a día, Sebastián la parte comercial).
3. Si nadie sabe, WhatsApp a JP: *"¿Qué hago cuando X?"*.
4. Si el sistema está lento o con error raro: F5 primero. Si sigue, foto del error a JP.

No te quedes trabado: el sistema está para facilitarte cotizar más rápido, no para complicarte.

---

**Última actualización:** 2026-04-19
**Responsable de la guía:** JP Ramírez
