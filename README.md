# PUBG RangeFinder — local version

A local-runnable copy of the public PUBG RangeFinder at
<https://rangefinder.pages.dev/rondo>.

The app renders high-resolution PUBG battleground maps on an HTML canvas and
measures the straight-line distance between two markers.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

```bash
npm install
npm start
```

`npm install` also restores the bundled high-resolution map images from the
lossless chunks in `asset-chunks/`. This keeps the repository compatible with
the upload pipeline while reproducing the original image bytes exactly.

Open the URL printed by Vite (normally <http://localhost:5173>) or go directly
to <http://localhost:5173/rondo>.

## Controls

- **Right-click** twice on the map to place two distance markers.
- **Right-click** again to start a new measurement.
- **Left-drag** the map to pan.
- Panning is constrained to the map edges, so the image cannot be dragged off-screen.
- **Left-drag a marker** to adjust an endpoint.
- Use the **mouse wheel** or the **+ / − buttons** to zoom.
- Select a battleground in the top navigation to switch maps.

## Production build

```bash
npm run build
npm run preview
```

The static production files are generated in `dist/`.

## Implementation overview

- Vue 3, Vue Router, Vuex, TypeScript, and Vite
- HTML Canvas for map rendering, panning, zooming, markers, and the measurement overlay
- Seven bundled maps: Erangel, Miramar, Taego, Sanhok, Vikendi, Deston, and Rondo
- Distance scale: 1,000 in-game metres per 1,024 source-map pixels
