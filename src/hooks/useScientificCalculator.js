import { useState, useEffect, useRef } from "react";
import * as math from "mathjs";

// Base scope: includes ln (math.js uses 'log' for natural log) and
// out-of-domain guards for inverse trig so we get NaN (→ "Error") instead
// of a Complex number when |x| > 1 in RAD mode.
const BASE_SCOPE = {
  ln: Math.log,
  asin: (x) => (Math.abs(x) > 1 ? NaN : Math.asin(x)),
  acos: (x) => (Math.abs(x) > 1 ? NaN : Math.acos(x)),
  atan: Math.atan,
};

// DEG scope: overrides trig functions to accept/return degrees
const DEG_SCOPE = {
  sin: (x) => Math.sin((x * Math.PI) / 180),
  cos: (x) => Math.cos((x * Math.PI) / 180),
  tan: (x) => Math.tan((x * Math.PI) / 180),
  asin: (x) => (Math.asin(x) * 180) / Math.PI,
  acos: (x) => (Math.acos(x) * 180) / Math.PI,
  atan: (x) => (Math.atan(x) * 180) / Math.PI,
};

// Function tokens deleted as a whole unit on backspace
const FUNCTION_TOKENS = [
  "asin(",
  "acos(",
  "atan(",
  "sin(",
  "cos(",
  "tan(",
  "log10(",
  "ln(",
  "sqrt(",
  "^(1/",
  "^(",
  "^2",
  "pi",
];

// Primary button label → expression token
const PRIMARY_MAP = {
  sin: "sin(",
  cos: "cos(",
  tan: "tan(",
  ln: "ln(",
  "x²": "^2",
  "√x": "sqrt(",
  π: "pi",
  "n!": "!",
};

// Keyboard → button label mapping
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
  Backspace: "⌫",
  "(": "( )",
  ")": "( )",
  "%": "%",
};

// 2nd-key button label → expression token (keyed by primary label)
const SECOND_MAP = {
  sin: "asin(",
  cos: "acos(",
  tan: "atan(",
  ln: "log10(",
  "x²": "^(",
  "√x": "^(1/",
  π: "e",
};

function fmt(num) {
  if (!isFinite(num)) return "Error";
  const abs = Math.abs(num);
  if (abs >= 1e10 || (abs > 0 && abs < 1e-6)) {
    return num.toExponential(6).replace(/\.?0+e/, "e");
  }
  const s = String(+num.toPrecision(10));
  return s.includes(".") ? s.replace(/\.?0+$/, "") : s;
}

function normalizeExpr(expr) {
  return expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
}

function safeEvaluate(expr, isDeg) {
  if (!expr) return null;
  try {
    const scope = isDeg ? { ...BASE_SCOPE, ...DEG_SCOPE } : BASE_SCOPE;
    const result = math.evaluate(normalizeExpr(expr), scope);
    if (typeof result !== "number") return null;
    return fmt(result);
  } catch {
    return null;
  }
}

function applyBackspace(expr) {
  for (const token of FUNCTION_TOKENS) {
    if (expr.endsWith(token)) return expr.slice(0, -token.length);
  }
  return expr.slice(0, -1);
}

function applySmartParen(expr) {
  let open = 0;
  for (const ch of expr) {
    if (ch === "(") open++;
    if (ch === ")") open--;
  }
  if (open > 0 && expr.length > 0) {
    const last = expr[expr.length - 1];
    if (/[0-9).]/.test(last) || expr.endsWith("pi") || expr.endsWith("e")) {
      return expr + ")";
    }
  }
  return expr + "(";
}

export default function useScientificCalculator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("0");
  const [isSecond, setIsSecond] = useState(false);
  const [angleMode, setAngleMode] = useState("DEG");

  const afterResultRef = useRef(false);
  const handleButtonRef = useRef(null);

  // Keep handleButtonRef current on every render so the keydown listener
  // always calls the latest version of handleButton without re-registering.
  useEffect(() => {
    handleButtonRef.current = handleButton;
  });

  // Global keyboard listener — registered once, reads via ref.
  useEffect(() => {
    function onKeyDown(e) {
      const key = KEYMAP[e.key];
      if (key) {
        e.preventDefault();
        handleButtonRef.current(key);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Live evaluation on every expression or angle-mode change
  useEffect(() => {
    if (!expression) {
      setResult("0");
      return;
    }
    const val = safeEvaluate(expression, angleMode === "DEG");
    if (val !== null) setResult(val);
  }, [expression, angleMode]);

  function handleButton(key) {
    if (key === "AC") {
      setExpression("");
      setResult("0");
      setIsSecond(false);
      afterResultRef.current = false;
      return;
    }

    if (key === "2nd") {
      setIsSecond((prev) => !prev);
      return;
    }

    if (key === "⌫") {
      setExpression((prev) => applyBackspace(prev));
      setIsSecond(false);
      return;
    }

    if (key === "DEG/RAD") {
      setAngleMode((prev) => (prev === "DEG" ? "RAD" : "DEG"));
      setIsSecond(false);
      return;
    }

    if (key === "=") {
      if (!expression) return;
      const val = safeEvaluate(expression, angleMode === "DEG");
      if (val === null || val === "Error") {
        setResult("Error");
      } else {
        setResult(val);
        setExpression(val);
        afterResultRef.current = true;
      }
      setIsSecond(false);
      return;
    }

    if (key === "( )") {
      setExpression((prev) => applySmartParen(prev));
      setIsSecond(false);
      return;
    }

    if (key === "+/−") {
      setExpression((prev) => {
        if (!prev) return "-";
        if (prev.startsWith("-")) return prev.slice(1);
        return "-" + prev;
      });
      setIsSecond(false);
      return;
    }

    // Scientific function keys: use 2nd map if active and key has a secondary
    if (key in PRIMARY_MAP) {
      const token =
        isSecond && key in SECOND_MAP ? SECOND_MAP[key] : PRIMARY_MAP[key];
      setExpression((prev) => prev + token);
      setIsSecond(false);
      return;
    }

    if (key === "%") {
      setExpression((prev) => prev + "/100");
      setIsSecond(false);
      return;
    }

    // Default: append key as-is (digits, operators, decimal, %)
    const isDigitOrDecimal = /^[0-9.]$/.test(key);
    if (afterResultRef.current && isDigitOrDecimal) {
      afterResultRef.current = false;
      setExpression(key);
      return;
    }
    afterResultRef.current = false;
    setExpression((prev) => prev + key);
  }

  return { expression, result, angleMode, isSecond, handleButton };
}
