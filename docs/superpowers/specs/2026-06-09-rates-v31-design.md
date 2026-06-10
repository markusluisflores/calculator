# Rates V3.1 — Design Spec

**Date:** 2026-06-09
**Branch:** feat/rates-v3.1-numpad
**Mockup:** docs/superpowers/specs/mockups/2026-06-09-rates-v31-mockup.md

---

## Problem

The V3 Rates tab was designed as a web-form currency exchange UI — free-text input fields, dropdown with inline search, no numpad. Every other tab in the app uses a numpad button grid for digit input. This was an identity inconsistency caught after release. V3.1 redesigns the tab to match the established calculator interaction model.

See: `docs/retros/2026-06-04-rates-tab-v3-consistency-failure.md`

---

## Design Decisions

All finalized before implementation. See mockup for full option visualizations.

| Decision | Chosen | Why | Tradeoff |
|---|---|---|---|
| Rate table | Collapsible (hidden by default) | Keeps reference data accessible without occupying space; focused initial view | Small interaction cost to expand |
| Rate table search | Inline keyboard input | Practical for 150+ currencies; filters reference data, not calculator input — defensible exception to numpad rule | Keyboard input visible when table is expanded |
| Swap button | Between the two display rows | Spatially adjacent to what it affects; matches native iOS calculator pattern | Takes vertical space between display rows |

---

## Architecture

### Components

| Component | Responsibility |
|---|---|
| `RatesCalculator.jsx` | Top-level composer — no state, wires hook to children |
| `RatesDisplay.jsx` | Two stacked currency rows + swap button + rate hint |
| `RatesNumpad.jsx` | 3×4 numpad grid (7-8-9 / 4-5-6 / 1-2-3 / .-0-⌫) |
| `RatesTable.jsx` | Collapsible rate table with inline search and scrollable rows |
| `CurrencyPickerModal.jsx` | Full-screen modal — search input + virtualized currency list |

Current `RatesConverter.jsx` and the old `RatesCalculator.jsx` are replaced entirely. `RatesTable.jsx` is rewritten.

### Hook: useRates.js

| State | Type | Notes |
|---|---|---|
| `amount` | string | Numpad-built, e.g. `"1250."` — empty string shows as `"0"` |
| `fromCurrency` | string | e.g. `"USD"` |
| `toCurrency` | string | e.g. `"PHP"` |
| `rates` | object | `{ EUR: 0.92, PHP: 53.0, ... }` — keyed by currency code |
| `tableExpanded` | boolean | `false` by default |
| `pickerTarget` | `"from" \| "to" \| null` | Which row opened the currency picker |
| `search` | string | Rate table filter text |
| `loading` | boolean | API fetch in progress |
| `error` | string \| null | API error message |

`result` is derived — not stored. Computed as `parseFloat(amount || "0") * (rates[toCurrency] ?? 0)`, formatted to 2 decimal places.

### Exposed actions

| Action | Behaviour |
|---|---|
| `pressDigit(digit)` | Appends digit; collapses leading zeros; enforces 10-digit pre-decimal limit |
| `pressDecimal()` | Appends `"."` only if no decimal already present |
| `pressBackspace()` | Removes last character; empty string resolves to `"0"` on display |
| `swap()` | Swaps `fromCurrency` ↔ `toCurrency`; moves computed `result` into `amount` |
| `selectCurrency(code)` | Sets `fromCurrency` or `toCurrency` based on `pickerTarget`; re-fetches rates if `fromCurrency` changed |
| `openPicker(target)` | Sets `pickerTarget` to `"from"` or `"to"` |
| `closePicker()` | Sets `pickerTarget` to `null` |
| `toggleTable()` | Flips `tableExpanded` |
| `setSearch(value)` | Updates rate table filter |
| `retry()` | Re-triggers the API fetch |

---

## Data Flow

```
Numpad press → pressDigit/pressDecimal/pressBackspace → amount updates → result recomputes
Currency button tap → openPicker("from"|"to") → modal opens
Picker selection → selectCurrency(code) → fromCurrency/toCurrency updates → re-fetch if fromCurrency changed
Swap tap → fromCurrency ↔ toCurrency, result → amount → re-fetch
Rate table row tap → selectCurrency(code) with pickerTarget="to" → toCurrency updates
Table header tap → toggleTable
```

---

## Numpad Input Rules

- Digits append to `amount` string
- Leading zero collapse: `"0"` + `"5"` → `"5"`, not `"05"`
- One decimal point max: pressing `"."` when `amount` already contains `"."` is a no-op
- Max 10 digits before the decimal point — additional digit presses are ignored
- Backspace on a single character → resets to `""`; display shows `"0"`
- `amount = ""` is valid internal state; always display as `"0"`

---

## API

- Endpoint: `https://api.frankfurter.dev/v1/latest?base={fromCurrency}`
- Re-fetches when `fromCurrency` changes
- Existing loading/error/retry logic from `useRates.js` is preserved
- `allCurrencies` list (code + name pairs) is derived from the rates response

---

## Currency Picker Modal

- Opens on currency button tap (`[ USD ▾ ]` / `[ PHP ▾ ]`)
- Search input filters the list by code or name (case-insensitive)
- List is virtualized — only visible rows rendered (150+ currencies)
- Currently selected currency shown with a green checkmark
- Dismiss via ✕ button or clicking the backdrop — keeps current currency
- `pickerTarget` determines which currency is updated on selection

---

## Rate Table

- Collapsed by default; toggle via header tap
- When expanded: search input at top, scrollable list of all currency rows below
- Each row: currency code, currency name, rate value (4 decimal places)
- Tapping a row sets it as `toCurrency` and collapses the picker (no modal needed)
- Rates filtered in real time as `search` updates
- Skeleton rows shown while `loading`; error state with retry button if `error` is set

---

## Error Handling

- API failure: show error message + Retry button in rate table area
- Loading: skeleton rows in rate table; display shows last known `result` or `—`
- No rates available for a currency pair: result displays `—`

---

## Testing

`src/test/useRates.test.js` — full rewrite covering:

- `pressDigit`: appends correctly, enforces leading zero collapse, enforces 10-digit limit
- `pressDecimal`: appends once, no-op on second press
- `pressBackspace`: removes last character, resets to `""` on single character
- `swap`: flips currencies, moves result into amount
- `selectCurrency`: updates correct currency based on pickerTarget, triggers re-fetch only on fromCurrency change
- `result` derivation: correct calculation, handles missing rate gracefully
- `toggleTable`: flips tableExpanded
- `setSearch`: updates search string
