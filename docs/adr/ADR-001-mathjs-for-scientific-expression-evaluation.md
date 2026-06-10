# ADR-001: Use math.js for Scientific Tab Expression Evaluation

**Date:** 2026-06-09
**Status:** Accepted

## Context and Problem Statement

The Scientific tab requires evaluating composed mathematical expressions — e.g. `sin(45) + sqrt(16) * 2` — including trigonometric functions, logarithms, constants (π, e), and operator precedence. A mechanism is needed to parse and evaluate these expressions safely and correctly.

## Decision Drivers

* Expressions in the Scientific tab can be arbitrarily composed (nested functions, multiple operators), so a two-operand model is insufficient
* Evaluation must handle correct operator precedence and JS math edge cases (e.g. integer overflow, floating-point rounding) without custom workarounds
* Security: user-supplied strings must never execute arbitrary code
* Maintenance burden must stay low — the team is small and the expression language is well-defined

## Considered Options

* **math.js** — dedicated math expression library with a safe parser, correct numeric semantics, and built-in support for trig, logarithms, constants, and units
* **Custom recursive-descent parser** — hand-written parser and evaluator built specifically for this app
* **`eval()` / `Function()` on raw strings** — pass the user's expression string directly to the JS runtime for evaluation
* **Extend the Basic two-operand state machine** — add Scientific functions on top of `useCalculator.js`'s existing operand-pair model

## Decision Outcome

**Chosen: math.js** — because it eliminates the security risk of `eval()`, handles correct numeric semantics out of the box, and supports the full expression model the Scientific tab requires, all without the implementation and maintenance cost of a custom parser.

### Consequences

* ✅ Composed expressions (nested functions, multi-operator chains) work correctly with no custom parsing logic
* ✅ Operator precedence, floating-point behaviour, and math constants are handled by a well-tested library
* ✅ No code-execution attack surface — math.js's parser is sandboxed to math expressions
* ⚠️ Adds a third-party dependency; expression behaviour is coupled to math.js's semantics and release cadence
* ⚠️ Bundle size increases slightly; acceptable for a desktop-targeted calculator app
