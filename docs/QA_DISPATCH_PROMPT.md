# QA Dispatch Prompt — DURATA CRM+CPQ

**Uso**: copiar todo el contenido entre los separadores `---` y pegarlo como prompt a un agente QA (Claude Code subagent o nuevo chat).

**Version**: 2026-04-16
**Alcance**: verificar bugs corregidos (no regresion) + bugs recientes (verificacion funcional) + detectar bugs abiertos conocidos + flujos criticos + invariantes BD + encontrar regresiones nuevas.

---

Actua como **QA Lead Senior** de un CRM+CPQ interno en produccion para DURATA S.A.S. (fabricante de mobiliario en acero inoxidable).

No des por bueno un flujo porque la UI "se vea bien". Para cada caso debes validar **persistencia real**:
1. Ejecutar el flujo en la UI.
2. Recargar la app (F5 o navegacion completa).
3. Cerrar sesion y volver a entrar si aplica.
4. Verificar pipeline, oportunidad, cotizacion, PDF/APU y datos persistidos **contra la BD directamente** (no solo la UI).

Prioriza estos modulos:
- Creacion de oportunidad
- Cambio de etapas (drag en pipeline)
- Cotizacion nueva
- Recotizacion
- Adjudicacion (con fecha + valor)
- Perdida (con motivo)
- Configurador generico (productos no-mesa)
- Exportacion PDF y APU
- Adjuntos (archivo_pdf_url, archivo_apu_url)
- Dashboard KPIs
- Busqueda (Ctrl+K)
- Panel /cotizaciones
- Panel de configuracion

Busca especialmente inconsistencias entre lo que muestra la sesion y lo que queda despues de recargar, y entre la UI y la base de datos.

---

## Contexto del sistema

- **Empresa**: DURATA S.A.S. — mobiliario en acero inoxidable para cocinas industriales
- **Stack**: React 19 + Vite + TypeScript + TailwindCSS + Supabase (PostgreSQL + Auth + Storage) + Vercel + Sentry
- **Estado local**: Reducer en `src/lib/store.tsx` es la fuente unica de verdad en el cliente
- **Sync**: `svcOportunidades` / `svcCotizaciones` persisten a Supabase despues del dispatch
- **Auth**: email + password. RLS con policy `auth.uid() IS NOT NULL` en 14 tablas
- **Pipeline**: 7 etapas: `nuevo_lead (0) -> en_cotizacion (1) -> cotizacion_enviada (2) -> en_seguimiento (3) -> en_negociacion (4) -> adjudicada (5) | perdida (5)`
- **Datos en produccion**:
  - 5,188 oportunidades
  - 5,176 cotizaciones
  - 2,304 empresas
  - 1,150 contactos
  - 33 productos en catalogo (todos operativos)
- **Tests**: 473 tests (Vitest) en 46 archivos
- **Cotizadores**: OC (Omar), SA (Sebastian), JPR (Juan Pablo), CA (Camilo), DG (Daniela)
- **Productos catalogo**: 33 activos en BD, versionados en `supabase/productos/_auto/`
- **Sentry**: DSN configurado en Vercel produccion

**Usuarios de prueba**:
- `saguirre@durata.co` (Sebastian)
- `presupuestos2@durata.co` (Omar)
- `rjuanpablohb@gmail.com` (JP)

---

## Herramientas disponibles — USALAS activamente

No te limites a pulsar botones. Tenes:

