# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Art Heist is a browser-based game where players navigate a zigzag path across the screen, collecting artwork thumbnails from the Art Institute of Chicago while avoiding security guards.

## Development Commands

```bash
npm install     # Install dependencies
npm run dev     # Start Vite dev server (http://localhost:5173)
npm run build   # Build for production (outputs to dist/)
npm run preview # Preview production build
```

## Architecture

This is a single-file vanilla JavaScript game with no framework. The entire game lives in `index.html`:
- **CSS** (lines 7-197): Inline styles for game UI, toast notifications, and finish screen
- **HTML** (lines 199-226): Canvas element, UI overlays, and finish screen template
- **JavaScript** (lines 228-1121): Game logic, rendering, and API integration

### Key Game Systems

1. **Game Loop** (`gameLoop()`, `update()`, `draw()`): Standard requestAnimationFrame loop with separate update and render phases

2. **Player Movement**: 45° diagonal path that bounces between top/bottom edges; direction toggled by holding spacebar

3. **Art Institute API Integration** (`fetchArtworks()`): Fetches 100 public domain artworks grouped by `style_title`, then selects a random style per level

4. **CORS Handling**:
   - Local dev: Uses Vite proxy (`/iiif` → `artic.edu`) configured in `vite.config.js`
   - Production: Direct IIIF URLs (GitHub Pages compatible)

5. **Particle System** (`particles[]`, `spawnCollectParticles()`, `drawParticles()`): Visual effects for collecting art and getting caught

6. **Audio** (`playCollectSound()`, `playCaughtSound()`): Web Audio API synthesized sound effects

### State Management

All game state is in the `gameState` object including:
- Player position and path history
- Guards array (with oscillating movement)
- Artworks array (with collection status)
- Current art style and used styles tracking
- Stolen artworks for finish screen display
