# DURATA CRM — Guía de usuario (v1)

**Para**: Omar, Sebastián, Juan Pablo, Camilo, Daniela
**URL**: https://durata-crm.vercel.app
**Soporte**: JP Ramírez

---

## 1. Entrar al sistema

1. Abrir https://durata-crm.vercel.app en Chrome o Edge
2. Email: `tu-usuario@durata.co` · Password: se te dio aparte
3. Al primer login: navegás libremente, no hay wizard inicial

---

## 2. Flujo típico: desde que llega un pedido hasta adjudicar

### Paso 1 — Crear oportunidad
Hay 2 formas:

**A) Empresa nueva + oportunidad en 1 paso**
- Sidebar → **Pipeline** → botón **"Nueva"** arriba
- Rellenás: nombre empresa, contacto, cotizador asignado, ubicación/proyecto, valor estimado
- Se crea en etapa **Nuevo Lead**

**B) Empresa que ya existe**
- Sidebar → **Empresas** → buscá la empresa → click en ella → botón **"Nueva oportunidad"**

### Paso 2 — Agregar producto(s) a la oportunidad
Desde el detalle de la oportunidad:
- Botón **"+ Producto"** → abre selector
- Elegís entre los 33 productos del catálogo (Mesa, Cárcamo, Pozuelo, Campana, Gabinete, etc.)
- Se abre el configurador: dimensiones, material, accesorios → APU automático + total
- Guardar producto

Podés agregar varios productos. Cada uno tiene su imagen 3D y APU Excel descargable.

### Paso 3 — Generar cotización
- Botón **"Generar cotización"** → modal con 3 tabs:
  - **General**: número, tiempo de entrega, incluye transporte
  - **Condiciones**: checkboxes con los textos estándar (IVA, cantidades, daños, garantía)
  - **No incluye**: checkboxes con cláusulas típicas
- El número de cotización se sugiere automáticamente (próximo libre del año)
- Al confirmar, se crea la cotización en estado "Borrador" y la oportunidad avanza a "En Cotización"

### Paso 4 — Editar la cotización y generar PDF
- Click en la cotización → editor
- Podés ajustar líneas, cantidades, descripciones
- Botón **"Descargar PDF"** → pide nombre del producto → genera PDF profesional
- Al descargar, la cotización pasa a estado "Enviada" y la oportunidad a "Cotización Enviada"

### Paso 5 — Seguimiento + Adjuntos
- Desde la oportunidad podés **adjuntar** el APU Excel y el PDF (ya están las 733 cotizaciones 2026 con sus archivos)
- Si el cliente pide cambios → botón **"Recotizar"** → crea versión A (la original queda "Descartada")
- Podés **"Duplicar para otro cliente"** → selecciona empresa destino o crea nueva oportunidad

### Paso 6 — Cierre

**Si ganás**: arrastrás la card del Pipeline a "Adjudicada" → modal pide:
- Valor adjudicado (prefijado con el valor cotizado, editable por si negociaste)
- Fecha de adjudicación (default: hoy)
- La cotización activa queda como "Aprobada" automáticamente

**Si pierdes**: arrastrás a "Perdida" → modal pide motivo (Precio, Tiempo, Competencia, Proyecto congelado, Licitación, etc.). La cotización queda "Rechazada".

### Si te equivocás
Arrastrar de vuelta a una etapa anterior → el sistema limpia automáticamente valor_adjudicado / motivo_perdida y devuelve la cotización a estado "Enviada".

---

## 3. Dashboard — qué leer

Al entrar ves:
- **5 KPIs arriba**: oportunidades activas, valor pipeline, cotizaciones del mes, tasa de cierre por cantidad y por valor
- **Distribución del pipeline**: barra de colores por etapa
- **Alertas de seguimiento**: cotizaciones enviadas sin respuesta >7 / >14 / >30 días — click "Ver en pipeline"
- **Métricas mensuales**: comparativa últimos 6 meses
- **Top 10 clientes**: por valor cotizado histórico
- **Pipeline activo** (reunión semanal): ops >$20M ordenadas por urgencia. **Click en la fila** → abre la oportunidad

---

## 4. Pipeline — atajos

- **Ctrl+K**: buscador global (empresa, contacto, # cotización)
- **Drag & drop**: mover oportunidad entre etapas
- **Filtros superiores**: cotizador (O.C / S.A / J.R / C.A / D.G), año, mes, rango de valor, sector
- **Dropdown "Orden"**: valor, fecha, empresa A-Z, cotizador, # COT
- **Click en tarjeta**: abre el detalle completo

---

## 5. Reglas que NO podés romper

1. **No borres oportunidades adjudicadas o perdidas** — rompe los reportes históricos
2. **No modifiques manualmente el valor_adjudicado después de adjudicar** sin tener clara la razón
3. **Los números de cotización siguen el año + consecutivo** (2026-501, 2026-502, ...). El sistema los sugiere — no los inventes
4. **Recotizar ≠ Duplicar**:
   - **Recotizar**: nueva versión en la MISMA oportunidad (2026-501A)
   - **Duplicar**: misma cotización base para OTRO cliente (nueva oportunidad)
5. **Si ves algo raro** (número en 0, etapa mal, ops duplicadas), avisá a JP ANTES de corregir — puede ser un bug que hay que fixear en código

---

## 6. Qué hacer si encontrás un error

1. Tomá un screenshot de la pantalla
2. Anota: qué estabas haciendo, qué esperabas, qué pasó
3. Mandale a JP por WhatsApp con el screenshot
4. Sentry ya captura los errores automáticamente → JP los ve en su panel

---

## 7. Cosas que todavía NO hace (v1)

- Chat con datos (consultas en lenguaje natural)
- Generación de imagen 3D del producto para PDF (próxima iteración)
- Notificaciones automáticas por email/WhatsApp al cliente
- App móvil (funciona en el navegador del celular pero no está optimizado)
- Integración con calendario/Drive

Todo eso está en el roadmap post-lanzamiento.

---

## 8. Datos de producción

- **5189 oportunidades históricas** (2021-2026)
- **5177 cotizaciones** migradas
- **2304 empresas** en la base
- **354 APUs y 379 PDFs** del 2026 ya adjuntos
- **33 productos** configurables con APU automático
- Las 12 oportunidades del Excel que actualizaste hoy ya están cargadas