| Herramienta | Uso |
|---|---|
| **MCP Supabase** (`mcp__supabase__execute_sql`) | Consultar BD directamente para contrastar UI vs persistido |
| **MCP Supabase** (`mcp__supabase__list_tables`) | Listar tablas y columnas del schema |
| **Dev server** `http://localhost:5173` | Vite + React + HMR |
| **Test runner** `npm test` | 473 tests — si rompes algo los tests deben explotar |
| **Build check** `npm run build` | Debe pasar despues de cualquier cambio |
| **Migrate** `npm run migrate` | Migracion desde Excel historico |
| **Doc de flujo** `docs/FLUJO_CRM.md` | Arquitectura, rutas y pipeline de 7 etapas |
| **Diagnosticos** `node scripts/_diag-migracion.mjs` | Verifica integridad de migracion |
| **Diagnosticos** `node scripts/_diag-estancadas.mjs` | Detecta oportunidades estancadas |
| **Skill** `durata-qa-invariants` | 8 SQL checks automatizados (ver seccion Invariantes) |
| **Skill** `durata-migrate` | Migracion de datos desde Excel |
| **Skill** `durata-dump-catalogo` | Dump del catalogo de productos |

**Regla anti-teatro**: cada validacion de persistencia debe incluir al menos una query SQL por MCP que confirme el estado en BD. Si la UI dice "Adjudicada" pero la BD dice `etapa='cotizacion_enviada'`, eso es bug — aunque recargues y siga viendose OK.

---

## Seccion 1: Bugs corregidos — verificar que NO hay regresion

Estos bugs ya fueron corregidos en commits especificos. Proba cada uno con el escenario de reproduccion original para confirmar que siguen OK. Marca cada uno con:
- PASS: Fixed y verificado, no hay regresion
- REGRESION: El bug volvio a aparecer
- EFECTO_LATERAL: El fix introdujo un problema nuevo

| ID | Bug | Commit | Verificacion especifica | Query SQL |
|---|---|---|---|---|
| **B-01** | Data loss RLS | 65ef0b2 | Login como `presupuestos2@durata.co`, crear oportunidad. Logout. Login como `saguirre@durata.co`, verificar que la ves. Repetir al reves. | `SELECT COUNT(*) FROM oportunidades` debe dar igual para ambos usuarios |
| **B-02** | Divergencia reducer/Supabase | 56a0261 | Adjudicar -> recargar -> etapa sigue adjudicada. ADD_PRODUCTO desde nuevo_lead -> debe avanzar a en_cotizacion y persistir. PERDER -> cot debe quedar rechazada en BD. | `SELECT etapa, estado FROM oportunidades o JOIN cotizaciones c ON c.oportunidad_id=o.id WHERE o.id='<uuid>'` |
| **B-03** | Recotizacion id fantasma | bcd1672 | Recotizar 2026-XXX -> abrir DevTools -> mirar network POST -> confirmar que el id del request es el mismo del URL. | `SELECT id FROM cotizaciones WHERE numero='<nuevoNumero>'` debe matchear id del URL |
| **C-01** | Valor cotizado $0 | 15797b6 | Crear cotizacion con total $5M -> sidebar de oportunidad debe decir $5,000,000 (no $0). Editar total a $3M -> sidebar actualiza. | `SELECT valor_cotizado FROM oportunidades WHERE id='<uuid>'` |
| **C-02** | Adjudicar no marca ganadora | 73c3695 | 2 cotizaciones activas -> adjudicar -> debe pedir cual gano -> la otra queda `rechazada` en BD. | `SELECT numero, estado FROM cotizaciones WHERE oportunidad_id='<uuid>'` |
| **C-03** | Estado descartada no persiste | 639270c | Recotizar -> listar `/cotizaciones` -> la original debe aparecer como "Descartada" no "Borrador". | `SELECT estado FROM cotizaciones WHERE id='<id-original>'` debe ser `descartada` |
| **C-04** | Duplicar+Recotizar colisionan | c89c7d7 | En OportunidadDetalle, click menu de cotizacion -> NO debe haber opcion "Duplicar en esta oportunidad". Solo "Recotizar" y "Duplicar para otro cliente". | Inspeccion visual + `grep "Duplicar en esta" src/` |
| **C-05** | Productos manuales fantasma | e9c6b65 | Abrir CotizacionEditor -> agregar linea manual -> guardar -> volver a OportunidadDetalle -> el producto manual debe aparecer en Productos. | `SELECT * FROM productos_oportunidad WHERE oportunidad_id='<uuid>'` |
| **C-07** | Credenciales expuestas | 271dfb6 | `cat .env.example` -> no debe haber URL ni anon key reales. | — |
| **D-01** | Editar producto routing | 463d9cd | Editar un producto existente en oportunidad -> debe abrir el configurador correcto sin error 404. | — |
| **D-03** | PDF/APU no se auto-guardan | 463d9cd | Generar PDF -> verificar que `archivo_pdf_url` se actualiza en BD. Generar APU -> verificar `archivo_apu_url`. | `SELECT archivo_pdf_url, archivo_apu_url FROM cotizaciones WHERE id='<uuid>'` |
| **D-04** | Config no persiste | 463d9cd | Agregar fuente de lead en Config -> guardar -> navegar a otra pagina -> volver -> debe seguir ahi. | — |
| **D-13** | Price save button | 463d9cd | Editar precio de producto en configurador -> boton guardar debe funcionar. | — |
| **A-01** | Ubicacion no se muestra | — | Crear oportunidad con ubicacion='Obra X' -> detalle debe mostrar "Obra X". | `SELECT ubicacion FROM oportunidades WHERE id='<uuid>'` |
| **A-02** | Etapa no avanza auto | — | Oportunidad en nuevo_lead -> agregar producto -> configurar -> guardar cotizacion -> debe avanzar a en_cotizacion. | `SELECT etapa FROM oportunidades WHERE id='<uuid>'` |
| **A-03** | 100% empresas sin sector | — | Filtro sector "Construccion" en /empresas -> debe listar ~101 empresas. | `SELECT sector, COUNT(*) FROM empresas GROUP BY sector` |
| **A-04** | Estado null historicas | — | En /cotizaciones, ninguna cotizacion debe decir "null" o vacio. | `SELECT COUNT(*) FROM cotizaciones WHERE estado IS NULL OR estado=''` debe ser 0 |
| **A-05** | Historicas no editables | — | Abrir cotizacion historica (ej. 2022-XXX) -> click Editar -> debe abrir sin errores o mostrar "solo lectura". | — |
| **A-06** | Catalogo no versionado | — | `ls supabase/productos/_auto/` -> debe haber 33 archivos .sql. | — |
| **A-07** | Schema drift productos_cliente | — | `grep productos_cliente src/` -> no debe haber matches (solo `productos_oportunidad`). | — |
| **A-08** | UX adjudicacion | — | Drag a Adjudicada -> modal debe pre-llenar valor con cotizacion activa + campo fecha default hoy. Drag a Perdida -> motivos debe incluir "Proyecto congelado" y "Licitacion del cliente". | — |

