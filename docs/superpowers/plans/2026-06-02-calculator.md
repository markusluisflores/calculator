# Calculator App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Neumorphic Dark web calculator with pill-tab navigation, dual-line display, keyboard support, and button press animations using Vite + React.

**Architecture:** `useCalculator` is a pure-logic hook that owns all calculator state via a `processKey` pure function — no state leaks into components. Components are purely visual: `Display` renders expression + result, `ButtonGrid` fires `handleButton` on click. `App` owns which tab is active.

**Tech Stack:** Vite 5, React 18, plain CSS (no UI libraries), Node 18+

---

## File Map

| File | Responsibility |
|---|---|
| `src/main.jsx` | React root mount, CSS import |
| `src/App.jsx` | Tab state, renders TabBar + active mode |
| `src/styles/index.css` | All CSS: neumorphic variables, layout, components |
| `src/components/TabBar.jsx` | Pill tab switcher (presentational) |
| `src/components/Display.jsx` | Dual-line expression + result (presentational) |
| `src/components/Button.jsx` | Single button with press animation (presentational) |
| `src/components/ButtonGrid.jsx` | 4×5 grid, button definitions (presentational) |
| `src/components/BasicCalculator.jsx` | Wires Display + ButtonGrid + useCalculator |
| `src/components/ScientificCalculator.jsx` | "Coming soon" placeholder |
| `src/components/RatesCalculator.jsx` | "Coming soon" placeholder |
| `src/hooks/useCalculator.js` | All math logic, state, keyboard listener |

---

## Task 1: Scaffold the project

**Files:**
- Create: `C:\ClaudeProjects\calculator\` (entire project)
- Create: `C:\ClaudeProjects\calculator\.claude\settings.json`

- [ ] **Step 1: Create the Vite + React project**

The `calculator/` folder already exists (it contains the spec and plan docs). Scaffold Vite into it directly:

```bash
cd C:\ClaudeProjects\calculator
npm create vite@latest . -- --template react
```

Vite will warn that the directory is not empty and ask how to proceed. Select **"Ignore files and continue"** — this preserves the `docs/` folder. Then install dependencies:

```bash
npm install
```

Expected output ends with: `happy hacking!`

- [ ] **Step 2: Initialize git**

```bash
git init
git add .
git commit -m "chore: scaffold Vite + React project"
```

- [ ] **Step 3: Run `/init` to generate project CLAUDE.md**

In Claude Code, run:
```
/init
```

When prompted, confirm the project is a React calculator app. This generates `CLAUDE.md` with project context.

- [ ] **Step 4: Create `.claude/settings.json` with permissions and formatter hook**

Create `C:\ClaudeProjects\calculator\.claude\settings.json`:
```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npx *)",
      "Bash(node *)",
      "Bash(git *)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"src/**/*.{jsx,js,css}\" 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
```

Expected: `VITE v5.x.x  ready in Xms` and `Local: http://localhost:5173/`

Open `http://localhost:5173` — you should see the default Vite + React page with a counter. Close the server (`Ctrl+C`) before continuing.

- [ ] **Step 6: Commit settings**

```bash
git add .claude/settings.json CLAUDE.md
git commit -m "chore: add project settings and CLAUDE.md"
```

---

## Task 2: Remove Vite defaults and build CSS foundation

**Files:**
- Delete: `src/App.css`, `src/assets/react.svg`, `public/vite.svg`
- Modify: `src/main.jsx`
- Create: `src/styles/index.css`

- [ ] **Step 1: Delete Vite boilerplate files**

```bash
rm src/App.css
rm src/assets/react.svg
rm public/vite.svg
```

