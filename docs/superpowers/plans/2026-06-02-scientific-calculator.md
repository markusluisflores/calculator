# Scientific Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Scientific tab placeholder with a fully functional scientific calculator using a dedicated hook and math.js for expression evaluation.

**Architecture:** A new `useScientificCalculator` hook owns all scientific logic: it builds an expression string as the user presses buttons, evaluates it live via math.js, and handles the 2nd-key toggle and DEG/RAD angle mode. `ScientificCalculator.jsx` composes the existing `Display` (extended with a `badge` prop for the DEG/RAD pill) with a new `ScientificButtonGrid` (3 scientific rows) and the existing `ButtonGrid` (standard numpad). The Basic calculator is left entirely untouched.

**Tech Stack:** Vite 8, React 19, math.js, plain CSS

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/hooks/useScientificCalculator.js` | Create | Expression state, 2nd key, DEG/RAD, math.js evaluation |
| `src/components/ScientificButtonGrid.jsx` | Create | 3-row scientific button grid with dual labels + 2nd-key toggle |
| `src/components/ScientificCalculator.jsx` | Replace | Compose Display + ScientificButtonGrid + ButtonGrid |
| `src/components/Display.jsx` | Extend | Accept optional `badge` prop rendered top-left |
| `src/styles/index.css` | Extend | DEG/RAD pill, scientific button variants, dual-label layout |

---

## Task 1: Install math.js

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install the package**

```bash
npm install mathjs
```

Expected output: `added 1 package` (or similar), no errors.

- [ ] **Step 2: Verify the import resolves**

Open `http://localhost:5173` (run `npm run dev` if not running). Open browser DevTools console and run:

```js
// Paste this in the DevTools console to confirm math.js resolves correctly
// (We'll verify the actual import in Task 3 — this just checks the package exists)
fetch('/node_modules/mathjs/package.json').then(r => r.json()).then(p => console.log(p.version));
```