---

## Seccion 2: Bugs recientes — necesitan verificacion funcional completa

Estos bugs se corrigieron recientemente. Verificar que funcionan correctamente end-to-end.

| ID | Bug | Que verificar | Query SQL |
|---|---|---|---|
| **D-02** | Recotizacion no limpiaba productos_snapshot | Recotizar una cotizacion existente -> agregar un producto nuevo -> generar cotizacion -> TODOS los productos deben estar incluidos (no solo los originales). Verificar que `productos_snapshot` se lee fresco del editor, no de la cotizacion anterior. | `SELECT productos_snapshot FROM cotizaciones WHERE id='<nueva-cot-id>'` debe incluir todos los productos |
| **D-03** | PDF y APU no se auto-guardaban en Storage | Generar PDF -> debe descargarse Y guardarse en Supabase Storage. Verificar `archivo_pdf_url` no null en BD. Generar APU -> debe descargarse como `APU_{numero}.xlsx` Y guardarse. Verificar `archivo_apu_url` no null. | `SELECT archivo_pdf_url, archivo_apu_url FROM cotizaciones WHERE numero='<numero>'` — ambos deben tener URL valida |
| **D-04** | Config save silencioso | Config panel -> agregar nueva fuente de lead -> Save -> navegar a otra pagina -> volver -> debe seguir. Si Supabase falla, debe mostrar error toast (no fallar silenciosamente). | — |
| **D-10** | "Residente" como fuente de lead | Crear oportunidad -> en fuente de lead debe aparecer "Residente" como opcion. | `SELECT * FROM config WHERE key='fuentes_lead'` debe incluir "Residente" |

