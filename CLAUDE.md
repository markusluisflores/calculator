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

## Feature Development Workflow (MANDATORY)
Every feature or fix — no matter how small — follows this sequence:

1. **Branch** — `git checkout -b <type>/<short-description>` before touching any code
2. **Brainstorm** — invoke `superpowers:brainstorming` before implementing anything new
3. **Plan** — invoke `superpowers:writing-plans` to produce a spec + implementation plan
4. **Implement** — use `superpowers:subagent-driven-development` to execute the plan with two-stage reviews
5. **Test** — all logic files must have passing unit tests before a PR is opened (`npm test`)
6. **Security check** — run `/security-review` on the diff before pushing
7. **Finish** — use `commit-commands:commit-push-pr` to open a PR; never push directly to `main`

## Mandatory Skills by Situation
| Situation | Skill to invoke |
|---|---|
| Any bug or unexpected behavior | `superpowers:systematic-debugging` before proposing a fix |
| Any new feature or component | `superpowers:brainstorming` first |
| Any implementation task | `superpowers:test-driven-development` for logic files |
| Starting feature work | `superpowers:using-git-worktrees` for isolation |
| Before pushing / creating PR | `/security-review` on the diff |
| After completing implementation | `superpowers:requesting-code-review` |
| Post-implementation cleanup | `/simplify` on changed files |
| Screenshots / UI verification needed | Always provide the localhost URL; Playwright screenshots may not render in all interfaces |
| Any UI design decision or layout brainstorm | `ui-ux-pro-max` skill + domain searches before showing mockups |

## Design Process
Before presenting any layout options or UI decisions during brainstorming, always invoke the `ui-ux-pro-max` skill and run domain searches relevant to the UI being designed. UX validation must happen before mockups are shown to the user.

## Testing
All hook logic must have unit tests. Run `npm test` before opening any PR.
Test files live in `src/test/` and follow the naming convention `<module>.test.js`.
