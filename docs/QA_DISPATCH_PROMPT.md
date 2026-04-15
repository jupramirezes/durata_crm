# QA Dispatch Prompt — DURATA CRM+CPQ

**Uso**: copiar todo el contenido entre los separadores `---` y pegarlo como prompt a un agente QA (Claude Code subagent o nuevo chat).

**Versión**: 2026-04-15
**Alcance**: verificar los 20 bugs documentados + flujo completo + persistencia real + encontrar regresiones.

---

Actúa como **QA Lead Senior** de un CRM+CPQ interno crítico para entrega el **17 de abril de 2026**.

No des por bueno un flujo porque la UI "se vea bien". Para cada caso debes validar **persistencia real**:
1. ejecutar el flujo,
2. recargar la app (F5 o navegación completa),
3. cerrar sesión y volver a entrar si aplica,
4. verificar pipeline, oportunidad, cotización, PDF/APU y datos persistidos **contra la BD directamente** (no solo la UI).

Prioriza estos módulos:
- creación de oportunidad
- cambio de etapas
- cotización nueva
- duplicación
- recotización
- adjudicación
- pérdida con motivo
- configurador genérico
- exportación PDF/APU
- adjuntos
- migración histórica

Busca especialmente inconsistencias entre lo que muestra la sesión y lo que queda después de recargar, y entre la UI y la base de datos.

---

## Herramientas que tenés disponibles — USALAS activamente

No te limites a pulsar botones. Tenés:

- **MCP Supabase** (`mcp__supabase__execute_sql`): consultá la BD directamente para contrastar lo que ves en la UI con lo persistido
- **Dev server** en http://localhost:5174 (Vite + React + HMR)
- **Test runner** con 102 tests — `npm test` — si rompés algo los tests deben explotar
- **Build check** — `npm run build` debe pasar después de cualquier cambio
- **Doc de flujo**: `docs/FLUJO_CRM.md` con arquitectura, rutas y pipeline de 7 etapas
- **Diagnostic scripts**: `node scripts/_diag-migracion.mjs` y `node scripts/_diag-estancadas.mjs`

**Regla anti-teatro**: cada validación de persistencia debe incluir al menos una query SQL por MCP que confirme el estado en BD. Si la UI dice "Adjudicada" pero la BD dice `etapa='cotizacion_enviada'`, eso es bug — aunque recargues y siga viéndose OK.

---

## Contexto del sistema

- Stack: React 19 + Vite + TypeScript + TailwindCSS + Supabase (PostgreSQL + Auth)
- Estado: Reducer en `src/lib/store.tsx` es la fuente única de verdad
- Sync: `svcOportunidades` / `svcCotizaciones` persisten a Supabase después del dispatch
- Auth: email + password. Usuarios de prueba:
  - `saguirre@durata.co` (Sebastián)
  - `presupuestos2@durata.co`
- RLS: 14 tablas con policy `(SELECT auth.uid()) IS NOT NULL` (ALL ops)
- Pipeline de 7 etapas: `nuevo_lead (0) → en_cotizacion (1) → cotizacion_enviada (2) → en_seguimiento (3) → en_negociacion (4) → adjudicada (5) | perdida (5)`
- Cotizadores: OC (Omar), SA (Sebastián), JPR (Juan Pablo), CA (Camilo), DG (Daniela)
- Productos catálogo: 33 activos en BD, versionados en `supabase/productos/_auto/`

---

## Matriz de 20 bugs documentados — verificación explícita

Probá cada uno con el escenario de reproducción original. Marcá cada uno con:
- ✅ Fixed y verificado
- ⚠️ Regresión parcial
- ❌ No reproduce pero código no hace lo esperado
- 🆕 Efectos secundarios detectados

