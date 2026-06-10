# Rates Tab — Design Spec
**Date:** 2026-06-04
**Status:** Approved

## Overview

Implement the Rates tab (currently a placeholder) as a live currency converter with a full exchange rate table. Data is fetched from the Frankfurter public API (no key required). The existing Basic and Scientific calculators are left entirely untouched.

---

## Features

- **Converter:** Enter an amount, pick a "from" and "to" currency, see the converted result instantly
- **Swap button:** Exchanges from/to currencies in one tap
- **Rate table:** All ~32 currencies supported by Frankfurter, shown relative to the current "from" currency (synced with the converter)
- **Search/filter:** Text input filters the rate table by currency code or full name, case-insensitive; shows "No currencies found" when empty
- **Skeleton loading:** Shimmer placeholders while fetches are in flight — no frozen UI
- **Error + Retry:** Network failures show a clear message with a Retry button; currencies fallback gracefully to code-only display

---

## Architecture

### New and changed files

| File | Change | Role |
|---|---|---|
| `src/hooks/useRates.js` | New | All state: fetched rates + currencies, from/to, amount, search, loading/error, session cache |
| `src/components/RatesCalculator.jsx` | Replace placeholder | Composes RatesConverter + RatesTable from hook state |
| `src/components/RatesConverter.jsx` | New | Amount input, currency dropdowns with search, swap button, result display |
| `src/components/RatesTable.jsx` | New | Filtered scrollable rate list with skeleton and error states |
| `src/test/useRates.test.js` | New | Unit tests for hook logic |
| `src/styles/index.css` | Extend | Rates-specific styles: skeleton shimmer, search input, rate rows, error card |

No changes to `useCalculator.js`, `useScientificCalculator.js`, or any existing component.

### Hook surface (`useRates`)

```js
const {
  rates,      // { [currencyCode]: number } — rates relative to `from`
  currencies, // [{ code, name }] — full API list, filtered by search
  from,       // string — base currency code
  to,         // string — target currency code
  amount,     // string — raw input value
  result,     // string — converted result, formatted
  search,     // string — filter query for rate table
  loading,    // boolean
  error,      // string | null
  setFrom,    // (code) => void
  setTo,      // (code) => void
  setAmount,  // (value) => void
  setSearch,  // (query) => void
  swap,       // () => void
  retry,      // () => void
} = useRates();
```

---

## Layout (UX-validated)

Full-width stacked layout within the existing calculator card:

1. **Converter section**
   - Labeled "AMOUNT" input row: text input + "from" currency dropdown (green accent)
   - Centered swap button (⇅, green)
   - Labeled "RESULT" row: formatted result + "to" currency dropdown
   - Rate hint line: "1 USD = 0.9214 EUR · {date from API}" (e.g. "· 2026-06-04")

2. **Divider**

3. **Rate table section**
   - Section label: "EXCHANGE RATES (base: USD)"
   - Search input with icon: "Search currencies…"
   - Scrollable list of rows: `[CODE] [Full Name]` on left, rate value on right
   - Base currency excluded from table (no "1 USD = 1 USD" row)

Currency dropdowns have their own local search input (component state, not the hook's `search` field). The hook's `search` field is exclusively for the rate table. Labels are always visible (no placeholder-only inputs — UX rule).

---

## Data Flow

### API

- `GET https://api.frankfurter.app/currencies` — full currency list with names, fetched once on mount
- `GET https://api.frankfurter.app/latest?from={baseCurrency}` — rates for current base

No API key. ~32 currencies available.

### Fetch lifecycle

```
mount
  → Promise.all([fetch /currencies, fetch /latest?from=USD])
      → both succeed: set currencies + rates, loading=false
      → currencies fails: currencies=[] (codes-only fallback), continue with rates
      → rates fails: set error, loading=false
      → both fail: set error, loading=false

from changes (after mount)
  → check ratesCache[from]
    → hit:  use cached rates, no fetch
    → miss: loading=true, fetch /latest?from={from}
              → success: cache + set rates, loading=false
              → failure: set error, loading=false
```

### Session caches (in-memory)

- `currenciesCache` — set once, never re-fetched
- `ratesCache[base]` — one entry per base currency visited during the session

### Conversion

`result = amount × rates[to]`

Runs on every change to `amount`, `to`, or `rates`. Formatted with `toLocaleString()` up to 4 decimal places. Empty or non-numeric `amount` shows `—` silently.

### AbortController

Changing `from` mid-fetch aborts the previous request to prevent stale state.

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| Rates fetch fails on mount | `error` set; converter shows `—`; rate table shows error card with Retry button |
| Currencies fetch fails on mount | `currencies` falls back to `[]`; rows show code only; rest works normally |
| Rates fetch fails on `from` change | Previous rates cleared; error shown; Retry re-fetches with current `from` |
| Network timeout | Treated as fetch failure — same error path |
| `amount` empty or non-numeric | `result` shows `—`; no error state |
| `amount` is negative | Converts normally; result shown with negative sign |
| `to === from` | Result equals amount (rate is 1.0); no special casing |
| Retry while loading | Retry button disabled during in-flight fetch |
| Search returns no matches | "No currencies found" message; not an error state |

---

## Testing

File: `src/test/useRates.test.js` (Vitest + `@testing-library/react`)

Fetches mocked via `vi.stubGlobal('fetch', ...)`.

| Group | Cases |
|---|---|
| Initial fetch | Loads currencies + rates in parallel; shows loading during fetch; clears loading on success |
| Conversion | Correct result for valid amount + rates; empty amount shows `—`; `to === from` returns same amount |
| `from` change | Triggers new rates fetch; uses cache on second visit; does not re-fetch currencies |
| Swap | Exchanges `from` and `to` correctly |
| Search filter | Matches on code; matches on name; case-insensitive; empty returns all; no match returns empty array |
| Error states | Rates fetch failure sets `error`; retry clears error and re-fetches; currencies failure falls back gracefully |
| AbortController | Changing `from` mid-fetch aborts previous request |

---

## Out of Scope (V3)

- Keyboard support for currency dropdowns
- Historical rate charts
- Favourite/pinned currencies
- Offline support / service worker caching
- User-configurable default currencies
