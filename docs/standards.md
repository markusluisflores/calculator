# Calculator App — Established Standards

Patterns and interaction models all features must follow. When running a consistency audit, read this file first — it is the canonical source. After any audit that surfaces a new pattern, add it here.

---

## Input Model

Every tab uses a **numpad button grid** for digit input — no free-text `<input>` fields for numbers. This applies to any new tab or feature that accepts numeric input.

See `src/components/` for reference implementations (BasicCalculator, ScientificCalculator).

## Display

Every tab has a **display area at the top** showing current input and result. No inline display inside button grids.

## Controls

Tab-specific actions use **operator/action buttons** — not inline form controls (dropdowns inside the grid, text fields beside buttons, etc.).

## Tab Identity

New tabs must extend what this app **is** — a calculator with domain-specific modes. A tab that replaces the calculator interaction model with a standalone tool (form-based, wizard-based, etc.) is an identity mismatch. Raise this explicitly during brainstorming before designing.

> Background: V3 Rates tab shipped as a currency exchange form rather than a calculator mode. See `docs/retros/2026-06-04-rates-tab-v3-consistency-failure.md` and `docs/adr/` for the decision record.

---

## Adding a New Standard

When a consistency audit or brainstorm produces a new pattern that all future features must follow:
1. Add it here under the appropriate section (or create a new section)
2. Update the one-liner reference in `CLAUDE.md`
