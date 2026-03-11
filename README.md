# DURATA CRM + Cotizador

Sistema interno de CRM con pipeline de ventas y cotizador automático con APU para mesas en acero inoxidable.

## Inicio rápido (5 minutos)

```bash
npm install
npm run dev
# → Abrir http://localhost:5173
```

La app funciona inmediatamente con datos de demo (5 clientes + 25 materiales con precios reales de DURATA).

## Conectar Supabase (persistencia real)

1. Ir a supabase.com → New Project
2. En Settings → API, copiar Project URL y anon public key
3. Crear archivo .env en la raíz:
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
4. En SQL Editor de Supabase, ejecutar el schema SQL
5. Reiniciar npm run dev

## Deploy a Vercel

1. Subir a GitHub
2. vercel.com → Import → seleccionar repo
3. Agregar variables de entorno
4. Deploy

## Funcionalidades

- Dashboard con contadores por etapa
- Pipeline Kanban con drag and drop
- Registro y gestión de clientes
- Historial de cambios de etapa
- Configurador completo de Mesa lisa con entrepaño
- Cálculo automático de precio (réplica del APU Excel)
- APU desglosado (cada línea de material)
- Descripción comercial autogenerada
- Tabla de precios editable