---

## Seccion 3: Bugs ABIERTOS conocidos — QA debe encontrar y documentar

Estos bugs estan pendientes de correccion. QA debe confirmar que existen, documentar su impacto real y severidad, y registrar pasos exactos de reproduccion.

| ID | Bug conocido | Que buscar |
|---|---|---|
| **D-06** | APU consolidado multi-producto | Cotizacion con 5 productos -> generar APU -> deberia generar 1 Excel con 5 hojas (una por producto). Verificar que actualmente genera y que formato tiene. |
| **D-07** | No hay boton "adjuntar imagen" por producto | En el editor de cotizacion, cada producto deberia tener opcion de adjuntar imagen para el PDF. Verificar que no existe el boton. |
| **D-08** | Pipeline search limitado | Ctrl+K o barra de busqueda en pipeline -> buscar por # COT (ej. "2026-450") o por nombre de contacto -> no deberia encontrar resultados (solo busca por empresa). |
| **D-09** | Datos abril no cuadran con Excel | Dashboard -> filtrar abril 2026 -> comparar valores totales y dias promedio con los datos del Excel registro. Documentar diferencias. |
| **D-11** | Falta etapa "Recotizada/Consolidada" | No existe una etapa para marcar oportunidades recotizadas que no deben contar en totales del dashboard. Documentar como se manejan actualmente. |
| **D-12** | No se puede revivir cotizacion descartada | Cotizacion en estado "descartada" -> no hay forma de volver a activarla. Intentar cambiar estado desde UI. |
| **D-14** | Panel /cotizaciones limitado | Boton editar es inutilisable para cotizaciones importadas. No hay ordenamiento por columnas. Documentar ambos problemas. |
| **D-15** | Asignacion de contacto incompleta | Desde oportunidad -> asignar contacto -> verificar que la asignacion persiste completamente. Puede haber casos donde la relacion queda incompleta. |
| **D-16** | ConfiguradorGenerico insuficiente | Comparar la flexibilidad del ConfiguradorGenerico con lo que se puede hacer en Excel para productos nuevos. Documentar limitaciones especificas. |

---

## Seccion 4: Flujos criticos — probar end-to-end

Estos son los flujos de negocio mas importantes. Cada uno debe probarse completo, con verificacion de persistencia.

### Flujo 1: Crear oportunidad con producto generico
1. Crear oportunidad nueva (empresa, contacto, ubicacion)
2. Agregar producto que NO sea mesa (ej. campana, lavamanos)
3. Configurar el producto en ConfiguradorGenerico
4. Verificar que se abre ConfiguradorGenerico (no el configurador de mesas)
5. Guardar configuracion
6. Verificar que la oportunidad avanzo a `en_cotizacion`
7. SQL: `SELECT etapa FROM oportunidades WHERE id='<uuid>'`

### Flujo 2: Generar cotizacion con PDF persistido
1. Desde oportunidad con productos configurados -> Generar cotizacion
2. Verificar que el PDF se descarga
3. Verificar que `archivo_pdf_url` se actualizo en BD
4. SQL: `SELECT archivo_pdf_url FROM cotizaciones WHERE id='<uuid>'`
5. Acceder a la URL y confirmar que el archivo existe en Storage

### Flujo 3: Generar APU con Excel persistido
1. Desde cotizacion -> Generar APU
2. Verificar que se descarga como `APU_{numero}.xlsx`
3. Verificar que `archivo_apu_url` se actualizo en BD
4. SQL: `SELECT archivo_apu_url FROM cotizaciones WHERE id='<uuid>'`

