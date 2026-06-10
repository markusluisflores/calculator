# Rates V3.1 — ASCII Mockup

## Color Palette (existing Code Green theme)

■ #0f172a — Background (deep navy)
■ #1b2336 — Card surface
■ #22c55e — Accent (green) — currency buttons, active state
■ #ffffff — Primary text
■ #94a3b8 — Muted text (rate hint, labels)

---

## Main View

```
┌─────────────────────────────────┐
│  Basic   Scientific   Rates     │  <- tab bar (Rates active, green underline)
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │  1,250.00                 │  │  <- FROM display (amount typed via numpad)
│  │                  [ USD ▾] │  │  <- currency button (tappable → opens picker)
│  └───────────────────────────┘  │
│                                 │
│              [ ⇅ ]              │  <- swap button (green)
│                                 │
│  ┌───────────────────────────┐  │
│  │  66,250.50                │  │  <- TO display (live result, read-only)
│  │                  [ PHP ▾] │  │  <- currency button
│  └───────────────────────────┘  │
│                                 │
│    1 USD = 53.00 PHP · today    │  <- rate hint (muted)
│                                 │
├─────────────────────────────────┤
│                                 │
│   ┌───┐    ┌───┐    ┌───┐      │
│   │ 7 │    │ 8 │    │ 9 │      │
│   └───┘    └───┘    └───┘      │
│   ┌───┐    ┌───┐    ┌───┐      │
│   │ 4 │    │ 5 │    │ 6 │      │
│   └───┘    └───┘    └───┘      │
│   ┌───┐    ┌───┐    ┌───┐      │
│   │ 1 │    │ 2 │    │ 3 │      │
│   └───┘    └───┘    └───┘      │
│   ┌───┐    ┌───┐    ┌───┐      │
│   │ . │    │ 0 │    │ ⌫ │      │
│   └───┘    └───┘    └───┘      │
│                                 │
├─────────────────────────────────┤
│  EXCHANGE RATES  (base: USD) [▾]│  <- collapsed by default, tap to expand
└─────────────────────────────────┘
```

**Notes:**
- Tapping a row in the rate table sets that currency as the TO currency
- Rate table rows are scrollable when expanded; numpad and display stay fixed
- Currency selection via picker modal (currency buttons) or tapping a rate table row

---

## Currency Picker Modal

Opens when user taps `[ USD ▾ ]` or `[ PHP ▾ ]`.

```
┌─────────────────────────────────┐
│  Select Currency             ✕  │  <- modal header, tap ✕ or swipe down to dismiss
├─────────────────────────────────┤
│  ┌─────────────────────────┐    │
│  │ Search currencies...    │    │  <- search input (only keyboard input in the UI)
│  └─────────────────────────┘    │
│  ─────────────────────────────  │
│  EUR    Euro                    │
│  GBP    British Pound           │
│  JPY    Japanese Yen            │
│  PHP    Philippine Peso         │
│  USD    US Dollar               │
│  ...  (virtualized, 150+ items) │
└─────────────────────────────────┘
```

**Notes:**
- Search input here is intentional — filtering reference data, not calculator input
- List is virtualized (50+ items UX rule)
- Selected currency gets a green checkmark or highlight
- Dismissing without selection keeps current currency

---

## Design Questions

---

### Q1 — Rate Table: Keep, Drop, or Optional?   ✅ CHOSEN: Option C

**Option A — Keep (always visible)**
```
│   [ . ]   [ 0 ]   [ ⌫ ]        │
├─────────────────────────────────┤
│  EXCHANGE RATES  (base: USD)    │
│  EUR    Euro             0.9201 │
│  GBP    British Pound    0.7834 │
│  JPY    Japanese Yen   149.500  │
│  PHP    Philippine Peso  53.00  │
│  ...  (scrollable)              │
└─────────────────────────────────┘
```
Tapping a row sets it as the TO currency. Numpad + display are fixed; only table scrolls.

---

**Option B — Drop (numpad only)**
```
│   [ . ]   [ 0 ]   [ ⌫ ]        │
│                                 │
└─────────────────────────────────┘
```
Cleaner. Currency selection only via picker modal. No reference panel.

---

