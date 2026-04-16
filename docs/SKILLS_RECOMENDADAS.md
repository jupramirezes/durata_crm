# Skills / MCPs recomendados para mejorar UI/UX de DURATA CRM

## Ya instalados
- Supabase MCP
- Vercel MCP
- Claude_in_Chrome (browser testing)
- Claude_Preview (dev server)
- Notion MCP
- n8n-workflows (skill)
- vercel-react-best-practices (skill)
- Sentry (SDK, falta DSN en Vercel)

## Para UI/UX — instalar en orden de impacto

### 1. shadcn/ui (componentes profesionales, no es MCP sino un generator)
**Qué hace**: genera componentes React/Tailwind con Radix UI debajo — los mismos que usan Vercel, Linear, Hapi.
**Instalación**:
```bash
npx shadcn@latest init
npx shadcn@latest add button dialog dropdown-menu select toast card
```
**Valor**: reemplaza ~15 componentes custom mal estilizados (Button, Modal, Select, etc.) con versiones accesibles + hermosas por default. Tu CSS queda más limpio.

### 2. Figma MCP
**Qué hace**: Claude lee tus mockups de Figma y genera código exacto.
**Instalación**: claude.ai/code → Connectors → Figma
**Valor**: si diseñas cómo querés que se vea (incluso en 30 min en Figma), Claude implementa en el doble de velocidad vs. describírselo.

### 3. Tailwind Docs MCP (opcional)
**Qué hace**: Claude consulta la doc de Tailwind actualizada.
**Valor**: menor, pero útil para patterns modernos.

### 4. Playwright MCP (para testing visual)
**Qué hace**: permite a Claude tomar screenshots y comparar antes/después de cambios UI.
**Instalación**:
```bash
npm install -D @playwright/test
npx playwright install
```
**Valor**: evita que un refactor visual rompa algo en otra página sin que te enteres.

## Skills propias que ya creé
- `durata-migrate`: pipeline completo de migración
- `durata-qa-invariants`: 8 checks de integridad de BD
- `durata-dump-catalogo`: regenerar SQL de productos

## Skills que podés crear en el futuro
- `durata-ux-audit`: auditoría visual de las 12 páginas contra un checklist
- `durata-create-release`: bump version, changelog, tag, push, Vercel deploy en 1 comando
- `durata-new-producto`: wizard para agregar un producto nuevo al catálogo con sus variables
