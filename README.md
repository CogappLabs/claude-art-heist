# Art Heist

A browser-based game where you play as an art thief navigating through museum galleries, stealing famous artworks while avoiding security guards.

## Features

- **Real artwork** from the Art Institute of Chicago's public domain collection
- **Themed levels** - each level features a different art style (Impressionism, Baroque, Realism, etc.)
- **Dynamic guards** that patrol in unpredictable patterns
- **Finish screen** showing your complete heist haul with artwork details
- **Simple one-button controls** - just hold spacebar to change direction

## How to Play

- Your path moves automatically from left to right at a 45° angle
- **Hold SPACE** to angle upward, **release** to angle downward
- **Collect artworks** (gold-framed images) for +50 points each
- **Avoid guards** (👮) - touching one ends your heist
- **Reach the right edge** to advance to the next level (+100 points)
- Each level adds more guards and artworks
- **Press R** to restart at any time

## Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)

### Setup

1. Clone or download this repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open the URL shown in your terminal (usually http://localhost:5173)

### Why Vite?

For local development, the game uses Vite's proxy to fetch artwork images from the Art Institute of Chicago's IIIF server, avoiding CORS issues. See `vite.config.js` for the configuration.

## Deploying to GitHub Pages

The game automatically detects whether it's running locally or on a remote server and adjusts image URLs accordingly.

1. Create a GitHub repository and push your code

2. Go to **Settings** → **Pages**

3. Under "Build and deployment", select:
   - **Source**: Deploy from a branch
   - **Branch**: `main` (or your default branch)
   - **Folder**: `/ (root)`

4. Click **Save**

5. Your game will be live at `https://<username>.github.io/<repo-name>/`

### Alternative: GitHub Actions (for build step)

If you want to use Vite's build process:

1. Run `npm run build` locally
2. The built files will be in the `dist/` folder
3. Deploy the `dist/` folder contents to GitHub Pages

Or set up a GitHub Action to build automatically on push.

## Project Structure

```
├── index.html      # The complete game (HTML + CSS + JS)
├── vite.config.js  # Vite configuration with IIIF proxy
├── package.json    # Project dependencies
├── prompts.md      # Development prompts used to build this game
└── README.md       # This file
```

## API

This game uses the [Art Institute of Chicago API](https://api.artic.edu/docs/) to fetch public domain artworks. The API provides:

- Artwork metadata (title, artist, date, medium, style)
- IIIF image URLs for thumbnails

## Credits

- Artwork images courtesy of the [Art Institute of Chicago](https://www.artic.edu/) (public domain)
- Built with [Vite](https://vitejs.dev/)

## License

MIT