**✅ Option C — Optional (collapsed by default, expandable)**
```
│   [ . ]   [ 0 ]   [ ⌫ ]        │
├─────────────────────────────────┤
│  EXCHANGE RATES  (base: USD) [▾]│  <- tap to expand
└─────────────────────────────────┘
```
Expanded state:
```
│   [ . ]   [ 0 ]   [ ⌫ ]        │
├─────────────────────────────────┤
│  EXCHANGE RATES  (base: USD) [▴]│  <- tap to collapse
│  EUR    Euro             0.9201 │
│  GBP    British Pound    0.7834 │
│  PHP    Philippine Peso  53.00  │
│  ...  (scrollable)              │
└─────────────────────────────────┘
```

---

### Q2 — Rate Table Search   ✅ CHOSEN: Option B

**Option A — No search, scroll only**
```
│  EXCHANGE RATES  (base: USD)    │
│  AED    UAE Dirham       3.6725 │
│  AUD    Australian Dol.  1.5301 │
│  EUR    Euro             0.9201 │
│  GBP    British Pound    0.7834 │
│  JPY    Japanese Yen   149.500  │
│  ...  (scroll to find)          │
```
Simple. No keyboard input on the main screen.

---

**✅ Option B — Inline search input (keep current behavior)**
```
│  EXCHANGE RATES  (base: USD)    │
│  ┌─────────────────────────┐    │
│  │ Search currencies...    │    │  <- keyboard input (exception to numpad rule)
│  └─────────────────────────┘    │
│  EUR    Euro             0.9201 │
│  GBP    British Pound    0.7834 │
│  ...  (filtered)                │
```
Defensible: filters reference data, not calculator input.

---

**Option C — Filter button opens modal**
```
│  EXCHANGE RATES  (base: USD)    │
│                   [ Filter ▾ ]  │  <- tap opens picker modal
│  EUR    Euro             0.9201 │
│  GBP    British Pound    0.7834 │
│  ...  (full list, no inline     │
│        keyboard)                │
```
Filter modal (same style as currency picker):
```
┌─────────────────────────────────┐
│  Filter Rates                ✕  │
├─────────────────────────────────┤
│  ┌─────────────────────────┐    │
│  │ Search currencies...    │    │
│  └─────────────────────────┘    │
│  [ EUR ] [ GBP ] [ JPY ] ...    │  <- selected filters shown as chips
│  ─────────────────────────────  │
│  AED    UAE Dirham              │
│  AUD    Australian Dollar       │
│  ...                            │
└─────────────────────────────────┘
```
No keyboard visible on main screen. Consistent with numpad identity.

---

### Q3 — Swap Button Position   ✅ CHOSEN: Option A

**✅ Option A — Between the two display rows**
```
│  ┌───────────────────────────┐  │
│  │  1,250.00        [ USD ▾] │  │
│  └───────────────────────────┘  │
│              [ ⇅ ]              │  <- standalone, center-aligned
│  ┌───────────────────────────┐  │
│  │  66,250.50       [ PHP ▾] │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│   [ 7 ]   [ 8 ]   [ 9 ]        │
│   [ 4 ]   [ 5 ]   [ 6 ]        │
│   [ 1 ]   [ 2 ]   [ 3 ]        │
│   [ . ]   [ 0 ]   [ ⌫ ]        │
```
Swap is spatially close to what it affects (the two rows). Native iOS pattern.

---

**Option B — Inside the numpad (replaces decimal)**
```
│  ┌───────────────────────────┐  │
│  │  1,250.00        [ USD ▾] │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  66,250.50       [ PHP ▾] │  │
│  └───────────────────────────┘  │
│    1 USD = 53.00 PHP · today    │
├─────────────────────────────────┤
│   [ 7 ]   [ 8 ]   [ 9 ]        │
│   [ 4 ]   [ 5 ]   [ 6 ]        │
│   [ 1 ]   [ 2 ]   [ 3 ]        │
│   [ ⇅ ]   [ 0 ]   [ ⌫ ]        │  <- swap replaces decimal point
```
More compact. Decimal removed (currency amounts rarely need it? — debatable).
Note: losing the decimal point means no fractional input (e.g. 1.5 USD).

---

## Decisions

| Question | Chosen | Why | Tradeoff accepted |
|---|---|---|---|
| Q1 — Rate table | Option C (collapsible) | Keeps reference data accessible without occupying space by default; cleaner initial view focused on the converter | Toggle adds a small interaction cost to access the table |
| Q2 — Rate table search | Option B (inline input) | Practical for 150+ currencies; search here filters reference data, not calculator input — a defensible exception to the numpad rule | Keyboard input visible on the main screen when table is expanded |
| Q3 — Swap button | Option A (between rows) | Spatially adjacent to what it affects; matches native iOS calculator pattern | Takes up vertical space between the two display rows |
