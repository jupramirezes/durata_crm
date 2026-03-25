# Backup de Supabase

## Backup manual (semanal recomendado)

### Opcion 1: Desde el dashboard de Supabase

1. Ir a [supabase.com](https://supabase.com) → proyecto DURATA
2. Settings → Database → Backups
3. Click "Download backup"
4. Guardar el archivo `.sql` en carpeta segura (Google Drive, carpeta de red compartida)
5. Nombrar con fecha: `backup_durata_20260325.sql`

### Opcion 2: Desde linea de comandos

```bash
pg_dump postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres > backup_$(date +%Y%m%d).sql
```

El connection string se encuentra en Supabase → Settings → Database → Connection string.

## Restaurar backup

```bash
psql postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres < backup_YYYYMMDD.sql
```

**CUIDADO:** Esto sobreescribe los datos actuales. Solo usar en caso de emergencia.

## Backup de Storage (archivos adjuntos)

Los archivos subidos (APUs, PDFs de productos) estan en el bucket `archivos-oportunidades` de Supabase Storage.

Para hacer backup:

1. Ir a Supabase → Storage → archivos-oportunidades
2. Descargar manualmente las carpetas necesarias
3. O usar la CLI de Supabase:

```bash
# Listar archivos
supabase storage ls archivos-oportunidades

# Descargar todo
supabase storage cp -r supabase://archivos-oportunidades ./backup-storage/
```

## Frecuencia recomendada

| Tipo | Frecuencia | Responsable |
|------|-----------|-------------|
| Base de datos | Semanal (viernes) | Administrador |
| Storage | Mensual | Administrador |
| Antes de migracion | Siempre | Quien corra la migracion |

## Notas

- Supabase (plan Pro) hace backups automaticos diarios con retencion de 7 dias
- Los backups manuales son una capa adicional de seguridad
- Siempre hacer backup ANTES de correr migraciones masivas
- Los archivos de backup pueden ser grandes; comprimir con `gzip` si es necesario
