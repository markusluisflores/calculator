# Calculator App

A Neumorphic Dark web calculator built with Vite + React.

## Stack
- Vite 5 + React 18
- Plain CSS (no UI libraries)
- No test framework in V1 (manual browser testing)

## Project Structure
- `src/components/` — presentational React components
- `src/hooks/useCalculator.js` — all calculator logic
- `src/styles/index.css` — all CSS with neumorphic custom properties

## Dev Commands
- `npm run dev` — start dev server at http://localhost:5173
- `npm run build` — production build
- `npm run preview` — preview production build

## Design
- Background: #1e1e2e (deep navy)
- Accent: #cba6f7 (lavender) for operators and active tab
- Neumorphic shadows: raised buttons, inset display and tab container
