import { useState, useEffect } from "react";

// Pure helper: format a number with thousands separator, max 10 significant digits
function fmt(n) {
  if (!isFinite(n)) return "Error";
  return parseFloat(n.toPrecision(10)).toLocaleString("en-US", {
    maximumSignificantDigits: 10,
  });
}

// Pure helper: apply operator to two numbers
function evaluate(a, op, b) {
  if (op === "+") return a + b;
  if (op === "−") return a - b;
  if (op === "×") return a * b;
  if (op === "÷") return b === 0 ? null : a / b;
  return b;
}

// Keyboard key → calculator key mapping
const KEYMAP = {
  0: "0",
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  ".": ".",
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
  Enter: "=",
  "=": "=",
  Escape: "AC",
  "%": "%",
  Backspace: "Backspace",
};

const OPS = ["+", "−", "×", "÷"];

const INITIAL = {
  input: "0", // raw string shown on bottom line
  expression: "", // formatted string shown on top line
  pendingOp: null, // stored operator awaiting right operand
  pendingVal: null, // stored left operand
  // phase controls what happens on the next keypress:
  // 'typing'   — user is actively entering digits
  // 'operator' — operator just pressed, next digit starts right operand
  // 'result'   — = was pressed, next digit starts fresh
  phase: "typing",
  lastOp: null, // last operator used — enables = repeat
  lastArg: null, // last right operand used — enables = repeat
};

// Pure state transition — takes current state + key, returns next state.
// Defined outside the hook so the keyboard useEffect has no stale closure risk.
function processKey(s, key) {
  const inputNum = parseFloat(s.input.replace(/,/g, "")) || 0;

  if (key === "AC") return INITIAL;

  if (key === "+/−") {
    const negated = -inputNum;
    if (s.phase === "operator") {
      return { ...s, input: fmt(negated), pendingVal: negated };
    }
    return { ...s, input: fmt(negated) };
  }

  if (key === "%") {
    const pct = inputNum / 100;
    if (s.phase === "operator") {
      return { ...s, input: fmt(pct), pendingVal: pct };
    }
    return { ...s, input: fmt(pct) };
  }

  if (OPS.includes(key)) {
    // Chain: pending op exists AND user is mid-typing the right operand → evaluate first
    if (s.pendingOp && s.phase === "typing") {
      const result = evaluate(s.pendingVal, s.pendingOp, inputNum);
      if (result === null)
        return { ...INITIAL, input: "Error", phase: "result" };
      const r = fmt(result);
      return {
        input: r,
        expression: `${r} ${key}`,
        pendingOp: key,
        pendingVal: result,
        phase: "operator",
      };
    }
    // First operator press, or pressing operator after result/another operator
    return {
      input: s.input,
      expression: `${s.input} ${key}`,
      pendingOp: key,
      pendingVal: inputNum,
      phase: "operator",
    };
  }

  if (key === "=") {
    // Repeat last operation when already in result phase
    if (s.phase === "result" && s.lastOp !== null) {
      const result = evaluate(inputNum, s.lastOp, s.lastArg);
      if (result === null)
        return { ...INITIAL, input: "Error", phase: "result" };
      const r = fmt(result);
      return {
        ...s,
        input: r,
        expression: `${s.input} ${s.lastOp} ${fmt(s.lastArg)} =`,
        phase: "result",
      };
    }
    if (!s.pendingOp) return s;
    const result = evaluate(s.pendingVal, s.pendingOp, inputNum);
    if (result === null) return { ...INITIAL, input: "Error", phase: "result" };
    return {
      input: fmt(result),
      expression: `${s.expression} ${s.input} =`,
      pendingOp: null,
      pendingVal: null,
      phase: "result",
      lastOp: s.pendingOp,
      lastArg: inputNum,
    };
  }

  if (key === "Backspace") {
    if (s.phase !== "typing") return s;
    if (s.input.length <= 1 || s.input === "-") return { ...s, input: "0" };
    return { ...s, input: s.input.slice(0, -1) };
  }

  if (key === ".") {
    if (s.phase === "result")
      return { ...INITIAL, input: "0.", phase: "typing" };
    if (s.phase === "operator") return { ...s, input: "0.", phase: "typing" };
    if (s.input.includes(".")) return s;
    return { ...s, input: s.input + "." };
  }

  // Digit key
  const digit = key;
  if (s.phase === "result")
    return { ...INITIAL, input: digit === "0" ? "0" : digit };
  if (s.phase === "operator")
    return { ...s, input: digit === "0" ? "0" : digit, phase: "typing" };
  // phase === 'typing'
  if (s.input === "0" && digit === "0") return s;
  if (s.input === "0") return { ...s, input: digit };
  if (s.input.replace(/[.,]/g, "").length >= 12) return s;
  return { ...s, input: s.input + digit };
}

export default function useCalculator() {
  const [state, setState] = useState(INITIAL);

  function handleButton(key) {
    setState((prev) => processKey(prev, key));
  }

  useEffect(() => {
    function onKeyDown(e) {
      const key = KEYMAP[e.key];
      if (!key) return;
      e.preventDefault();
      setState((prev) => processKey(prev, key));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []); // empty deps: processKey is module-level, setState is stable

  return {
    expression: state.expression,
    result: state.input,
    handleButton,
  };
}