| ID | Verificación específica | Query SQL de validación |
|---|---|---|
| **B-01** Data loss RLS | Login como `presupuestos2@durata.co`, creá una oportunidad. Logout. Login como `saguirre@durata.co`, verificá que la ves. Repetí al revés. | `SELECT COUNT(*) FROM oportunidades` debe dar igual para ambos usuarios |
| **B-02** Divergencia reducer/Supabase | Adjudicar → recargar → etapa sigue adjudicada. Misma prueba con ADD_PRODUCTO desde nuevo_lead → debe avanzar a en_cotizacion y persistir. Misma con PERDER → cot debe quedar rechazada en BD. | `SELECT etapa, estado FROM oportunidades o JOIN cotizaciones c ON c.oportunidad_id=o.id WHERE o.id = '<uuid>'` |
| **B-03** Recotización id fantasma | Recotizar 2026-XXX → abrir DevTools → mirar network POST → confirmar que el `id` del request es el mismo del URL después de navegar. | `SELECT id FROM cotizaciones WHERE numero = '<nuevoNumero>'` debe matchear el id del URL |
| **C-01** Valor cotizado $0 | Crear cotización con total $5M → mirar sidebar de oportunidad debe decir `$5,000,000` (no $0). Editar total a $3M → sidebar actualiza. Borrar cotización → sidebar vuelve a $0. | `SELECT valor_cotizado FROM oportunidades WHERE id='<uuid>'` |
| **C-02** Adjudicar no marca ganadora | 2 cotizaciones activas → adjudicar → debe pedir cuál ganó → la otra queda `rechazada` en BD, no `borrador`. | `SELECT numero, estado FROM cotizaciones WHERE oportunidad_id='<uuid>'` |
| **C-03** Estado descartada no persiste | Recotizar → listar `/cotizaciones` → la original debe aparecer como "Descartada" no "Borrador". | `SELECT estado FROM cotizaciones WHERE id='<id-original>'` debe ser `descartada` |
| **C-04** Duplicar+Recotizar colisionan | En OportunidadDetalle, click menú de una cotización → NO debe haber opción "Duplicar en esta oportunidad". Solo "Recotizar" y "Duplicar para otro cliente". | Inspección visual + `grep "Duplicar en esta"` en el src debe devolver solo el comentario de removed |
| **C-05** Productos manuales fantasma | Abrir CotizacionEditor → agregar línea manual → guardar → volver a OportunidadDetalle → el producto manual debe aparecer en la sección Productos. | `SELECT * FROM productos_oportunidad WHERE oportunidad_id='<uuid>'` debe incluir el manual |
| **C-06** Empresa histórica con notas | Buscar empresas con nombre "ACTUALIZAR", "RECOTIZAR", "COTIZAR" → no deben aparecer. En su lugar, buscar "POR IDENTIFICAR" → 14 empresas con sector "Sin identificar". | `SELECT COUNT(*) FROM empresas WHERE nombre ~* '^(ACTUALIZAR\|RECOTIZAR\|COTIZAR)'` debe ser 0 |
| **C-07** Credenciales expuestas | `cat .env.example` → no debe haber URL ni anon key reales. | — |
| **A-01** Ubicación no se muestra | Crear oportunidad con `ubicacion='Obra X'` → abrir detalle → sidebar debe mostrar "Obra X". | `SELECT ubicacion FROM oportunidades WHERE id='<uuid>'` |
| **A-02** Etapa no se mueve auto | Oportunidad en nuevo_lead → click "Agregar producto" → configurar → guardar cotización → oportunidad debe avanzar automáticamente a en_cotizacion. | `SELECT etapa FROM oportunidades WHERE id='<uuid>'` |
| **A-03** 100% empresas sin sector | Filtro sector "Construcción" en /empresas → debe listar ~101 empresas (no 0). Filtro "Sin clasificar" → 1399. | `SELECT sector, COUNT(*) FROM empresas GROUP BY sector` |
| **A-04** Estado null históricas | En `/cotizaciones`, dropdown de estado debe mostrar valor real, no todas las opciones. Ninguna cotización debe decir "null" o vacío. | `SELECT COUNT(*) FROM cotizaciones WHERE estado IS NULL OR estado=''` debe ser 0 |
| **A-05** Históricas no editables | Abrir cotización histórica (ej. 2022-XXX) → click Editar → debe abrir sin errores o mostrar "solo lectura" elegante. | — |
| **A-06** Catálogo no versionado | `ls supabase/productos/_auto/` → debe haber 33 archivos .sql. | — |
| **A-07** Schema drift productos_cliente | En código: `grep productos_cliente src/` → no debe haber matches (solo `productos_oportunidad`). | — |
| **A-08** UX adjudicación | Drag a Adjudicada → modal debe pre-llenar valor con la cotización activa + campo fecha default hoy. Drag a Perdida → motivos debe incluir "Proyecto congelado" y "Licitación del cliente". | — |
| **M-08** Cotizador fantasma Dashboard | Dashboard → filtro cotizador → debe aparecer Camilo (CA) con al menos 16 cotizaciones del 2026. | `SELECT cotizador_asignado, COUNT(*) FROM oportunidades GROUP BY cotizador_asignado` |
| **Nuevo** Adjudicar respeta selección | 2 cotizaciones enviadas → manualmente marca una como `aprobada` → drag a Adjudicada → debe respetar esa selección, no pisar con otra. | `SELECT numero, estado FROM cotizaciones WHERE oportunidad_id='<uuid>'` |

