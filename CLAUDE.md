# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Art Heist is a browser-based game where players navigate a zigzag path across the screen, collecting artwork thumbnails from the Art Institute of Chicago while avoiding security guards, laser tripwires, and spotlight patrols.

## Development Commands

```bash
npm install     # Install dependencies
npm run dev     # Start Vite dev server (http://localhost:5173)
npm run build   # Build for production (outputs to dist/)
npm run preview # Preview production build
```

## Architecture

Single-file vanilla JavaScript game in `index.html` (~2100 lines):
- **CSS** (lines 8-358): Styles including animations, accessibility features, reduced-motion support
- **HTML** (lines 360-408): Semantic structure with ARIA roles, title screen, game canvas, finish screen
- **JavaScript** (lines 410-2103): Game logic, rendering, audio, and API integration

### Key Game Systems

1. **Game Loop** (`gameLoop()`, `update()`, `draw()`): requestAnimationFrame loop with time-scaled updates for slow-motion effects

2. **Player Movement**: 45° diagonal path with top/bottom wraparound; direction toggled by holding spacebar

3. **Combo System**: Rapid art collection within 2-second window multiplies points (up to 5x) with escalating visual/audio feedback

4. **Guard Types** (`GUARD_TYPES`):
   - `normal`: Standard patrol guards
   - `fast`: Faster movement (level 3+)
   - `stationary`: Rotating spotlight beam (level 5+)

5. **Power-ups** (level 2+): Speed boost, invisibility, art magnet - spawn as colored orbs with emoji icons

6. **Laser Tripwires** (level 4+): Pulsing red beams that cycle on/off

7. **Art Institute API Integration** (`fetchArtworks()`): Groups public domain artworks by `style_title`, selects random style per level

8. **CORS Handling**:
   - Local dev: Vite proxy (`/iiif` → `artic.edu`) in `vite.config.js`
   - Production: Direct IIIF URLs

### Visual Effects

- **Particle System** (`particles[]`): Explosions, collection sparkles, floating score text
- **Screen Effects**: Shake, flash, zoom, dynamic vignette (intensifies near guards)
- **Neon Trail**: Glowing path with outer glow layer
- **Proximity Glow**: Artworks pulse when player approaches
- **Speed Lines**: Motion blur effect behind player

### Audio Systems

- **Background Music** (`startBackgroundMusic()`): Procedural ambient loop via Web Audio API
- **Heartbeat** (`playHeartbeat()`): Speeds up based on `dangerLevel` proximity to guards
- **Sound Effects**: Collect (pitch scales with combo), power-up, near-miss whoosh, level complete fanfare, caught

### Accessibility

- Screen reader announcements via `aria-live` region
- `prefers-reduced-motion` media query disables animations
- High contrast text (upgraded from #888 to #b0b0b0/#d0d0d0)
- Semantic HTML with ARIA roles
- Focus indicator on canvas
- Keyboard-only controls

### State Management

All game state in `gameState` object:
- Player position, path history, direction
- Guards, artworks, power-ups, lasers arrays
- Combo counter and timer
- Time scale for slow-mo
- Power-up active states and timers
- Danger level for heartbeat audio
- High score persisted to localStorage
