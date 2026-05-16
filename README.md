# dungeon-game

Roguelike dungeon crawler con generación procedural de armas, mazmorras orgánicas (Physarum ants), y rendering pixel art en Canvas 2D.

Parte del ecosistema **procedimental.com** — deployado como sub-proyecto Next.js independiente.

## Stack

- **Next.js 16** (App Router)
- **React 19**, **TypeScript**
- **Canvas 2D API** (sin sprites, sin WebGL)
- **Tailwind CSS v4**
- Desplegado en **Vercel** con `basePath: "/games/dungeons"`

## Desarrollo

```bash
npm install
npm run dev
```

El juego corre en `http://localhost:3000/games/dungeons`.

## Features

- Mazmorras procedurales con BSP + simulación de hormigas (Physarum)
- Armas procedurales con stats, rareza, críticos
- Enemigos con IA táctica (squads, flanqueo, alerta)
- Inventario RPG con equipamiento
- Iluminación dinámica estilo Among Us
- Pathfinding A*
