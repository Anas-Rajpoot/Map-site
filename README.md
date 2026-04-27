# garagErasmus Interactive Map

  An interactive 3D globe map of the garagErasmus network, built with React, D3.js, and TypeScript.

  ## Features
  - 3D orthographic globe with drag rotation and scroll zoom
  - Yellow pins for gE4Cities, dark blue pins for Universities
  - Edit mode: drag pins to reposition, click to edit name/description/website
  - Server-side persistence via REST API
  - Export/Import positions as JSON

  ## Tech Stack
  - React + Vite + TypeScript
  - D3.js geoOrthographic projection + TopoJSON
  - Tailwind CSS v4
  - Express.js API server (pnpm monorepo)
  