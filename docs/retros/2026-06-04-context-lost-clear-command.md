# Retro: Context Lost via /clear Command

**Date:** 2026-06-04  
**Type:** incident  
**Status:** resolved

---

## What Went Right

- The loss was caught before any implementation began — no code was written based on incomplete or misremembered requirements.
- The Frankfurter API URL fix (`api.frankfurter.dev/v1`) and the V3 Rates tab base were already committed to `main`, so the concrete work was not lost — only the in-progress discussion was.

## What Went Wrong

- The developer issued `/clear` to reset conversation context, which wiped all in-memory state for the session with no warning and no automatic recovery path.
- The session Stop hook referenced in `settings.json` pointed to scripts in the `scripts/` directory, but those scripts had not yet been created — the directory was empty — so no session log was written at shutdown.
- Without a session log, the partially-discussed V3.1 Rates tab redesign requirements (specifically the decision to replace text inputs with a numpad model) could not be recovered in the next session.
- Root cause: two independent failure modes compounded. First, `/clear` has no undo and no confirmation prompt. Second, the Stop hook was configured but not implemented, creating a false assumption that logging was active.

## What We Can Improve

- We could implement the Stop hook scripts before relying on them, so that any session ending — whether via `/clear`, crash, or natural close — produces a log.
- We could treat in-progress design decisions (requirements not yet written to a spec file) as volatile state and persist them to a `docs/superpowers/specs/` draft file at the end of any design discussion, before the conversation continues.
- We could add a note in `CLAUDE.md` warning that `/clear` destroys unsaved requirements, reinforcing the habit of writing specs before switching context.
- We could, after any `/clear`, begin the next session by re-running `consistency-audit` and `superpowers:brainstorming` to re-derive requirements from first principles rather than relying on memory.

## Action Items

| Item | Status |
|---|---|
| Implement the session Stop hook script in `scripts/` so session logs are actually written | Done |
| Write a V3.1 Rates tab spec to `docs/superpowers/specs/` before starting implementation, capturing the numpad-input redesign decision | Pending |
| Add a warning note to `CLAUDE.md` that `/clear` destroys in-memory requirements and that specs must be written first | Pending |