- [ ] **Step 2: Replace `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 3: Create `src/styles/index.css`**

```css
:root {
  --bg: #1e1e2e;
  --shadow-dark: #13131f;
  --shadow-light: #29293d;
  --accent: #cba6f7;
  --accent-fg: #1e1e2e;
  --text-primary: #cdd6f4;
  --text-secondary: #6c7086;
  --text-utility: #a6adc8;
  --shadow-raised: 4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light);
  --shadow-inset: inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light);
  --radius-btn: 12px;
  --radius-display: 14px;
  --radius-pill: 50px;
  --radius-card: 20px;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--bg);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

#root {
  width: 100%;
  max-width: 380px;
  padding: 24px 16px;
}
```

- [ ] **Step 4: Replace `src/App.jsx` with a minimal shell to verify CSS loads**

```jsx
export default function App() {
  return <div style={{ color: 'var(--text-primary)', textAlign: 'center' }}>Loading…</div>
}
```

- [ ] **Step 5: Start dev server and verify**

```bash
npm run dev
```

Open `http://localhost:5173`. You should see a dark navy background with "Loading…" centered on screen. If the background is still white, hard-refresh (`Ctrl+Shift+R`).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove Vite defaults, add neumorphic CSS foundation"
```

---

## Task 3: TabBar component

**Files:**
- Create: `src/components/TabBar.jsx`
- Modify: `src/styles/index.css` (append tab styles)

- [ ] **Step 1: Create `src/components/TabBar.jsx`**

```jsx
export default function TabBar({ tabs, active, onChange }) {
  return (
    <div className="tab-bar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-item${active === tab.id ? ' tab-item--active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Append tab styles to `src/styles/index.css`**

```css
/* TabBar */
.tab-bar {
  background: #181825;
  border-radius: var(--radius-pill);
  padding: 4px;
  display: flex;
  gap: 4px;
  box-shadow: var(--shadow-inset);
  margin-bottom: 20px;
}

.tab-item {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-family: inherit;
  padding: 8px 4px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.tab-item--active {
  background: var(--accent);
  color: var(--accent-fg);
  font-weight: 600;
}
```

- [ ] **Step 3: Update `src/App.jsx` to render TabBar**

```jsx
import { useState } from 'react'
import TabBar from './components/TabBar'

const TABS = [
  { id: 'basic', label: 'Basic' },
  { id: 'scientific', label: 'Scientific' },
  { id: 'rates', label: 'Rates' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('basic')

  return (
    <div>
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
        Active: {activeTab}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify in browser**

The pill tab bar appears at the top. Clicking each tab highlights it in lavender and updates the "Active:" text below. The container has a subtle inset shadow.

- [ ] **Step 5: Commit**

```bash
git add src/components/TabBar.jsx src/styles/index.css src/App.jsx
git commit -m "feat: add pill TabBar component"
```

---

## Task 4: Placeholder tabs

**Files:**
- Create: `src/components/ScientificCalculator.jsx`
- Create: `src/components/RatesCalculator.jsx`
- Modify: `src/styles/index.css` (append placeholder styles)
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/components/ScientificCalculator.jsx`**

```jsx
export default function ScientificCalculator() {
  return (
    <div className="placeholder">
      <p className="placeholder__title">Scientific</p>
      <p className="placeholder__subtitle">Coming soon</p>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/RatesCalculator.jsx`**

```jsx
export default function RatesCalculator() {
  return (
    <div className="placeholder">
      <p className="placeholder__title">Exchange Rates</p>
      <p className="placeholder__subtitle">Coming soon</p>
    </div>
  )
}
```

- [ ] **Step 3: Append placeholder styles to `src/styles/index.css`**

```css
/* Placeholder */
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  gap: 10px;
  background: #181825;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-inset);
}

.placeholder__title {
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 300;
  letter-spacing: 0.5px;
}

.placeholder__subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
}
```

- [ ] **Step 4: Update `src/App.jsx` to render placeholders**

```jsx
import { useState } from 'react'
import TabBar from './components/TabBar'
import ScientificCalculator from './components/ScientificCalculator'
import RatesCalculator from './components/RatesCalculator'

const TABS = [
  { id: 'basic', label: 'Basic' },
  { id: 'scientific', label: 'Scientific' },
  { id: 'rates', label: 'Rates' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('basic')

  return (
    <div>
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      {activeTab === 'basic' && <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>Basic calculator coming soon…</div>}
      {activeTab === 'scientific' && <ScientificCalculator />}
      {activeTab === 'rates' && <RatesCalculator />}
    </div>
  )
}
```

- [ ] **Step 5: Verify in browser**

Clicking "Scientific" shows the dark inset placeholder card. Clicking "Rates" shows the same with "Exchange Rates". Clicking "Basic" shows the temporary text. Tab switching works end-to-end.

- [ ] **Step 6: Commit**

```bash
git add src/components/ScientificCalculator.jsx src/components/RatesCalculator.jsx src/styles/index.css src/App.jsx
git commit -m "feat: add Scientific and Rates placeholder tabs"
```

---

## Task 5: Display component

**Files:**
- Create: `src/components/Display.jsx`
- Modify: `src/styles/index.css` (append display styles)

- [ ] **Step 1: Create `src/components/Display.jsx`**

```jsx
export default function Display({ expression, result }) {
  const len = result.length
  const fontSize = Math.max(24, 48 - Math.max(0, len - 9) * 3)

  return (
    <div className="display">
      <div className="display__expression">{expression || ' '}</div>
      <div className="display__result" style={{ fontSize }}>
        {result}
      </div>
    </div>
  )
}
```

`' '` is a non-breaking space — it keeps the expression row the same height even when empty so the layout doesn't jump.

- [ ] **Step 2: Append display styles to `src/styles/index.css`**

```css
/* Display */
.display {
  background: #181825;
  border-radius: var(--radius-display);
  padding: 16px 20px 18px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-inset);
  text-align: right;
  min-height: 96px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 4px;
}

.display__expression {
  color: var(--text-secondary);
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.display__result {
  color: var(--text-primary);
  font-weight: 200;
  letter-spacing: -1px;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  transition: font-size 0.1s ease;
}
```

- [ ] **Step 3: Smoke-test Display in isolation by temporarily rendering it in App.jsx**

Add to the top of the `basic` branch inside App.jsx temporarily:
```jsx
import Display from './components/Display'
// inside the basic tab branch:
<Display expression="5 + 3 =" result="8" />
```

- [ ] **Step 4: Verify in browser**

Under the Basic tab, you should see the dark inset display box. The dim top line shows `5 + 3 =`, the bright bottom line shows `8`. Remove the temporary import and render when done.

- [ ] **Step 5: Commit**

```bash
git add src/components/Display.jsx src/styles/index.css
git commit -m "feat: add dual-line Display component"
```

---

## Task 6: Button and ButtonGrid components

**Files:**
- Create: `src/components/Button.jsx`
- Create: `src/components/ButtonGrid.jsx`
- Modify: `src/styles/index.css` (append button styles)

- [ ] **Step 1: Create `src/components/Button.jsx`**

```jsx
export default function Button({ label, variant = 'digit', span = 1, onPress }) {
  return (
    <button
      className={`btn btn--${variant}${span > 1 ? ` btn--span-${span}` : ''}`}
      onClick={() => onPress(label)}
    >
      {label}
    </button>
  )
}
```

- [ ] **Step 2: Create `src/components/ButtonGrid.jsx`**

```jsx
import Button from './Button'

const BUTTONS = [
  { label: 'AC',  variant: 'utility' },
  { label: '+/−', variant: 'utility' },
  { label: '%',   variant: 'utility' },
  { label: '÷',   variant: 'operator' },
  { label: '7',   variant: 'digit' },
  { label: '8',   variant: 'digit' },
  { label: '9',   variant: 'digit' },
  { label: '×',   variant: 'operator' },
  { label: '4',   variant: 'digit' },
  { label: '5',   variant: 'digit' },
  { label: '6',   variant: 'digit' },
  { label: '−',   variant: 'operator' },
  { label: '1',   variant: 'digit' },
  { label: '2',   variant: 'digit' },
  { label: '3',   variant: 'digit' },
  { label: '+',   variant: 'operator' },
  { label: '0',   variant: 'digit', span: 2 },
  { label: '.',   variant: 'digit' },
  { label: '=',   variant: 'operator' },
]

export default function ButtonGrid({ onButton }) {
  return (
    <div className="button-grid">
      {BUTTONS.map(btn => (
        <Button
          key={btn.label}
          label={btn.label}
          variant={btn.variant}
          span={btn.span}
          onPress={onButton}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Append button styles to `src/styles/index.css`**

```css
/* ButtonGrid */
.button-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

/* Button base */
.btn {
  border: none;
  border-radius: var(--radius-btn);
  padding: 18px 12px;
  font-size: 20px;
  font-family: inherit;
  cursor: pointer;
  background: var(--bg);
  color: var(--text-primary);
  box-shadow: var(--shadow-raised);
  transition: box-shadow 0.1s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.btn:active {
  box-shadow: var(--shadow-inset);
}

/* Variants */
.btn--utility {
  color: var(--text-utility);
  font-size: 16px;
}

.btn--operator {
  background: var(--accent);
  color: var(--accent-fg);
  font-weight: 600;
  box-shadow: none;
}

.btn--operator:active {
  filter: brightness(0.88);
  box-shadow: none;
}

/* Wide zero button */
.btn--span-2 {
  grid-column: span 2;
  text-align: left;
  padding-left: 28px;
}
```

- [ ] **Step 4: Smoke-test ButtonGrid in App.jsx temporarily**

Add to `App.jsx` basic branch temporarily:
```jsx
import ButtonGrid from './components/ButtonGrid'
// inside basic branch:
<ButtonGrid onButton={(key) => console.log(key)} />
```

- [ ] **Step 5: Verify in browser**

You should see the full 4×5 button grid with neumorphic raised shadows. Operator buttons are lavender. The `0` button spans two columns. Press any button — the raised shadow flips to inset on press, returning immediately on release. Open DevTools console (`F12`) to confirm keys are logged correctly.

Remove the temporary imports from App.jsx.

- [ ] **Step 6: Commit**

```bash
git add src/components/Button.jsx src/components/ButtonGrid.jsx src/styles/index.css
git commit -m "feat: add Button and ButtonGrid components with press animation"
```

---

## Task 7: useCalculator hook

**Files:**
- Create: `src/hooks/useCalculator.js`

- [ ] **Step 1: Create `src/hooks/useCalculator.js`**

```js
import { useState, useEffect } from 'react'

// Pure helper: format a number with thousands separator, max 10 significant digits
function fmt(n) {
  if (!isFinite(n)) return 'Error'
  return parseFloat(n.toPrecision(10)).toLocaleString('en-US', {
    maximumSignificantDigits: 10,
  })
}

// Pure helper: apply operator to two numbers
function evaluate(a, op, b) {
  if (op === '+') return a + b
  if (op === '−') return a - b
  if (op === '×') return a * b
  if (op === '÷') return b === 0 ? null : a / b
  return b
}

// Keyboard key → calculator key mapping
const KEYMAP = {
  '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
  '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
  '.': '.', '+': '+', '-': '−', '*': '×', '/': '÷',
  'Enter': '=', '=': '=',
  'Escape': 'AC',
  '%': '%',
  'Backspace': 'Backspace',
}

const OPS = ['+', '−', '×', '÷']

const INITIAL = {
  input: '0',        // raw string shown on bottom line
  expression: '',    // formatted string shown on top line
  pendingOp: null,   // stored operator awaiting right operand
  pendingVal: null,  // stored left operand
  // phase controls what happens on the next keypress:
  // 'typing'   — user is actively entering digits
  // 'operator' — operator just pressed, next digit starts right operand
  // 'result'   — = was pressed, next digit starts fresh
  phase: 'typing',
}

// Pure state transition function — takes current state + key, returns next state.
// Defined outside the hook so the keyboard useEffect can use it without stale closures.
function processKey(s, key) {
  const inputNum = parseFloat(s.input.replace(/,/g, '')) || 0

  if (key === 'AC') return INITIAL

  if (key === '+/−') {
    return { ...s, input: fmt(-inputNum) }
  }

  if (key === '%') {
    return { ...s, input: fmt(inputNum / 100) }
  }

  if (OPS.includes(key)) {
    // Chain: if an operator is pending and we are mid-typing the right operand, evaluate first
    if (s.pendingOp && s.phase === 'typing') {
      const result = evaluate(s.pendingVal, s.pendingOp, inputNum)
      if (result === null) return { ...INITIAL, input: 'Error', phase: 'result' }
      const r = fmt(result)
      return { input: r, expression: `${r} ${key}`, pendingOp: key, pendingVal: result, phase: 'operator' }
    }
    // First operator press, or pressing operator after result/another operator
    return {
      input: s.input,
      expression: `${s.input} ${key}`,
      pendingOp: key,
      pendingVal: inputNum,
      phase: 'operator',
    }
  }

  if (key === '=') {
    if (!s.pendingOp) return s
    const result = evaluate(s.pendingVal, s.pendingOp, inputNum)
    if (result === null) return { ...INITIAL, input: 'Error', phase: 'result' }
    return {
      input: fmt(result),
      expression: `${s.expression} ${s.input} =`,
      pendingOp: null,
      pendingVal: null,
      phase: 'result',
    }
  }

  if (key === 'Backspace') {
    if (s.phase !== 'typing') return s
    if (s.input.length <= 1) return { ...s, input: '0' }
    return { ...s, input: s.input.slice(0, -1) }
  }

  if (key === '.') {
    if (s.phase === 'result') return { ...INITIAL, input: '0.', phase: 'typing' }
    if (s.phase === 'operator') return { ...s, input: '0.', phase: 'typing' }
    if (s.input.includes('.')) return s
    return { ...s, input: s.input + '.' }
  }

  // Digit key
  const digit = key
  if (s.phase === 'result') return { ...INITIAL, input: digit === '0' ? '0' : digit }
  if (s.phase === 'operator') return { ...s, input: digit === '0' ? '0' : digit, phase: 'typing' }
  // phase === 'typing'
  if (s.input === '0' && digit === '0') return s
  if (s.input === '0') return { ...s, input: digit }
  if (s.input.replace(/[.,]/g, '').length >= 12) return s
  return { ...s, input: s.input + digit }
}

export default function useCalculator() {
  const [state, setState] = useState(INITIAL)

  function handleButton(key) {
    setState(prev => processKey(prev, key))
  }

  useEffect(() => {
    function onKeyDown(e) {
      const key = KEYMAP[e.key]
      if (!key) return
      e.preventDefault()
      setState(prev => processKey(prev, key))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, []) // empty deps: processKey uses functional setState so no stale closure

  return {
    expression: state.expression,
    result: state.input,
    handleButton,
  }
}
```

- [ ] **Step 2: Verify the hook logic manually (no browser yet)**

Trace these sequences mentally against the code before continuing:

| Input sequence | Expected `result` | Expected `expression` |
|---|---|---|
| `5`, `+`, `3`, `=` | `8` | `5 + 3 =` |
| `1`, `0`, `÷`, `0`, `=` | `Error` | `10 ÷ 0 =` → Error path |
| `5`, `+`, `3`, `×`, `2`, `=` | `16` | chains: `(5+3)×2` |
| `9`, `=` (no op) | `9` | no change |
| `5`, `+`, `3`, `=`, `+`, `2`, `=` | `10` | continues from result |

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCalculator.js
git commit -m "feat: add useCalculator hook with keyboard support"
```

---

## Task 8: BasicCalculator — wire everything together

**Files:**
- Create: `src/components/BasicCalculator.jsx`
- Modify: `src/styles/index.css` (append calculator wrapper styles)
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/components/BasicCalculator.jsx`**

```jsx
import useCalculator from '../hooks/useCalculator'
import Display from './Display'
import ButtonGrid from './ButtonGrid'

export default function BasicCalculator() {
  const { expression, result, handleButton } = useCalculator()

  return (
    <div className="calculator">
      <Display expression={expression} result={result} />
      <ButtonGrid onButton={handleButton} />
    </div>
  )
}
```

- [ ] **Step 2: Append calculator wrapper styles to `src/styles/index.css`**

```css
/* Calculator wrapper */
.calculator {
  background: var(--bg);
  border-radius: var(--radius-card);
  padding: 20px;
}
```

- [ ] **Step 3: Update `src/App.jsx` to render BasicCalculator**

```jsx
import { useState } from 'react'
import TabBar from './components/TabBar'
import BasicCalculator from './components/BasicCalculator'
import ScientificCalculator from './components/ScientificCalculator'
import RatesCalculator from './components/RatesCalculator'

const TABS = [
  { id: 'basic', label: 'Basic' },
  { id: 'scientific', label: 'Scientific' },
  { id: 'rates', label: 'Rates' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('basic')

  return (
    <div>
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      {activeTab === 'basic' && <BasicCalculator />}
      {activeTab === 'scientific' && <ScientificCalculator />}
      {activeTab === 'rates' && <RatesCalculator />}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/BasicCalculator.jsx src/styles/index.css src/App.jsx
git commit -m "feat: wire BasicCalculator with Display, ButtonGrid, and useCalculator"
```

---

## Task 9: Final verification

**Files:** none — this is a manual test run.

Run the dev server:
```bash
npm run dev
```

Open `http://localhost:5173` and work through every item:

- [ ] **Button input**
  - Tap `7`, `8`, `9` → display shows `789`
  - Tap `÷` → expression line shows `789 ÷`, display still shows `789`
  - Tap `3` → display shows `3`
  - Tap `=` → display shows `263` (789 ÷ 3), expression shows `789 ÷ 3 =`

- [ ] **Chained operations**
  - Tap `5`, `+`, `3`, `×`, `2`, `=` → result is `16` (not 11 — evaluates left to right)

- [ ] **Utility buttons**
  - `AC` clears display to `0` and clears expression
  - `+/−` on `5` → shows `-5`
  - `%` on `50` → shows `0.5`

- [ ] **Division by zero**
  - `1`, `÷`, `0`, `=` → display shows `Error`
  - Next digit press clears Error and starts fresh

- [ ] **Long numbers**
  - Type `123456789012` (12 digits) → font shrinks to stay on one line
  - 13th digit is blocked

- [ ] **Decimal**
  - `1`, `.`, `5`, `+`, `2`, `.`, `5`, `=` → `4`
  - Second `.` press does nothing (no double decimal)

- [ ] **Keyboard input**
  - Type `5`, `+`, `3`, `Enter` with keyboard → same result as button presses
  - `Escape` → AC (clears)
  - `Backspace` → deletes last digit while typing; does nothing after `=`
  - `/` key → maps to ÷

- [ ] **Button press animation**
  - Click and hold any digit button → shadow flips to inset (pressed look)
  - Release → returns to raised

- [ ] **Tab switching**
  - Switch to Scientific → "Coming soon" placeholder
  - Switch to Rates → "Exchange Rates / Coming soon"
  - Switch back to Basic → calculator is reset (fresh state)

- [ ] **Commit final**

```bash
git add -A
git commit -m "feat: complete V1 calculator — basic mode, keyboard, animations, placeholder tabs"
```