Expected: prints a version number like `"13.x.x"`. If 404, re-run `npm install`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install mathjs for scientific calculator expression evaluation"
```

---

## Task 2: Extend Display with badge prop

**Files:**
- Modify: `src/components/Display.jsx`
- Modify: `src/styles/index.css`

- [ ] **Step 1: Add `position: relative` to `.display` and a `.display__badge` rule in `src/styles/index.css`**

Add after the existing `.display { ... }` block:

```css
.display__badge {
  position: absolute;
  top: 10px;
  left: 10px;
}
```

And add `position: relative;` inside the existing `.display` rule so the badge positions correctly against the display:

```css
/* Display */
.display {
  position: relative;
  background: var(--surface);
  border-radius: var(--radius-display);
  padding: 16px 20px 18px;
  margin-bottom: 16px;
  border: 1px solid var(--border);
  text-align: right;
  min-height: 96px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 4px;
}
```

- [ ] **Step 2: Update `src/components/Display.jsx` to accept and render the `badge` prop**

```jsx
export default function Display({ expression, result, badge }) {
  const len = result.length;
  const fontSize = Math.max(24, 48 - Math.max(0, len - 9) * 3);

  return (
    <div className="display" role="region" aria-label="Calculator display">
      {badge && <div className="display__badge">{badge}</div>}
      <div className="display__expression" aria-hidden="true">
        {expression || " "}
      </div>
      <div
        className="display__result"
        style={{ fontSize }}
        aria-live="polite"
        aria-atomic="true"
      >
        {result}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify Basic tab is unaffected**

Navigate to `http://localhost:5173`. The Basic tab should look identical to before — no badge, no layout shift. The `badge` prop is optional and renders nothing when not passed.

- [ ] **Step 4: Commit**

```bash
git add src/components/Display.jsx src/styles/index.css
git commit -m "feat: extend Display with optional badge prop for DEG/RAD pill"
```

---

## Task 3: Add CSS for scientific layout

**Files:**
- Modify: `src/styles/index.css`

- [ ] **Step 1: Append all scientific styles to the end of `src/styles/index.css` (before the `@media (prefers-reduced-motion)` block)**

Add these rules:

```css
/* ── DEG/RAD pill ── */
.deg-rad-pill {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2px;
  display: flex;
  gap: 1px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.deg-rad-pill:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.deg-rad-pill__seg {
  font-size: 9px;
  font-weight: 600;
  font-family: inherit;
  padding: 3px 10px;
  border-radius: 16px;
  color: var(--text-secondary);
  letter-spacing: 0.04em;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.deg-rad-pill__seg--active {
  background: var(--accent);
  color: var(--accent-fg);
}

/* ── Scientific button grid ── */
.sci-button-grid {
  margin-bottom: 10px;
}

/* Scientific function buttons (sin, cos, x², √x, π …) */
.btn--scientific {
  background: var(--surface-utility);
  color: var(--text-secondary);
  font-size: 13px;
  padding: 10px 6px;
  border: 1px solid var(--border);
  border-radius: var(--radius-btn);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition:
    background 0.15s ease,
    filter 0.15s ease,
    transform 0.12s ease;
}

.btn--scientific:hover {
  background: #2e3a50;
}

.btn--scientific:active {
  background: #323d55;
  transform: scale(0.97);
}

/* Utility buttons in the scientific rows (( ), n!, ⌫, AC) */
.btn--sci-utility {
  background: var(--surface-utility);
  color: var(--text-utility);
  font-size: 14px;
  padding: 10px 6px;
  border: 1px solid var(--border);
  border-radius: var(--radius-btn);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition:
    background 0.15s ease,
    transform 0.12s ease;
}

.btn--sci-utility:hover {
  background: #2e3a50;
}

.btn--sci-utility:active {
  background: #323d55;
  transform: scale(0.97);
}

/* 2nd key — inactive: outlined green */
.btn--second-key {
  background: var(--surface-utility);
  color: var(--accent);
  font-size: 14px;
  font-weight: 700;
  padding: 10px 6px;
  border: 1px solid var(--accent);
  border-radius: var(--radius-btn);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.12s ease;
}

.btn--second-key:hover {
  background: rgba(34, 197, 94, 0.1);
}

/* 2nd key — active: filled green */
.btn--second-key-active {
  background: var(--accent);
  color: var(--accent-fg);
  font-size: 14px;
  font-weight: 700;
  padding: 10px 6px;
  border: 1px solid transparent;
  border-radius: var(--radius-btn);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.12s ease;
}

.btn--second-key-active:hover {
  filter: brightness(1.1);
}

.btn--second-key-active:active {
  transform: scale(0.97);
}

/* Dual-label layout inside scientific buttons */
.sci-btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  line-height: 1.1;
  pointer-events: none;
}

.sci-btn-second {
  font-size: 8px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.15s ease;
  min-height: 10px;
}

.sci-btn-second--active {
  color: var(--accent);
  font-weight: 700;
}

.sci-btn-primary {
  font-size: 13px;
}

.btn--scientific:focus-visible,
.btn--sci-utility:focus-visible,
.btn--second-key:focus-visible,
.btn--second-key-active:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

- [ ] **Step 2: Verify no regressions**

Navigate to `http://localhost:5173`. Basic tab should be visually unchanged. The new CSS classes are not used yet so there should be zero visible change.

- [ ] **Step 3: Commit**

```bash
git add src/styles/index.css
git commit -m "feat: add CSS for scientific button variants, 2nd key, and DEG/RAD pill"
```

---

## Task 4: Create useScientificCalculator hook

**Files:**
- Create: `src/hooks/useScientificCalculator.js`

- [ ] **Step 1: Create the file with the full hook implementation**

```js
import { useState, useEffect } from "react";
import * as math from "mathjs";

// DEG scope: overrides trig functions to accept/return degrees
const DEG_SCOPE = {
  sin: (x) => Math.sin((x * Math.PI) / 180),
  cos: (x) => Math.cos((x * Math.PI) / 180),
  tan: (x) => Math.tan((x * Math.PI) / 180),
  asin: (x) => (Math.asin(x) * 180) / Math.PI,
  acos: (x) => (Math.acos(x) * 180) / Math.PI,
  atan: (x) => (Math.atan(x) * 180) / Math.PI,
};

// Function tokens deleted as a whole unit on backspace
const FUNCTION_TOKENS = [
  "asin(",
  "acos(",
  "atan(",
  "sin(",
  "cos(",
  "tan(",
  "log10(",
  "ln(",
  "sqrt(",
  "^(1/",
  "^(",
];

// Primary button label → expression token
const PRIMARY_MAP = {
  sin: "sin(",
  cos: "cos(",
  tan: "tan(",
  ln: "ln(",
  "x²": "^2",
  "√x": "sqrt(",
  π: "pi",
  "n!": "!",
};

// 2nd-key button label → expression token (keyed by primary label)
const SECOND_MAP = {
  sin: "asin(",
  cos: "acos(",
  tan: "atan(",
  ln: "log10(",
  "x²": "^(",
  "√x": "^(1/",
  π: "e",
};

function fmt(num) {
  if (!isFinite(num)) return "Error";
  const s = String(+num.toPrecision(10));
  return s.includes(".") ? s.replace(/\.?0+$/, "") : s;
}

function safeEvaluate(expr, isDeg) {
  if (!expr) return null;
  try {
    const result = math.evaluate(expr, isDeg ? DEG_SCOPE : {});
    if (typeof result !== "number") return null;
    return fmt(result);
  } catch {
    return null;
  }
}

function applyBackspace(expr) {
  for (const token of FUNCTION_TOKENS) {
    if (expr.endsWith(token)) return expr.slice(0, -token.length);
  }
  return expr.slice(0, -1);
}

function applySmartParen(expr) {
  let open = 0;
  for (const ch of expr) {
    if (ch === "(") open++;
    if (ch === ")") open--;
  }
  if (open > 0 && expr.length > 0) {
    const last = expr[expr.length - 1];
    if (/[0-9).]/.test(last) || expr.endsWith("pi") || expr.endsWith("e")) {
      return expr + ")";
    }
  }
  return expr + "(";
}

export default function useScientificCalculator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("0");
  const [isSecond, setIsSecond] = useState(false);
  const [angleMode, setAngleMode] = useState("DEG");

  // Live evaluation on every expression or angle-mode change
  useEffect(() => {
    if (!expression) {
      setResult("0");
      return;
    }
    const val = safeEvaluate(expression, angleMode === "DEG");
    if (val !== null) setResult(val);
  }, [expression, angleMode]);

  function handleButton(key) {
    if (key === "AC") {
      setExpression("");
      setResult("0");
      setIsSecond(false);
      return;
    }

    if (key === "2nd") {
      setIsSecond((prev) => !prev);
      return;
    }

    if (key === "⌫") {
      setExpression((prev) => applyBackspace(prev));
      setIsSecond(false);
      return;
    }

    if (key === "DEG/RAD") {
      setAngleMode((prev) => (prev === "DEG" ? "RAD" : "DEG"));
      return;
    }

    if (key === "=") {
      const val = safeEvaluate(expression, angleMode === "DEG");
      if (val === null || val === "Error") {
        setResult("Error");
      } else {
        setResult(val);
        setExpression(val);
      }
      setIsSecond(false);
      return;
    }

    if (key === "( )") {
      setExpression((prev) => applySmartParen(prev));
      setIsSecond(false);
      return;
    }

    if (key === "+/−") {
      setExpression((prev) => {
        if (!prev) return "-";
        if (prev.startsWith("-")) return prev.slice(1);
        return "-" + prev;
      });
      return;
    }

    // Scientific function keys: use 2nd map if active and key has a secondary
    if (key in PRIMARY_MAP) {
      const token =
        isSecond && key in SECOND_MAP ? SECOND_MAP[key] : PRIMARY_MAP[key];
      setExpression((prev) => prev + token);
      setIsSecond(false);
      return;
    }

    // Default: append key as-is (digits, operators, decimal, %)
    setExpression((prev) => prev + key);
  }

  return { expression, result, angleMode, isSecond, handleButton };
}
```

- [ ] **Step 2: Smoke-test the hook in isolation via the browser console**

With the dev server running, open DevTools → Console. Paste and run:

```js
// Confirm math.js evaluates correctly with DEG scope
const DEG_SCOPE = {
  sin: (x) => Math.sin((x * Math.PI) / 180),
  asin: (x) => (Math.asin(x) * 180) / Math.PI,
};
// Import math.js from the already-loaded module (Vite dev builds expose it)
// If this doesn't work, just proceed to Task 6 where the UI validates it.
```

Expected: no errors. Full validation happens in Task 6 via the UI.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useScientificCalculator.js
git commit -m "feat: add useScientificCalculator hook with expression model and math.js evaluation"
```

---

## Task 5: Create ScientificButtonGrid component

**Files:**
- Create: `src/components/ScientificButtonGrid.jsx`

- [ ] **Step 1: Create the component**

```jsx
const ROW1 = [
  { label: "2nd", variant: "second-key" },
  { label: "( )", variant: "sci-utility" },
  { label: "n!", variant: "sci-utility" },
  { label: "⌫", variant: "sci-utility" },
];

const ROW2 = [
  { label: "sin", secondLabel: "sin⁻¹", variant: "scientific" },
  { label: "cos", secondLabel: "cos⁻¹", variant: "scientific" },
  { label: "tan", secondLabel: "tan⁻¹", variant: "scientific" },
  { label: "ln", secondLabel: "log", variant: "scientific" },
];

const ROW3 = [
  { label: "x²", secondLabel: "xʸ", variant: "scientific" },
  { label: "√x", secondLabel: "ˣ√y", variant: "scientific" },
  { label: "π", secondLabel: "e", variant: "scientific" },
  { label: "AC", variant: "sci-utility" },
];

const ALL_BUTTONS = [...ROW1, ...ROW2, ...ROW3];

function ScientificButton({ btn, isSecond, onPress }) {
  const showSecond = isSecond && btn.secondLabel;
  const variant =
    btn.variant === "second-key" && isSecond ? "second-key-active" : btn.variant;

  return (
    <button
      className={`btn btn--${variant}`}
      onClick={() => onPress(btn.label)}
    >
      {btn.secondLabel ? (
        <span className="sci-btn-content">
          <span
            className={`sci-btn-second${showSecond ? " sci-btn-second--active" : ""}`}
          >
            {btn.secondLabel}
          </span>
          <span className="sci-btn-primary">{btn.label}</span>
        </span>
      ) : (
        btn.label
      )}
    </button>
  );
}

export default function ScientificButtonGrid({ onButton, isSecond }) {
  return (
    <div className="button-grid sci-button-grid">
      {ALL_BUTTONS.map((btn) => (
        <ScientificButton
          key={btn.label}
          btn={btn}
          isSecond={isSecond}
          onPress={onButton}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ScientificButtonGrid.jsx
git commit -m "feat: add ScientificButtonGrid with dual-label 2nd-key toggle"
```

---

## Task 6: Replace ScientificCalculator placeholder and wire everything together

**Files:**
- Modify: `src/components/ScientificCalculator.jsx`

- [ ] **Step 1: Replace the placeholder with the full component**

```jsx
import Display from "./Display";
import ScientificButtonGrid from "./ScientificButtonGrid";
import ButtonGrid from "./ButtonGrid";
import useScientificCalculator from "../hooks/useScientificCalculator";

export default function ScientificCalculator() {
  const { expression, result, angleMode, isSecond, handleButton } =
    useScientificCalculator();

  const badge = (
    <button
      className="deg-rad-pill"
      onClick={() => handleButton("DEG/RAD")}
      aria-label={`Angle mode: ${angleMode}. Tap to switch.`}
    >
      <span
        className={`deg-rad-pill__seg${angleMode === "DEG" ? " deg-rad-pill__seg--active" : ""}`}
      >
        DEG
      </span>
      <span
        className={`deg-rad-pill__seg${angleMode === "RAD" ? " deg-rad-pill__seg--active" : ""}`}
      >
        RAD
      </span>
    </button>
  );

  return (
    <div className="calculator">
      <Display expression={expression} result={result} badge={badge} />
      <ScientificButtonGrid onButton={handleButton} isSecond={isSecond} />
      <ButtonGrid onButton={handleButton} />
    </div>
  );
}
```

- [ ] **Step 2: Navigate to the Scientific tab and verify the layout**

Open `http://localhost:5173`, click **Scientific**. You should see:
- DEG/RAD pill in the top-left of the display
- 3 rows of scientific buttons above the standard numpad
- `2nd` button outlined in green (inactive)
- All other scientific buttons show their secondary label above the primary label

- [ ] **Step 3: Verify DEG/RAD toggle**

Click the DEG/RAD pill. It should switch between DEG (green left) and RAD (green right). No layout shift.

- [ ] **Step 4: Verify 2nd key**

Tap `2nd`. It should fill green. All dual-label buttons (sin, cos, tan, ln, x², √x, π) should show their secondary label highlighted. Tap `2nd` again — it deactivates.

- [ ] **Step 5: Verify core calculations — DEG mode**

Run each of these and confirm the result shown matches:

Note: functions open a `(` — enter the argument *after* pressing the function key, then close with `( )`.

| Input sequence | Expression built | Expected result |
|---|---|---|
| `sin`, `4`, `5`, `( )` | `sin(45)` | `0.7071068` |
| `AC`, `2nd`+`ln`, `1`, `0`, `0`, `( )` | `log10(100)` | `2` |
| `AC`, `√x`, `1`, `6`, `( )` | `sqrt(16)` | `4` |
| `AC`, `5`, `n!` | `5!` | `120` |
| `AC`, `π` | `pi` | `3.141593` |
| `AC`, `( )`, `2`, `+`, `3`, `( )`, `×`, `4` | `(2+3)*4` | `20` |
| `AC`, `2nd`+`sin`, `0`, `.`, `7`, `0`, `7`, `1`, `( )` | `asin(0.7071)` | `≈ 45` |

- [ ] **Step 6: Verify RAD mode**

Toggle to RAD. Press `AC`, then `0`, `.`, `7`, `8`, `5`, `4`, `sin`. Expected result: `≈ 0.7071` (sin of π/4 radians).

- [ ] **Step 7: Verify error handling**

| Input sequence | Expression built | Expected |
|---|---|---|
| `5`, `/`, `0`, `=` | `5/0` | `Error` |
| `AC`, `√x`, `-`, `4`, `( )`, `=` | `sqrt(-4)` | `Error` |
| `AC`, `-`, `1`, `n!`, `=` | `-1!` | `Error` |
| `AC`, `( )`, `2`, `+`, `3`, `=` (unmatched paren) | `(2+3` | `Error` |

- [ ] **Step 8: Verify backspace deletes whole tokens**

Type `sin(` by pressing `sin`. Press `⌫`. The entire `sin(` should disappear at once, not just the `(`.

- [ ] **Step 9: Verify Basic tab is unchanged**

Click **Basic**. Run `1`, `2`, `+`, `3`, `4`, `=`. Expected: `46`. No regressions.

- [ ] **Step 10: Commit**

```bash
git add src/components/ScientificCalculator.jsx
git commit -m "feat: implement scientific calculator with 2nd key, DEG/RAD, and math.js expression model"
```

---

## Task 7: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the Design section to reflect the current theme and add the V2 note**

Replace the Design section in `CLAUDE.md`:

```markdown
## Design
- Background: #0f172a (deep navy) / Card surface: #1b2336
- Accent: #22c55e (bright green) for operators and active tab
- Flat elevated card buttons with subtle border
- Inter font via Google Fonts
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md design tokens to reflect Code Green theme"
```

---

## Verification Summary

After all tasks are complete, do a final pass:

- [ ] Switch between Basic and Scientific — no state bleeds between tabs
- [ ] Scientific: all Tier 1 features work (trig, inverse trig, log, ln, powers, roots, π, e, n!, parentheses)
- [ ] DEG/RAD pill toggles correctly and affects trig results
- [ ] 2nd key highlights, swaps labels, deactivates after one press
- [ ] Error states show "Error" without crashing
- [ ] Backspace deletes whole function tokens
- [ ] Basic tab fully functional, visually unchanged
