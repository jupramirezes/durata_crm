# Migración de datos — REGISTRO MAESTRO y COTIZACIONES 2026

**Actualizado:** 16 abril 2026

## Cuándo hacerlo

- Cada semana o cuando se tenga un REGISTRO actualizado de DURATA
- Después de recibir archivos Excel actualizados del equipo comercial
- El script es **idempotente**: correrlo 2 veces no duplica datos

## Archivos necesarios

Copiar los Excel a `scripts/data/`:

```
scripts/data/REGISTRO_MAESTRO.xlsx              — histórico completo (hoja TOTAL)
scripts/data/REGISTRO COTIZACIONES DURATA 2026.xlsx  — cotizaciones del año (hoja "REGISTRO 2026")
```

Los nombres deben ser exactos. Los archivos NO se suben al repo (están en `.gitignore`).

## Flujo completo

### 1. Diagnóstico previo (sin tocar BD)

```bash
node scripts/_diag-migracion.mjs
```

Reporta: filas sin empresa, duplicados en Excel, cuántas se insertarían, COTs que colisionan. **No modifica nada.**

```bash
node scripts/_diag-estancadas.mjs
```

Detecta oportunidades en BD en `nuevo_lead`/`en_cotizacion` que el Excel marca como COTIZADA/ADJUDICADA/PERDIDA. Genera `scripts/data/_estancadas-updates.json` como referencia.

### 2. Correr migración

```bash
npm run migrate
```

Internamente ejecuta `npx tsx scripts/migrar-historico.ts`, que:

1. Se autentica contra Supabase (usa credenciales de `.env`)
2. Lee estado actual de BD (empresas, contactos, oportunidades, cotizaciones)
3. Lee los 2 Excels fila por fila
4. **PASO 1-4**: Inserta empresas, contactos, oportunidades y cotizaciones NUEVAS (dedup case-insensitive por nombre/COT normalizado)
5. **PASO 5.5**: Avanza automáticamente oportunidades estancadas cuando MAESTRO tiene COTIZADA/ADJUDICADA/PERDIDA y la BD tiene `nuevo_lead`/`en_cotizacion`. **Nunca retrocede etapa.**
6. **PASO 6**: Enriquece con data del 2026 (fecha_envio, ubicacion, notas, proyecto) — solo avanza etapa si es strictly greater
7. **PASO 7**: Inserta cotizaciones nuevas
8. Sincroniza estado de cotización al avanzar (aprobada/rechazada/enviada)

Reglas estrictas:
- **NUNCA borra** datos existentes
- **NUNCA actualiza** oportunidades que ya existían (solo las que ESTA corrida creó, en PASO 6)
- Usa `MIGRATION_MARKER = 'Histórico Excel'` como fuente_lead para ops migradas

### 3. Verificar resultado

```bash
npx tsx scripts/check-counts.ts
```

Comparar antes vs después. Los nuevos registros deben aparecer, los existentes no se duplican.

### 4. Migrar adjuntos APU/PDF del 2026

```bash
# Preview (sin subir nada)
node scripts/_migrate-adjuntos-2026.mjs --dry-run --fuzzy

# Ejecutar (sube a Supabase Storage)
node scripts/_migrate-adjuntos-2026.mjs --fuzzy
```

El script busca archivos APU Excel y PDF en la carpeta de red, los matchea con cotizaciones en BD por número, y los sube al bucket `archivos-oportunidades`. El flag `--fuzzy` permite matchear sufijos (2026-128A → 2026-128 si no existe la A en BD).

### 5. Re-dump catálogo de productos

```bash
node scripts/_dump-productos.mjs
```

Regenera `supabase/productos/_auto/*.sql` desde la BD en vivo. Útil para versionar el catálogo después de agregar/modificar productos.

## Scripts de referencia

| Script | Qué hace | Modifica BD? |
|---|---|---|
| `npm run migrate` | Migración completa Excel → Supabase | Sí (INSERT only) |
| `_diag-migracion.mjs` | Preview sin tocar BD | No |
| `_diag-estancadas.mjs` | Detecta ops que deberían avanzar | No |
| `_migrate-adjuntos-2026.mjs` | Sube APU/PDF a Storage | Sí (Storage + UPDATE cot) |
| `_dump-productos.mjs` | Re-dump catálogo a SQL files | No |
| `check-counts.ts` | Conteos de tablas | No |

## Solución de problemas

### Error de conexión
Verificar `.env` con credenciales correctas (no las de `.env.example`).

### Script no encuentra archivos
Los Excel deben estar en `scripts/data/` con nombres exactos.

### El migrate reporta "0 nuevas"
Es correcto si ya se corrió antes — el script es idempotente.

### Adjuntos sin match
Correr con `--report` para generar `scripts/data/_adjuntos-sin-match.csv` con detalles de cada archivo sin match y sugerencias.
