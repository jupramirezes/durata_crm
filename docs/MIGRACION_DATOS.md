# Migracion de datos — REGISTRO MAESTRO y COTIZACIONES 2026

## Cuando hacerlo

- Cada semana o cuando se tenga un REGISTRO actualizado de DURATA
- Despues de recibir archivos Excel actualizados del equipo comercial

## Archivos necesarios

- `REGISTRO_MAESTRO.xlsx` — historico completo de oportunidades
- `REGISTRO_COTIZACIONES_DURATA_2026.xlsx` — cotizaciones del ano en curso

## Pasos

### 1. Preparar archivos

Copiar los Excel actualizados a la carpeta `scripts/data/`:

```bash
# Verificar que existen
ls scripts/data/REGISTRO_MAESTRO.xlsx
ls scripts/data/REGISTRO_COTIZACIONES_DURATA_2026.xlsx
```

Los nombres deben ser exactos. Si vienen con otro nombre, renombrarlos.

### 2. Verificar estado actual

```bash
npx tsx scripts/check-counts.ts
```

Esto muestra el conteo actual de cada tabla. Anotar los numeros para comparar despues.

### 3. Correr migracion

```bash
npx tsx scripts/migrar-historico.ts
```

El script procesa cada fila del Excel y:

- Si la empresa NO existe en Supabase → la crea
- Si el contacto NO existe → lo crea vinculado a la empresa
- Si la oportunidad NO existe (por numero de cotizacion) → la crea
- Si YA existe → actualiza el estado si cambio (ej: COTIZADA → ADJUDICADA)
- NUNCA borra datos existentes

### 4. Correr correccion de fechas

```bash
npx tsx scripts/corregir-fechas.ts
```

Este script recalcula y corrige fechas faltantes o inconsistentes usando los datos del REGISTRO.

### 5. Verificar resultado

```bash
npx tsx scripts/check-counts.ts
```

Comparar antes vs despues:

- Los nuevos registros deben aparecer
- Los existentes no se duplican
- El total debe ser >= al anterior

## Que hace el script internamente

1. Lee los Excel fila por fila usando la libreria `xlsx`
2. Para cada fila, busca si ya existe en Supabase por numero de cotizacion
3. Si NO existe: crea empresa (si es nueva), contacto, oportunidad, cotizacion
4. Si YA existe: actualiza estado si cambio (ej: de COTIZADA a ADJUDICADA)
5. Usa UPSERT para evitar duplicados
6. NUNCA borra datos existentes

## Solucion de problemas

### Error de conexion

Verificar que el archivo `.env` tiene las credenciales correctas:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Duplicados

El script usa UPSERT basado en el numero de cotizacion. Si aparecen duplicados, verificar que el campo `numero` en el Excel no tiene variaciones (espacios, mayusculas, etc).

### Faltan fechas

Correr `corregir-fechas.ts` despues de la migracion. Este script calcula las fechas faltantes a partir de los datos del REGISTRO.

### El script no encuentra los archivos

Verificar que estan en `scripts/data/` con los nombres exactos. Los archivos NO se suben al repo (estan en `.gitignore`).

### Timeout o error de rate limit

Si el Excel tiene muchas filas, el script puede tardar. Esperar y reintentar. El script es idempotente: correrlo de nuevo no duplica datos.