---

## Escenarios adversariales

**Concurrencia fake**:
- Abrir la misma oportunidad en 2 pestañas. Modificar en una → persistir. Ir a la otra pestaña y hacer otro cambio sin refrescar. ¿Qué gana? ¿Hay warnings?

**Datos extremos**:
- Oportunidad con valor $0, $1, $999,999,999,999
- Cotización con 0 líneas, con 50 líneas, con líneas sin precio
- Empresa con nombre de 1 carácter, con 500 caracteres
- Fecha adjudicación anterior a fecha creación
- Descripción con emojis, HTML `<script>`, SQL injection attempts

**Transiciones inválidas**:
- Drag adjudicada → nuevo_lead (¿se permite? ¿qué pasa con la cotización aprobada?)
- Recotizar una cotización ya descartada (¿se puede?)
- Adjudicar sin cotización activa

**Regresión post-migrate**:
- Correr `npm run migrate` → anotar conteos
- Modificar manualmente una oportunidad en UI (cambiar etapa, valor)
- Volver a correr `npm run migrate` → el migrate NO debe pisar tus cambios manuales
- Modificar `ubicacion` en UI → re-correr migrate → si el Excel dice lo mismo, no update; si difiere, el script NO debe pisar

**Cross-consistency** (crítico — validación cruzada UI↔BD):
- Dashboard dice "247 cotizaciones 2026" → contar en `/cotizaciones` filtrado 2026 → deben coincidir
- Pipeline dice "15 nuevo_lead" → `SELECT COUNT(*) FROM oportunidades WHERE etapa='nuevo_lead'` → debe coincidir
- KPI "Tasa adjudicación = 26%" → calcular manualmente: `adjudicadas / (adjudicadas + perdidas)` via SQL → debe coincidir
- Valor total cotizado en Dashboard = suma de `valor_cotizado` de ops activas

**Migración histórica** (especial):
- Abrir 3 cotizaciones históricas random (2021, 2022, 2023) → validar que cada una tiene empresa real (no "POR IDENTIFICAR"), fecha coherente, estado persistido
- Las 6 cotizaciones con sufijo `-A` creadas en esta iteración (2021-1096A, 1100A, 1140A, 1172A, 1190A, 2025-739A) → deben existir en BD, aparecer en `/cotizaciones` con estado correcto
- Verificar que 2026-443, 444, 459, 468, 469, 470 están en `cotizacion_enviada` con fecha_envio correcta

**PDF y APU**:
- Generar PDF con 1 producto → descargar → abrir → validar header, logo, totales, IVA, términos
- Generar APU Excel → abrir → validar fórmulas activas, colores, hojas separadas
- PDF de cotización histórica sin productos_snapshot → ¿qué sucede? ¿error elegante o crash?

**Adjuntos**:
- Subir PDF al producto → recargar → debe seguir disponible para descargar
- Subir APU al producto → recargar → idem
- Eliminar adjunto → verificar en storage de Supabase (si aplica)

---

## Invariantes que DEBEN sostenerse SIEMPRE

Chequeá estos periódicamente. Si algo viola un invariante, es bug aunque la UI se vea OK.

1. **Suma de ops por etapa = total de ops** en cualquier query del Dashboard
2. **Cada oportunidad con COT en notas tiene al menos 1 cotización** (o está en nuevo_lead)
3. **Si `etapa = adjudicada`**, debe existir exactamente 1 cotización con `estado = aprobada` para esa oportunidad
4. **Si `etapa = perdida`**, NO debe haber cotizaciones en `aprobada` para esa oportunidad
5. **Ningún `numero` de cotización tiene espacios alrededor del `-`**
6. **`valor_cotizado` de oportunidad = sum(total) de cotizaciones no-descartadas**
7. **`getActiveCotizacionValor(cots, opId)` debe ignorar descartadas**
8. **FKs sin huérfanos**: 0 contactos sin empresa, 0 cotizaciones sin oportunidad, 0 ops sin empresa

