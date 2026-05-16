# Earth Simulator

A digital globe visualization project built with CesiumJS, React, and TypeScript.

## Quick Start

```bash
npm install
npm run dev
```

Default development URL:

```text
http://127.0.0.1:5173/
```

If the port is already in use, specify one manually:

```bash
npm run dev -- --port 5180 --strictPort
```

## Scripts

- `npm run dev`: Sync Cesium static assets and start the Vite development server.
- `npm run build`: Sync Cesium static assets, run type checking, and build production assets.
- `npm run typecheck`: Run TypeScript type checking.
- `npm run sync:cesium`: Copy Cesium runtime assets into `public/cesium/`.

## Architecture

- `src/app/`: React application entry UI.
- `src/globe/`: Cesium Viewer, layer lifecycle code, and global globe state.
- `src/features/points/`: Point data loading and type definitions.
- `src/features/routes/`: Minimum spanning tree route calculation based on great-circle distance.
- `public/data/points.json`: Cleaned point data.

## Notes

The local Node version is 16.x, so Cesium is pinned to `1.109.0` and Cesium subpackages are pinned to avoid resolving dependencies that require a newer Node version.

The current React/Cesium application entry points are the root `index.html` file and `src/main.tsx`.