### Flujo 4: Recotizacion completa
1. Tomar una cotizacion existente con 2 productos
2. Click "Recotizar"
3. Verificar que la cotizacion original pasa a estado `descartada`
4. En la nueva cotizacion, agregar un 3er producto
5. Generar la cotizacion
6. Verificar que los 3 productos aparecen (no solo los 2 originales)
7. SQL: `SELECT productos_snapshot FROM cotizaciones WHERE id='<nueva-id>'`

### Flujo 5: Configuracion persistente
1. Ir a panel de Configuracion
2. Agregar una nueva fuente de lead
3. Guardar (esperar confirmacion)
4. Navegar a Pipeline
5. Volver a Configuracion
6. La fuente de lead agregada debe seguir ahi

### Flujo 6: Adjudicar con fecha y valor
1. Oportunidad con 2 cotizaciones enviadas
2. Drag a columna "Adjudicada"
3. Modal debe pedir: cual cotizacion gano, fecha de adjudicacion (default hoy), valor (prefill con valor de cotizacion activa)
4. Confirmar
5. Verificar: oportunidad en `adjudicada`, cotizacion seleccionada en `aprobada`, la otra en `rechazada`
6. SQL: `SELECT o.etapa, c.numero, c.estado FROM oportunidades o JOIN cotizaciones c ON c.oportunidad_id=o.id WHERE o.id='<uuid>'`

### Flujo 7: Perder con motivo
1. Drag oportunidad a "Perdida"
2. Modal debe mostrar dropdown de motivos (incluir "Proyecto congelado", "Licitacion del cliente")
3. Seleccionar motivo y confirmar
4. Verificar: oportunidad en `perdida`, cotizaciones en `rechazada`
5. SQL: `SELECT etapa, motivo_perdida FROM oportunidades WHERE id='<uuid>'`

### Flujo 8: Dashboard KPIs vs realidad SQL
1. Abrir Dashboard
2. Anotar: total oportunidades, valor total, tasa adjudicacion, dias promedio
3. Validar cada KPI contra SQL directo:
   - `SELECT COUNT(*) FROM oportunidades WHERE etapa NOT IN ('perdida')`
   - `SELECT SUM(valor_cotizado) FROM oportunidades WHERE etapa NOT IN ('perdida')`
   - Tasa: `adjudicadas / (adjudicadas + perdidas)` via SQL
4. Los numeros deben coincidir

### Flujo 9: Busqueda Ctrl+K
1. Ctrl+K -> buscar por nombre de empresa -> debe encontrar
2. Ctrl+K -> buscar por numero COT (ej. "2026-450") -> documentar si encuentra o no
3. Ctrl+K -> buscar por nombre de contacto -> documentar si encuentra o no
4. (D-08: actualmente solo busca por empresa)

---

## Seccion 5: Escenarios adversariales

### Concurrencia fake
- Abrir la misma oportunidad en 2 pestanas. Modificar en una -> persistir. Ir a la otra pestana y hacer otro cambio sin refrescar. Que gana? Hay warnings?

### Datos extremos
- Oportunidad con valor $0, $1, $999,999,999,999
- Cotizacion con 0 lineas, con 50 lineas, con lineas sin precio
- Empresa con nombre de 1 caracter, con 500 caracteres
- Fecha adjudicacion anterior a fecha creacion
- Descripcion con emojis, HTML `<script>`, SQL injection attempts en campos de texto

### Transiciones invalidas
- Drag adjudicada -> nuevo_lead (se permite? que pasa con la cotizacion aprobada?)
- Recotizar una cotizacion ya descartada (se puede?)
- Adjudicar sin cotizacion activa
- Perder una oportunidad ya adjudicada

### Cross-consistency (critico — validacion cruzada UI vs BD)
- Dashboard dice "X cotizaciones 2026" -> contar en /cotizaciones filtrado 2026 -> deben coincidir
- Pipeline dice "N nuevo_lead" -> `SELECT COUNT(*) FROM oportunidades WHERE etapa='nuevo_lead'` -> debe coincidir
- KPI "Tasa adjudicacion" -> calcular manualmente: `adjudicadas / (adjudicadas + perdidas)` via SQL -> debe coincidir
- Valor total cotizado en Dashboard = suma de `valor_cotizado` de ops activas

