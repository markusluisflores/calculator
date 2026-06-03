# Calculator App

A web calculator built with Vite + React. Currently ships Basic and Scientific modes.

## Stack
- Vite 8 + React 19
- Plain CSS (no UI libraries)
- math.js — expression evaluation for Scientific mode
- Vitest + @testing-library/react — unit tests for hook logic

## Project Structure
- `src/components/` — presentational React components
- `src/hooks/useCalculator.js` — Basic calculator state machine
- `src/hooks/useScientificCalculator.js` — Scientific expression model + math.js evaluation
- `src/styles/index.css` — all CSS with Code Green design tokens
- `src/test/` — unit tests (Vitest)
- `docs/superpowers/specs/` — approved design specs
- `docs/superpowers/plans/` — implementation plans

## Dev Commands
- `npm run dev` — start dev server at http://localhost:5173
- `npm test` — run unit tests (Vitest)
- `npm run test:watch` — watch mode
- `npm run build` — production build
- `npm run preview` — preview production build

## Design (Code Green theme)
- Background: #0f172a (deep navy) / Card surface: #1b2336
- Accent: #22c55e (bright green) for operators, active tab, and 2nd-key active state
- Flat elevated card buttons with subtle border
- Inter font via Google Fonts

## Calculator Tabs
- **Basic** — two-operand state machine, keyboard support, = repeat
- **Scientific** — math.js expression model, 2nd-key toggle, DEG/RAD, = repeat
- **Rates** — placeholder (V3)

## Testing
All hook logic must have unit tests. Run `npm test` before opening any PR.
Test files live in `src/test/` and follow the naming convention `<module>.test.js`.
