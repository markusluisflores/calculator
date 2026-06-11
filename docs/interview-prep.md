# Calculator App — Interview Prep & Showcase

A full-cycle solo project building a calculator web app from scratch, with professional software engineering practices applied throughout: structured workflows, automated testing, CI/CD, architecture decision records, and an AI-assisted development process.

---

## The Project

**What it is:** A progressive web calculator with three tabs — Basic (two-operand state machine), Scientific (math.js expression model), and Rates (live currency converter via Frankfurter API).

**Stack:** Vite 8 + React 19, plain CSS, math.js, Vitest + @testing-library/react, GitHub Actions CI/CD.

**Built in four versions:**
- V1: Basic calculator with keyboard support and = repeat
- V2: Scientific mode with 2nd-key toggle, DEG/RAD, and math.js evaluation
- V3: Rates tab (identified as wrong interaction model after shipping — see Retro)
- V3.1: Rates tab redesigned with numpad input model, collapsible rate table, currency picker modal

---

## Engineering Process

### Feature Development Workflow
Every feature — no matter how small — follows this sequence:

1. **Branch** — feature branch, never commit to main directly
2. **Brainstorm** — full design process before any code
3. **Plan** — written spec + implementation plan saved to `docs/superpowers/`
4. **Implement** — subagent-driven development with two-stage review per task
5. **Test** — all hook logic covered by unit tests before PR opens
6. **Security review** — diff reviewed before pushing
7. **Finish** — PR opened, CI must pass, branch protection enforced

### Design Process (3 mandatory steps before any mockup)
1. **Consistency audit** — read existing components, hooks, and styles to identify established patterns (input model, display conventions, navigation). Ask: does this feature extend what the system *is*, or import a foreign identity?
2. **Platform research** — look up how leading products on the target platform implement the same feature natively
3. **ui-ux-pro-max** — domain-specific UX research

**Why the order matters:** V3 Rates tab was designed with web-form text inputs while every other tab uses a numpad. The inconsistency wasn't caught until after implementation because the consistency audit ran after the design. The process was corrected as a direct result.

### Bug Workflow
1. Invoke systematic-debugging — confirm root cause before filing anything
2. Classify priority (P0–P4)
3. File GitHub issue with root cause, steps to reproduce, expected/actual behavior
4. Fix on a branch with `Fixes #N` in the PR description (auto-closes on merge)
5. P0/P1: write a retro after the fix merges

---

## Skills Created

| Skill | Purpose |
|---|---|
| `consistency-audit` | Pre-design pattern audit — reads existing code to identify what patterns a new feature must follow or explicitly deviate from. Includes a 5th question: does this feature extend what the system *is*, or import a foreign identity? |
| `bug` | Structured bug workflow — P0–P4 priority system, systematic-debugging prerequisite, `gh issue create` template, retro requirement for P0/P1. Also covers CI failures blocking a PR merge. |
| `adr` | Architecture Decision Records in MADR format — captures what was decided, what alternatives were considered, and why. Stored in `docs/adr/`, indexed in `README.md`. Prevents re-litigating decisions in future sessions. |
| `journal` | Session journaling — appends structured summaries to `docs/journal/YYYY.md`. Records decisions with reasoning, changes, and pending items. Triggered automatically by the PreCompact hook. |
| `retro` | Post-mortem format for P0/P1 bugs and significant incidents — what went wrong, root cause, what changes were made to prevent recurrence. |
| `github-setup` | One-command project infrastructure — copies canonical templates (issue templates, PR template, CI workflow, Dependabot), creates labels, documents branch protection setup. |
| `multi-model-review` | Opt-in GitHub Actions workflow that sends PR diffs to GPT-5 Codex for code review. Addresses reviewer bias (Claude reviewing Claude-written code). |

---

## Skills Used (from plugins)

| Skill | What it does |
|---|---|
| `superpowers:brainstorming` | Turns ideas into specs through structured dialogue — consistency audit first, then platform research, then design, then spec doc |
| `superpowers:writing-plans` | Produces step-by-step implementation plans with exact file paths, code snippets, and test commands — no placeholders |
| `superpowers:subagent-driven-development` | Executes plans by dispatching a fresh subagent per task with two-stage review (spec compliance → code quality) after each |
| `superpowers:systematic-debugging` | Forces root cause investigation before any fix — four phases: investigate, pattern analysis, hypothesis, implementation |
| `superpowers:verification-before-completion` | Pre-PR checklist — run the app, test the golden path, verify live API calls work |
| `superpowers:requesting-code-review` | Structured code review dispatch for human or subagent reviewers |
| `ui-ux-pro-max` | 50+ UX rules across 10 categories — accessibility, touch targets, animation, forms, navigation, typography, color |
| `commit-commands:commit-push-pr` | Automates commit → push → PR creation with conventional commit messages |

---

## Concepts and Techniques

### Subagent-Driven Development
Each implementation task is dispatched to a fresh subagent with zero context from the main session. The controller (main Claude) provides exactly what the subagent needs — task text, file paths, context. Two review gates per task: spec compliance first, then code quality. Final review across the entire implementation before the PR opens.