### PDF y APU
- Generar PDF con 1 producto -> descargar -> abrir -> validar header, logo, totales, IVA, terminos
- Generar APU Excel -> abrir -> validar formato, hojas, datos
- PDF de cotizacion historica sin productos_snapshot -> que sucede? Error elegante o crash?

### Migracion historica
- Abrir 3 cotizaciones historicas random (2021, 2022, 2023) -> validar que cada una tiene empresa real (no "POR IDENTIFICAR"), fecha coherente, estado persistido
- Correr `npm run migrate` -> anotar conteos
- Modificar manualmente una oportunidad en UI -> volver a correr migrate -> el migrate NO debe pisar tus cambios manuales

---

## Seccion 6: Invariantes de base de datos

Ejecutar el skill `durata-qa-invariants` que corre estas 8 verificaciones SQL automatizadas. **Todas deben dar PASS.**

Las 8 invariantes son:

1. **cot_asignado_0**: Ningun `cotizador_asignado = '0'` en oportunidades
2. **adj_sin_aprobada**: Toda oportunidad en `adjudicada` tiene al menos 1 cotizacion `aprobada`
3. **perdida_con_aprobada**: Ninguna oportunidad en `perdida` tiene cotizacion `aprobada`
4. **valor_desync**: `valor_cotizado` de oportunidad = SUM(total) de cotizaciones no-descartadas/rechazadas (excepto etapa=perdida, donde el valor es historico por diseno — ver commit 15797b6)
5. **cot_sin_estado**: Ninguna cotizacion con estado NULL o vacio
6. **cot_con_espacios**: Ningun numero de cotizacion con espacios alrededor del `-`
7. **cot_numero_duplicado**: Ningun numero de cotizacion duplicado
8. **ops_huerfanas**: Ninguna oportunidad apunta a empresa_id que no existe

Query completa (ejecutar via `mcp__supabase__execute_sql`):

```sql
SELECT 
  'cot_asignado_0' AS inv, COUNT(*)::text AS val, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END AS status
  FROM oportunidades WHERE cotizador_asignado = '0'
UNION ALL
SELECT 'adj_sin_aprobada', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END
  FROM oportunidades o WHERE o.etapa='adjudicada' AND NOT EXISTS (SELECT 1 FROM cotizaciones c WHERE c.oportunidad_id=o.id AND c.estado='aprobada')
UNION ALL
SELECT 'perdida_con_aprobada', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END
  FROM oportunidades o WHERE o.etapa='perdida' AND EXISTS (SELECT 1 FROM cotizaciones c WHERE c.oportunidad_id=o.id AND c.estado='aprobada')
UNION ALL
SELECT 'valor_desync', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END
  FROM oportunidades o WHERE o.etapa != 'perdida' AND o.valor_cotizado != COALESCE((SELECT SUM(c.total) FROM cotizaciones c WHERE c.oportunidad_id=o.id AND c.estado NOT IN ('descartada','rechazada')), 0)
UNION ALL
SELECT 'cot_sin_estado', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END
  FROM cotizaciones WHERE estado IS NULL OR estado = ''
UNION ALL
SELECT 'cot_con_espacios', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END
  FROM cotizaciones WHERE numero ~ '\s-|-\s'
UNION ALL
SELECT 'cot_numero_duplicado', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END
  FROM (SELECT 1 FROM cotizaciones GROUP BY numero HAVING COUNT(*)>1) t
UNION ALL
SELECT 'ops_huerfanas', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END
  FROM oportunidades WHERE empresa_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM empresas WHERE id = oportunidades.empresa_id);
```

Tambien verificar conteos generales:

```sql
SELECT 
  (SELECT COUNT(*) FROM oportunidades) AS oportunidades,
  (SELECT COUNT(*) FROM cotizaciones) AS cotizaciones,
  (SELECT COUNT(*) FROM empresas) AS empresas,
  (SELECT COUNT(*) FROM contactos) AS contactos;
```

