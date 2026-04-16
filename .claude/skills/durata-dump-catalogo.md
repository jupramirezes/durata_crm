---
name: durata-dump-catalogo
description: Regenerate supabase/productos/_auto/*.sql from live Supabase data
---

# DURATA Catalog Dump

Regenerate the versioned SQL files for all 33 active products from the live Supabase database.

## When to use
- After editing a product in the Supabase dashboard
- After adding a new product via seed-producto.ts
- Before committing changes that touched productos_catalogo

## Steps

### Step 1: Run dump script
```bash
node scripts/_dump-productos.mjs
```

Expected output: "33 archivos escritos" + "2011 rows dumpeadas" (numbers may vary if products were added/modified).

### Step 2: Verify
```bash
ls supabase/productos/_auto/*.sql | wc -l
```
Should match the number of active products in `productos_catalogo`.

### Step 3: Diff check
```bash
git diff --stat supabase/productos/_auto/
```
Review which files changed. If only `desc_template` or `margen_default` changed, that's expected after M14 or config edits.

### Step 4: Commit if changed
```bash
git add supabase/productos/_auto/
git commit -m "chore(catalog): re-dump productos from live Supabase"
```

## Notes
- The dump script reads from Supabase (requires auth via .env)
- Files in `supabase/productos/_auto/` are auto-generated — do NOT edit manually
- Files in `supabase/productos/*.sql` (without _auto) ARE manually maintained