**Why it matters:** Fresh subagents follow TDD naturally, don't accumulate session bias, and can be dispatched in parallel. Two-stage review catches issues the implementer missed and issues the spec-compliance reviewer missed separately.

### Context Management
Claude Code compacts long sessions automatically. A PreCompact hook fires before compaction and writes the full conversation (text only, tool calls excluded) to a `docs/journal/session-draft-{id}.md` file. After compaction, Claude reads the draft and writes the journal entry from the original pre-compaction content, then deletes the draft. This ensures nothing is lost to compaction.

### Architecture Decision Records (ADRs)
Every significant architectural, tech, or workflow decision is recorded in MADR format before moving on. Captures: context, decision drivers, considered options with pros/cons, the chosen option, and consequences. Stored in `docs/adr/`. Prevents re-litigating decisions in future sessions.

**ADRs written:**
- ADR-001: math.js for scientific expression evaluation
- ADR-002: P0–P4 single-axis priority system for bug logging

### Branch Protection + CI/CD
- GitHub Actions CI runs on every PR (Test + Build jobs on Ubuntu)
- Branch protection requires both checks to pass before merge
- `enforce_admins: true` — no bypasses, even as repo owner
- `strict: true` — branch must be up to date with main before merge
- Dependabot configured for npm and GitHub Actions updates

**Lesson learned:** GitHub check names are case-sensitive. `test` ≠ `Test` — required status check names must match the CI job names exactly.

### The Rolldown Platform Binding Issue
`@rolldown/binding-win32-x64-msvc` was auto-added to `devDependencies` when Vite was installed on Windows. This is a platform-specific binary — Rolldown already declares all platform bindings as `optionalDependencies`. Having it as a required `devDependency` caused `EBADPLATFORM` errors on Linux CI runners. Fix: remove from `package.json`, regenerate lockfile.

**Lesson:** When installing npm packages on Windows that use native binaries (Vite, esbuild, Rollup), check `devDependencies` for platform-specific bindings that shouldn't be required deps.

### Multi-Model Code Review
Research finding: GPT-5 Codex (~85% SWE-bench) has a genuinely different training lineage from Claude. Using it as a reviewer on Claude-written code catches blind spots that same-model review misses — the same way having a different developer review code catches things the author can't see. Implemented as an opt-in GitHub Actions workflow, not mandatory on every project.

---

## Standards Established

**`docs/standards.md`** — canonical source for established interaction patterns:
- Input model: numpad-driven (not free-text)
- Display: result at top, always visible
- Actions: labeled grid buttons, no icon-only buttons
- Navigation: horizontal tab bar with active indicator
- Error states: inline, non-blocking

**`docs/adr/`** — architecture decisions that explain *why* the system is built the way it is

**`docs/retros/`** — post-mortems that explain *what went wrong* and *what changed*

**`docs/journal/`** — session-by-session record of decisions and reasoning

---

## Key Bugs and Lessons

| Bug | Root Cause | Fix | Process Lesson |
|---|---|---|---|
| V3 Rates tab used text input instead of numpad | Consistency audit ran after design, not before | Redesigned as V3.1 with numpad model | Consistency audit is now step 1 of every design process |
| Currency picker expanded to full viewport | `position: fixed` on overlay positioned relative to viewport, not calculator | `position: absolute` + `position: relative` on container | — |
| CI failing on Linux with `EBADPLATFORM` | `@rolldown/binding-win32-x64-msvc` in required `devDependencies` | Removed from `package.json`, regenerated lockfile | CI failures blocking a PR now qualify as bugs — file before fixing |
| Branch protection blocked passing CI | Required check names `test`/`build` (lowercase) didn't match CI job names `Test`/`Build` | Updated branch protection to use correct capitalization | GitHub check names are case-sensitive |

---

## Talking Points for Interviews

**"How do you ensure consistency across a codebase?"**
Before designing any new feature, I run a consistency audit — reading existing components, hooks, and styles to identify what patterns are established. I ask explicitly: does this feature extend what the system *is*, or introduce a foreign interaction model? In this project, skipping that step caused the Rates tab to ship with text inputs while every other tab used a numpad. I built a formal skill for this after the fact.

**"How do you approach testing?"**
All state logic lives in hooks and gets unit-tested with Vitest before any UI is built. I follow TDD: write the failing test first, implement the minimum to make it pass, commit. UI components are presentational — the hooks are testable in isolation. The test suite went from 33 tests in V1 to 77 by V3.1.

**"How do you manage technical debt and process improvements?"**
Every significant decision is recorded in an ADR with the alternatives considered and the tradeoff accepted. Post-mortems are written after P0/P1 bugs. When I find a process gap (like the missing consistency audit, or the missing bug-filing step for CI failures), I close it at the rule level — updating the mandatory skills table in CLAUDE.md so it can't be missed next time.

**"How do you handle cross-platform CI/CD?"**
I develop on Windows but CI runs on Linux. The Rolldown binary issue taught me to check for platform-specific native bindings after npm install. I use `npm ci` with a committed lockfile for reproducible builds, and Dependabot to keep dependencies current.