Si alguna invariante da FAIL: investigar inmediatamente, mostrar las filas que violan la invariante, y proponer fix.

---

## Seccion 7: Formato de reporte por caso

Para cada caso reporta:

- **test_id**: `QA-B01-01`, `QA-FLOW-01`, `QA-INV-03`, etc.
- **titulo**: resumen en una linea
- **bug_id_relacionado**: `B-01` | `C-03` | `D-06` | `nuevo` | `regresion`
- **modulo**: uno de los modulos prioritarios o "cross"
- **pasos**: lista numerada reproducible paso a paso
- **esperado**: que deberia pasar
- **observado**: que paso realmente
- **query_sql_evidencia**: el SELECT que ejecutaste con MCP + resultado (obligatorio si aplica)
- **persistencia_verificada**: `si / no / n/a` (recargaste?)
- **logout_login_verificado**: `si / no / n/a`
- **cross_user_verificado**: `si con <user> / no / n/a`
- **tests_afectados**: nombres de tests que cubren esto (si rompe, proponer nuevo test)
- **tiempo_reproduccion**: `5s / 30s / 2min`
- **reproducibilidad**: `100% / intermitente (N/M veces) / 1 solo intento`
- **severidad**: Bloqueante / Critico / Alto / Medio / Bajo (criterios abajo)
- **archivo/modulo probable**: `src/lib/store.tsx:L205`, `src/pages/Pipeline.tsx`, etc.
- **evidencia**: screenshot, snippet de console, network payload

---

## Seccion 8: Criterios de severidad

| Severidad | Criterio | Ejemplo |
|---|---|---|
| **Bloqueante** | Data loss, crash, o funcionalidad core inoperable | No persiste al recargar; RLS deja ver data que no deberia; adjudicacion no marca cotizacion ganadora |
| **Critico** | Logica de negocio incorrecta afecta decisiones comerciales | Tasa de adjudicacion incorrecta; valor_cotizado diferente al sum de cotizaciones; recotizacion pierde version |
| **Alto** | Funcionalidad importante no funciona pero hay workaround | Filtro por sector devuelve 0; no se puede editar fechas historicas; PDF sin logo |
| **Medio** | UX degradada, error poco probable | Falta confirmacion al borrar; tooltip roto; input acepta negativos |
| **Bajo** | Cosmetico, polish | Espacios, alineacion, typo |

---

## Seccion 9: Entregables finales

Al cerrar la ronda de QA, produci:

1. **Tabla de bugs corregidos** (Seccion 1): status de cada uno (PASS / REGRESION / EFECTO_LATERAL)
2. **Tabla de bugs recientes** (Seccion 2): verificacion funcional completa de cada uno
3. **Tabla de bugs abiertos** (Seccion 3): confirmacion de existencia, impacto real y severidad
4. **Lista de bugs NUEVOS descubiertos** numerada (N-01, N-02, ...) con el formato completo de la Seccion 7
5. **Resultados de flujos criticos** (Seccion 4): cada flujo con PASS/FAIL y evidencia
6. **Tabla de invariantes**: resultado de las 8 invariantes con query SQL y resultado
7. **Matriz de modulos**: por cada modulo prioritario, # casos probados / pasados / fallados
8. **Resumen ejecutivo**: 5 bullets max con el estado general del sistema
9. **Diff de tests nuevos**: si encontraste bugs no cubiertos por los 473 existentes, proponer nuevos tests
10. **Correr `npm test` al final**: verificar que sigue 473/473 pasando
11. **Correr `npm run build` al final**: verificar que el build sigue OK

---

## Regla de oro final

**Si dudas, consulta la BD.** El estado real esta en Supabase. La UI es una proyeccion que puede mentir por cache, estado local desincronizado, o bugs sutiles de render. Cada reporte de bug debe incluir al menos una query que demuestre la divergencia — o la confirme como tal.

Empeza ahora. Reporta progreso cada 10 casos probados.
