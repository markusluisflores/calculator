# Calculator App

A Neumorphic Dark web calculator built with Vite + React.

## Stack
- Vite 8 + React 19
- Plain CSS (no UI libraries)
- No test framework in V1 (manual browser testing)

## Project Structure
- `src/components/` — presentational React components
- `src/hooks/useCalculator.js` — all calculator logic
- `src/styles/index.css` — all CSS with neumorphic custom properties (created in Task 2 — currently src/index.css exists as Vite default)

Note: `src/components/`, `src/hooks/`, and `src/styles/` directories are created during implementation tasks 2–8.

## Dev Commands
- `npm run dev` — start dev server at http://localhost:5173
- `npm run build` — production build
- `npm run preview` — preview production build

## Design
- Background: #0f172a (deep navy) / Card surface: #1b2336
- Accent: #22c55e (bright green) for operators and active tab
- Flat elevated card buttons with subtle border
- Inter font via Google Fonts
