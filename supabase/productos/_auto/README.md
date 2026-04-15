# Dump automático del catálogo de productos
**Fecha**: 2026-04-15
**Productos**: 33
**Total rows**: 2011

## Regenerar
```bash
node scripts/_dump-productos.mjs
```

## Restaurar un producto
```bash
npx tsx scripts/seed-producto.ts supabase/productos/_auto/<producto>.sql
```

## Diferencia con `supabase/productos/*.sql` (sin _auto/)
Los archivos en el directorio padre son **mantenidos manualmente** (mesa, carcamo,
estanteria_graduable, repisa) con comentarios explicativos y estructura cuidada.
Los de `_auto/` son dump directo de la BD — sin formato decorativo.

## Productos incluidos

| ID | Nombre | Grupo |
|---|---|---|
| `barra_abatible` | Barra Abatible Discapacitados | otros |
| `barra_l` | Barra L Discapacitados (Piso-Muro) | otros |
| `barra_recta` | Barra Recta Discapacitados | otros |
| `39231b77-1bd2-437a-a925-57ce191c82db` | Caja Sifonada Hierro | accesorios |
| `3547a7da-459a-4d69-9ba9-c63e4be290b2` | Caja Sifonada Inox | accesorios |
| `acb8071b-74ee-481f-888d-87b65bcc63ae` | Campana | campanas |
| `16ced57a-109b-4936-bcc9-2cd9e5142c09` | Campana Isla | campanas |
| `cf57da93-2808-4ec6-9ce4-460ecdafe5de` | Campana Mural | campanas |
| `carcamo` | Cárcamo | Cárcamos |
| `b00a14b6-9283-4218-8205-ac9e1282a238` | Deslizador Bandejas | autoservicios |
| `ductos` | Ductos | campanas |
| `d5173086-024b-4593-ba5a-d978acdf23f3` | Estantería Escabiladero | estanterias |
| `estanteria_graduable` | Estantería Graduable | Estanterías |
| `a28c1c1d-13f6-45b1-b4e1-6424b7e5f999` | Estantería Perforada | estanterias |
| `d75102a3-2353-460b-8d72-16b37d4e444a` | Estantería Ranurada | estanterias |
| `bb57c6d6-5fbb-42c5-962c-32bf69eb2421` | Gabinete | muebles |
| `cca3b943-e027-4acc-a71b-f434818c4c74` | Gabinete Corredizo | muebles |
| `3fb1108f-594b-41fd-ac50-b331beb28ab9` | Lavabotas | accesorios |
| `5abde872-b76b-4e34-b84e-a8d387206fa8` | Lavaescobas Fregadero | accesorios |
| `0ad70dd0-16da-4e1d-a822-b506c0632146` | Lavaescobas Sencillo | accesorios |
| `3eff1871-73e8-4e6e-83bb-95ec537ef4e9` | Lavaollas | accesorios |
| `mesa` | Mesa en acero inoxidable | Mesas |
| `abc09f5b-3294-4559-82e8-2214a1d05a79` | Mesón | mesones |
| `353cf35e-9806-49c7-854b-3d89c25d31e5` | Mueble Inferior | muebles |
| `1d328992-85cc-4fa3-a19f-9ab23f5a3c6f` | Mueble Superior | muebles |
| `be9e99c1-ab14-4208-b5d7-e7e8385bb18b` | Pozuelo Corrido Industrial | pozuelos |
| `69437e46-90e0-45ee-8b2e-c2a8ca092498` | Pozuelo Cuadrado Babero | pozuelos |
| `f75d7089-97da-4252-a22a-229c0efb4833` | Pozuelo Esférico Babero | pozuelos |
| `05c37c2f-3e93-4d5b-82b0-d6af77015dd1` | Pozuelo Pedestal Ancho | pozuelos |
| `f47bf64d-6c9b-46b5-b6ff-5015eac1203b` | Pozuelo Quirúrgico | pozuelos |
| `8b1cd428-c583-44cb-8cdd-7ef00314c71a` | Pozuelo Solo | accesorios |
| `repisa` | Repisa | otros |
| `1b33a212-14dd-48ba-a9f1-b97cac029eac` | Vertedero | accesorios |
