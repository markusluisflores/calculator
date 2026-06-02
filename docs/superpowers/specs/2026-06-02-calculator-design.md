# Calculator App — Design Spec

**Date:** 2026-06-02
**Project:** `C:\ClaudeProjects\calculator\`
**Stack:** Vite + React, plain CSS

---

## Overview

A web-based calculator with a distinctive Neumorphic Dark aesthetic. Inspired by iOS and Android calculators but visually independent — deep navy surface with soft inset/raised shadows and a lavender accent color. Designed as a beginner learning project with a clear expansion path: Basic → Scientific → Exchange Rates.

---

## Visual Design

**Theme:** Neumorphic Dark
- Background: `#1e1e2e` (deep navy)
- Surface: same as background; depth created entirely with box-shadows
- Raised shadow: `4px 4px 8px #13131f, -4px -4px 8px #29293d`
- Inset shadow (pressed state): `inset 4px 4px 8px #13131f, inset -4px -4px 8px #29293d`
- Accent: `#cba6f7` (lavender) — used for operator buttons and active tab
- Primary text: `#cdd6f4`
- Secondary text (expression line, inactive tabs): `#6c7086`
- Utility button text: `#a6adc8`

**Button press animation:** On mousedown/touchstart, switch button shadow from raised to inset for 100ms via CSS transition. Returns to raised on mouseup/touchend.

**Tab bar:** Pill/capsule style. The tab container has an inset shadow (recessed slot). The active tab fills a `#cba6f7` capsule. Inactive tabs are plain text in `#6c7086`.

---

## Component Structure

```
src/
├── App.jsx                        ← root: tab state, renders TabBar + active mode
├── components/
│   ├── TabBar.jsx                 ← pill tab switcher
│   ├── Display.jsx                ← dual-line display (expression + result)
│   ├── ButtonGrid.jsx             ← 4×5 button layout
│   ├── BasicCalculator.jsx        ← composes Display + ButtonGrid
│   ├── ScientificCalculator.jsx   ← "Coming soon" placeholder
│   └── RatesCalculator.jsx        ← "Coming soon" placeholder
├── hooks/
│   └── useCalculator.js           ← all math logic + expression state
└── styles/
    └── index.css                  ← CSS custom properties + global styles
```

---

## Data Flow

`useCalculator` is the single source of truth for all calculator state. It exposes:

| Export | Type | Description |
|---|---|---|
| `expression` | string | Dim top line, e.g. `"120 × 9 + 54 ÷"` |
| `result` | string | Large bottom number, e.g. `"1,234"` |
| `handleButton` | fn(key: string) | Called by ButtonGrid on every press |

`BasicCalculator` calls the hook and passes values down one level:
- `Display` receives `expression` and `result` (read-only)
- `ButtonGrid` receives `handleButton` (write-only)

`App` owns tab state (`activeTab`). Switching tabs unmounts/remounts the calculator component; calculator state resets on tab switch (acceptable for V1).

---

## Display Behavior

- **Top line (expression):** Dim (`#6c7086`), smaller font (~15px). Shows the running expression as the user builds it. After pressing `=`, shows the completed expression (e.g. `"120 × 9 ="`).
- **Bottom line (result):** Bright (`#cdd6f4`), large font (starts at 48px). Shows the current operand while typing, the live result after an operator, and the final result after `=`.
- **Font shrink:** If the result string exceeds 9 characters, font size scales down proportionally to keep it on one line. No horizontal scrolling.
- **Thousands separator:** Results are formatted with commas (e.g. `1,234,567`).

---

## Button Layout (Basic Mode)

```
[ AC ]  [ +/− ]  [ % ]  [ ÷ ]
[  7 ]  [  8  ]  [ 9 ]  [ × ]
[  4 ]  [  5  ]  [ 6 ]  [ − ]
[  1 ]  [  2  ]  [ 3 ]  [ + ]
[  0      ]      [ . ]  [ = ]
```

- Operator buttons (`÷ × − + =`): lavender (`#cba6f7`) background, dark text
- Utility buttons (`AC +/− %`): muted (`#a6adc8`) text, same navy background as digit buttons
- `0` button spans two columns
- All buttons: raised neumorphic shadow, 12px border-radius, press animation on click

---

## Calculator Logic (useCalculator)

**State:**
- `expression`: string — the expression being built
- `displayResult`: string — the number shown on the bottom line
- `operator`: string | null — the pending operator
- `operand`: number | null — the left-hand value waiting for right-hand input
- `justEvaluated`: boolean — true immediately after `=`; next digit starts a fresh expression

**Key behaviors:**
- Pressing an operator after `=` continues from the result (chains calculations)
- Pressing a digit after `=` starts fresh
- `AC` resets all state
- `+/−` negates `displayResult` in place
- `%` divides `displayResult` by 100 in place
- Division by zero: sets `displayResult` to `"Error"`, clears state; next digit press clears error
- `Backspace`: deletes the last character of the current operand; does nothing if `justEvaluated` is true (can't edit a completed result)

**Keyboard mapping:**

| Key | Action |
|---|---|
| `0`–`9` | digit |
| `.` | decimal |
| `+` `-` `*` `/` | operators |
| `Enter` or `=` | evaluate |
| `Escape` | AC (clear all) |
| `Backspace` | delete last digit |
| `%` | percent |

Keyboard listener attached in `useEffect` inside `useCalculator`, cleaned up on unmount.

---

## V1 Scope

**In scope:**
- Basic arithmetic: + − × ÷
- Utility: AC, +/−, %
- Decimal input
- Dual-line display with font shrink and thousands separator
- Keyboard input (digits, operators, Enter, Escape, Backspace)
- Neumorphic button press animation (CSS transition, ~100ms)
- Scientific and Rates tabs as styled "Coming soon" placeholders
- Full tab navigation working end-to-end

**Out of scope (future versions):**
- Calculation history panel
- Copy result to clipboard
- Light/dark theme toggle
- Scientific functions (sin, cos, log, etc.)
- Exchange rate API integration

---

## Error Handling

- Division by zero → display `"Error"`, clear state on next input
- Expression too long → font shrinks; expression line truncates with ellipsis if needed
- No other error states expected in V1

---

## Testing

Manual browser testing in V1. No test framework installed yet. Test plan for each release:
1. All digit and operator buttons produce correct output
2. Keyboard input mirrors button behavior
3. Edge cases: division by zero, chained operations, `=` then operator, long numbers
4. Tab switching resets state correctly
5. Button press animation fires on click and touch
