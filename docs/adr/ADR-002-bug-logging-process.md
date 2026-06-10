# ADR-002: Bug Logging Process and GitHub Issue Standards

**Date:** 2026-06-09
**Status:** Accepted

## Context and Problem Statement

As the project matures and the workflow is being formalized for reuse across future projects, a consistent process is needed for: (1) distinguishing defects that warrant a GitHub issue from noise caught during development, (2) triaging by impact, and (3) tracing every bug to its fix via a closed PR loop.

## Decision Drivers

* Bugs found after a release must be discoverable, traceable, and prioritized — not fixed silently
* The process must scale to enterprise projects without requiring a separate tool (e.g. JIRA)
* Root cause must be confirmed before logging, not after — to avoid vague issues that can't be acted on
* P0/P1 bugs represent systemic failures that deserve a retro, not just a fix

## Considered Options

* **P0–P4 single priority axis** — one label encodes both severity and urgency; simpler for solo/small teams
* **Separate severity (S1–S5) + priority (P0–P4) axes** — richer triage but doubles labeling overhead; more appropriate at 5+ engineers where severity and business priority diverge regularly
* **Community Claude skills** (Report Bug, GitHub Issue Creator from mcpmarket.com/claudemarketplaces.com) — auto-generate issues from terminal context; rejected due to unvetted quality, known stability issues, and tight coupling to unofficial marketplaces

## Decision Outcome

**Chosen: P0–P4 single axis** — because the severity/priority split adds overhead without benefit at solo/small-team scale. A single axis forces an explicit decision at triage time (how urgent is this?) while keeping the label set manageable. Revisit if the team grows to 5+ engineers where a product manager sets priority independently of engineering severity.

**Custom `bug` skill over marketplace skills** — because the skill integrates directly with our existing `systematic-debugging` → branch → PR workflow, uses our exact label conventions, and avoids runtime dependencies on unvetted third-party tools.

### Bug definition

A defect is a **bug** (log it) if found after merge to main, after a release tag, as a regression, or reported externally. Caught during active development on an unmerged branch → fix inline, no issue.

### Consequences

* ✅ Every post-release defect is traceable from issue → branch → PR → merge
* ✅ P0/P1 bugs automatically require a retro, creating a feedback loop into `docs/retros/`
* ✅ `systematic-debugging` is a mandatory prerequisite — issues always include root cause
* ✅ `Fixes #NNN` in PR descriptions creates a closed audit trail via GitHub's closing keywords
* ⚠️ Single priority axis means severity and business urgency must be judged together at triage — acceptable trade-off at current scale
* ⚠️ Label setup (`gh label create`) must be run manually on each new repo — mitigated by inclusion in the New Project Checklist
