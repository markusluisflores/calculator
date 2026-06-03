# Scientific Calculator — Design Spec
**Date:** 2026-06-02
**Status:** Approved

## Overview

Implement the Scientific tab (currently a placeholder) as a full-featured scientific calculator using a separate hook and math.js for expression evaluation. The Basic calculator is left entirely untouched.

---

## Features (Tier 1)

- Trigonometric: `sin`, `cos`, `tan` + inverses via 2nd key (`sin⁻¹`, `cos⁻¹`, `tan⁻¹`)
- Logarithms: `ln` (natural), `log` (base 10 via 2nd key)
- Powers & roots: `x²`, `xʸ` (2nd), `√x`, `ˣ√y` (2nd)
- Constants: `π`, `e` (2nd)
- Parentheses: smart `( )` button
- Factorial: `n!`
- Angle mode: DEG / RAD toggle

---

## Architecture

### New & changed files

| File | Change | Role |
|---|---|---|
| `src/hooks/useScientificCalculator.js` | New | Expression state, 2nd key, DEG/RAD, math.js evaluation |
| `src/components/ScientificCalculator.jsx` | Replace placeholder | Composes Display + ScientificButtonGrid |
| `src/components/ScientificButtonGrid.jsx` | New | Button grid with 2nd-key toggle behaviour |
| `src/components/Display.jsx` | Extend | Accepts optional `badge` prop for DEG/RAD pill |
| `src/styles/index.css` | Extend | Scientific rows, 2nd key active state, DEG/RAD pill |

No changes to `useCalculator.js`, `BasicCalculator.jsx`, `ButtonGrid.jsx`, or `Button.jsx`.

---

## Layout — 2nd Key Pattern

Three rows of scientific buttons above the standard numpad. A `2nd` key in row 1 toggles secondary functions. It highlights green when active and auto-deactivates after one press.

### Button map

| Row | Primary | 2nd |
|---|---|---|
| 1 | `2nd` | — |
| 1 | `(` / `)` (smart) | — |
| 1 | `n!` | — |
| 1 | `⌫` (backspace) | — |
| 2 | `sin` | `sin⁻¹` |
| 2 | `cos` | `cos⁻¹` |
| 2 | `tan` | `tan⁻¹` |
| 2 | `ln` | `log` |
| 3 | `x²` | `xʸ` |
| 3 | `√x` | `ˣ√y` |
| 3 | `π` | `e` |
| 3 | *(standard AC slot)* | — |

The standard numpad (AC, +/−, %, ÷, 7–9, ×, 4–6, −, 1–3, +, 0, ., =) follows unchanged below.

---

## DEG/RAD Toggle

A small segmented pill sits in the **top-left corner of the display**, overlaid on the inset background. Tapping it switches between DEG and RAD. The active segment highlights in green (`#22c55e`), the inactive segment is muted.

- Implemented as a tappable element inside `Display` via the `badge` prop
- Does not occupy a button slot

---

## Expression Model

The hook maintains two strings: `expression` (what the user is building) and `result` (live evaluation output).

### Button → expression mapping

| Button | Appended |
|---|---|
| Digit / operator / `.` | Character as-is |
| `sin` | `sin(` |
| `cos` | `cos(` |
| `tan` | `tan(` |
| `sin⁻¹` | `asin(` |
| `cos⁻¹` | `acos(` |
| `tan⁻¹` | `atan(` |
| `ln` | `ln(` |
| `log` | `log10(` |
| `x²` | `^2` |
| `xʸ` | `^(` |
| `√x` | `sqrt(` |
| `ˣ√y` | `nthRoot(` |
| `π` | `pi` |
| `e` | `e` |
| `n!` | `factorial(` |
| `(` / `)` | Inserts `(` if open-paren count equals zero or last token is an operator/function; inserts `)` otherwise |
| `AC` | Clears expression and result |
| `⌫` | Removes last character or whole function token (e.g. `sin(` as one unit) |
| `=` | Evaluates; result becomes seed for next expression |

### DEG mode conversion

math.js evaluates in radians natively. DEG mode is handled by creating a scoped math.js instance with overridden trig functions that internally convert degrees to radians before delegating to the native functions:

```js
// DEG mode — wraps trig inputs with degree→radian conversion
const mathDeg = math.create(math.all);
mathDeg.import({
  sin: (x) => math.sin(math.unit(x, 'deg')),
  cos: (x) => math.cos(math.unit(x, 'deg')),
  tan: (x) => math.tan(math.unit(x, 'deg')),
  asin: (x) => math.unit(math.asin(x), 'rad').toNumber('deg'),
  acos: (x) => math.unit(math.acos(x), 'rad').toNumber('deg'),
  atan: (x) => math.unit(math.atan(x), 'rad').toNumber('deg'),
}, { override: true });
```

The hook evaluates using either `math.evaluate()` (RAD) or `mathDeg.evaluate()` (DEG) depending on the current mode. The user never sees the conversion.

### Live evaluation

On every expression change, `math.evaluate()` runs in a `try/catch`:
- Valid result → update `result` string
- Invalid / incomplete → keep last valid `result` (no error flash while typing)

### `=` behaviour

- Valid expression → result shown; result becomes new expression seed for chaining
- Invalid expression → `result` shows `"Error"`, expression stays editable

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| Incomplete expression while typing | Result holds last valid value |
| `=` on invalid / incomplete expression | Shows `"Error"` |
| Division by zero | `"Error"` |
| `√` of negative | `"Error"` |
| `n!` of negative or non-integer | `"Error"` |
| Unmatched parentheses on `=` | `"Error"` |
| Overflow / `Infinity` | `"Error"` |
| `⌫` on function token | Deletes whole token, not character by character |

---

## Out of Scope (V2)

- Memory functions (M+, M−, MR, MC)
- Scientific notation entry (EE)
- Hyperbolic functions
- Keyboard support for scientific functions
