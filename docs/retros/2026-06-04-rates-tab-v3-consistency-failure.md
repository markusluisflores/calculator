# Retro: Rates Tab V3 — Consistency Failure

**Date:** 2026-06-04
**Type:** incident
**Status:** pending

---

## What Went Right

- The Rates tab works correctly as a currency converter — the feature logic, API integration, and live rate fetching are all sound.
- The inconsistency was caught and articulated clearly enough to produce a concrete design constraint (numpad-first pattern), two CLAUDE.md improvements, and a new `consistency-audit` skill — meaning this incident produced durable process infrastructure that will prevent recurrence on every future tab.

## What Went Wrong

- Design started by jumping straight to a mockup. The mandatory design sequence (consistency audit → platform research → ui-ux-pro-max) was not followed.
- No one asked "does this match the existing input model?" before drawing the first mockup. The `consistency-audit` skill did not exist yet, so there was no enforced gate to prompt the question.
- `ui-ux-pro-max` was run after the mockup was already committed to. At that point it could only validate the design that existed — it could not catch the inconsistency before it was locked in.
- "Currency converter" pattern-matched to a familiar web UI (text input + dropdowns) without checking what the app already did for input. Both existing tabs use a numpad grid — a fact that would have been immediately visible had the codebase been read first.
- Once a mockup existed, design inertia made the right correction (rethink the input model) feel expensive. The later a consistency check runs, the more it costs.

## What We Can Improve

- Run `consistency-audit` before any mockup is drawn for any new tab — even when the feature type (currency converter, unit converter, etc.) has an obvious "standard" web pattern. The audit forces the question before the brain fills in an answer.
- Treat the design sequence as a gate, not a suggestion. If a mockup appears before the audit has run, the mockup is premature.
- Before V3.1 work begins, run the full design process in correct order: consistency audit first, then platform research, then `ui-ux-pro-max`. The design question to answer is "how does a numpad-driven currency converter work?" — not "how does a web currency converter look?"

## Action Items

| Item | Status |
|---|---|
| Document numpad-first pattern in project CLAUDE.md | Done |
| Add "Why the order matters" note to global CLAUDE.md Design Process section | Done |
| Create `consistency-audit` skill | Done |
| V3.1 redesign of Rates tab using numpad input | Pending |
| Run full design process (consistency audit first) before any V3.1 work begins | Pending |
