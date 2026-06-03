import { useState, useEffect } from "react";
import * as math from "mathjs";

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
  const s = String(+num.toPrecision(10));
  return s.includes(".") ? s.replace(/\.?0+$/, "") : s;
}

function safeEvaluate(expr, isDeg) {
  if (!expr) return null;
  try {
    const result = math.evaluate(expr, isDeg ? DEG_SCOPE : {});
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
      return;
    }

    if (key === "=") {
      const val = safeEvaluate(expression, angleMode === "DEG");
      if (val === null || val === "Error") {
        setResult("Error");
      } else {
        setResult(val);
        setExpression(val);
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

    // Default: append key as-is (digits, operators, decimal, %)
    setExpression((prev) => prev + key);
  }

  return { expression, result, angleMode, isSecond, handleButton };
}