Queries de verificación rápida:
```sql
-- 1-2: distribución de etapas y COTs sin cotización
SELECT etapa, COUNT(*) FROM oportunidades GROUP BY etapa;
SELECT COUNT(*) FROM oportunidades o
WHERE o.notas ~* 'COT:' AND NOT EXISTS (SELECT 1 FROM cotizaciones WHERE oportunidad_id = o.id);

-- 3-4: coherencia adjudicada/perdida ↔ cotizaciones
SELECT o.etapa, c.estado, COUNT(*)
FROM oportunidades o JOIN cotizaciones c ON c.oportunidad_id = o.id
GROUP BY o.etapa, c.estado ORDER BY o.etapa, c.estado;

-- 5: formato numero
SELECT COUNT(*) FROM cotizaciones WHERE numero ~ '\s-|-\s';

-- 6: rollup correcto
SELECT o.id, o.valor_cotizado,
  (SELECT COALESCE(SUM(c.total),0) FROM cotizaciones c
   WHERE c.oportunidad_id=o.id AND c.estado <> 'descartada') AS suma_activas
FROM oportunidades o
WHERE o.valor_cotizado <> (
  SELECT COALESCE(SUM(c.total),0) FROM cotizaciones c
  WHERE c.oportunidad_id=o.id AND c.estado <> 'descartada'
);

-- 8: huérfanos
SELECT 'ops sin empresa' AS t, COUNT(*) FROM oportunidades WHERE empresa_id IS NULL
UNION ALL SELECT 'cots sin oport', COUNT(*) FROM cotizaciones WHERE oportunidad_id IS NULL;
```

---

## Formato de reporte por caso

Para cada caso reporta:

- **test_id**: `QA-B01-01`, `QA-FLOW-01`, `QA-INV-03`, etc.
- **título**: resumen en una línea
- **bug_id_relacionado**: `B-01` | `C-03` | `nuevo` | `regresión`
- **módulo**: uno de los 11 módulos prioritarios o "cross"
- **pasos**: lista numerada reproducible paso a paso
- **esperado**: qué debería pasar
- **observado**: qué pasó realmente
- **query_sql_evidencia**: el SELECT que ejecutaste con MCP + resultado (obligatorio si aplica)
- **persistencia_verificada**: `sí / no / n/a` (¿recargaste?)
- **logout_login_verificado**: `sí / no / n/a`
- **cross_user_verificado**: `sí con <user> / no / n/a`
- **tests_afectados**: nombres de tests que cubren esto (si rompe, agregar un test failing en `qa-flujo-completo.test.ts`)
- **tiempo_reproducción**: `5s / 30s / 2min`
- **reproducibilidad**: `100% / intermitente (N/M veces) / 1 solo intento`
- **severidad**: Bloqueante / Crítico / Alto / Medio / Bajo (criterios abajo)
- **archivo/módulo probable**: `src/lib/store.tsx:L205`, `src/pages/Pipeline.tsx`, etc.
- **evidencia**: screenshot, snippet de console, network payload

---

## Criterios de severidad

| Severidad | Criterio | Ejemplo |
|---|---|---|
| **Bloqueante** | Data loss, crash, o rompe entrega del 17-abril | No persiste al recargar; RLS deja ver data que no debería; adjudicación no marca cotización ganadora |
| **Crítico** | Lógica de negocio incorrecta afecta decisiones comerciales | Tasa de adjudicación incorrecta; valor_cotizado en sidebar diferente al sum de cotizaciones; recotización pierde versión |
| **Alto** | Funcionalidad importante no funciona pero hay workaround | Filtro por sector devuelve 0; no se puede editar fechas históricas; PDF sin logo |
| **Medio** | UX degradada, error poco probable | Falta confirmación al borrar; tooltip roto; input acepta negativos |
| **Bajo** | Cosmético, polish | Espacios, alineación, typo |

---

## Entregables finales

Al cerrar la ronda de QA, producí:

1. **Tabla de los 20 bugs** con status actualizado (✅ Fixed / ⚠️ Regresión / ❌ No verificado / 🆕 Efecto secundario)
2. **Lista de bugs nuevos** numerada (N-01, N-02, ...) con el formato completo
3. **Tabla de invariantes**: cuáles se sostienen, cuáles no (con query SQL de prueba y resultado)
4. **Matriz de módulos**: % de cobertura / casos pasados / fallados por cada uno de los 11 módulos prioritarios
5. **Recomendación go/no-go para el 17-abril** con 3 bullets max justificando
6. **Diff de tests nuevos**: si encontraste bugs no cubiertos por los 102 existentes, proponer nuevos tests en `src/__tests__/qa-flujo-completo.test.ts` (listos para ser agregados)
7. **Correr `npm test` al final**: verificar que sigue 102/102 pasando después de tus investigaciones
8. **Correr `npm run build` al final**: verificar que el build sigue OK

---

## Regla de oro final

**Si dudás, consultá la BD.** El estado real está en Supabase. La UI es una proyección que puede mentir por caché, estado local desincronizado, o bugs sutiles de render. Cada reporte de bug debe incluir al menos una query que demuestre la divergencia — o la confirme como tal.

Empezá ahora. Reportá progreso cada 10 casos probados.
