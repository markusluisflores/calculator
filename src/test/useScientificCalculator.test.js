import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useScientificCalculator from "../hooks/useScientificCalculator";

function press(result, ...keys) {
  keys.forEach((key) => act(() => result.current.handleButton(key)));
}

describe("useScientificCalculator — basic arithmetic", () => {
  it("adds two numbers", () => {
    const { result } = renderHook(() => useScientificCalculator());
    press(result, "5", "+", "3", "=");
    expect(result.current.result).toBe("8");
  });

  it("handles Unicode operators from the numpad", () => {
    const { result } = renderHook(() => useScientificCalculator());
    press(result, "6", "×", "7", "=");
    expect(result.current.result).toBe("42");

    press(result, "AC", "8", "÷", "4", "=");
    expect(result.current.result).toBe("2");
  });

  it("returns Error on division by zero", () => {
    const { result } = renderHook(() => useScientificCalculator());
    press(result, "5", "÷", "0", "=");
    expect(result.current.result).toBe("Error");
  });
});

describe("useScientificCalculator — trig in DEG mode", () => {
  it("sin(45) ≈ 0.7071", () => {
    const { result } = renderHook(() => useScientificCalculator());
    press(result, "sin", "4", "5", "( )", "=");
    expect(parseFloat(result.current.result)).toBeCloseTo(0.7071, 4);
  });

  it("cos(60) = 0.5", () => {
    const { result } = renderHook(() => useScientificCalculator());
    press(result, "cos", "6", "0", "( )", "=");
    expect(parseFloat(result.current.result)).toBeCloseTo(0.5, 4);
  });

  it("tan(45) = 1", () => {
    const { result } = renderHook(() => useScientificCalculator());
    press(result, "tan", "4", "5", "( )", "=");
    expect(parseFloat(result.current.result)).toBeCloseTo(1, 4);
  });
});

describe("useScientificCalculator — inverse trig in DEG mode", () => {
  it("asin(0.5) = 30°", () => {
    const { result } = renderHook(() => useScientificCalculator());
    // 2nd + sin = asin
    press(result, "2nd", "sin", "0", ".", "5", "( )", "=");
    expect(parseFloat(result.current.result)).toBeCloseTo(30, 3);
  });
});

describe("useScientificCalculator — trig in RAD mode", () => {
  it("sin(π/4) ≈ 0.7071 in RAD", () => {
    const { result } = renderHook(() => useScientificCalculator());
    press(result, "DEG/RAD"); // switch to RAD
    press(result, "sin", "π", "÷", "4", "( )", "=");
    expect(parseFloat(result.current.result)).toBeCloseTo(0.7071, 4);
  });
});

describe("useScientificCalculator — log and ln", () => {
  it("ln(1) = 0", () => {
    const { result } = renderHook(() => useScientificCalculator());
    press(result, "ln", "1", "( )", "=");
    expect(result.current.result).toBe("0");
  });

  it("log10(100) = 2 via 2nd+ln", () => {
    const { result } = renderHook(() => useScientificCalculator());
    press(result, "2nd", "ln", "1", "0", "0", "( )", "=");
    expect(result.current.result).toBe("2");
  });
});

describe("useScientificCalculator — powers and roots", () => {
  it("sqrt(16) = 4", () => {
    const { result } = renderHook(() => useScientificCalculator());
    press(result, "√x", "1", "6", "( )", "=");
    expect(result.current.result).toBe("4");
  });

  it("x² squares a number (3² = 9)", () => {
    const { result } = renderHook(() => useScientificCalculator());
    press(result, "3", "x²", "=");
    expect(result.current.result).toBe("9");
  });
});

describe("useScientificCalculator — factorial", () => {
  it("5! = 120", () => {
    const { result } = renderHook(() => useScientificCalculator());
    press(result, "5", "n!", "=");
    expect(result.current.result).toBe("120");
  });

  it("sqrt of negative returns Error", () => {
    const { result } = renderHook(() => useScientificCalculator());
    // builds sqrt(−4)
    press(result, "√x", "−", "4", "( )", "=");
    expect(result.current.result).toBe("Error");
  });
});

describe("useScientificCalculator — = repeat", () => {
  it("repeats last operation on successive = presses", () => {
    const { result } = renderHook(() => useScientificCalculator());
    press(result, "5", "+", "3", "=");
    expect(result.current.result).toBe("8");
    press(result, "=");
    expect(result.current.result).toBe("11");
    press(result, "=");
    expect(result.current.result).toBe("14");
  });
});

describe("useScientificCalculator — AC and backspace", () => {
  it("AC resets to 0", () => {
    const { result } = renderHook(() => useScientificCalculator());
    press(result, "5", "+", "3", "AC");
    expect(result.current.result).toBe("0");
    expect(result.current.expression).toBe("");
  });

  it("⌫ deletes whole function token", () => {
    const { result } = renderHook(() => useScientificCalculator());
    press(result, "sin"); // appends "sin("
    expect(result.current.expression).toBe("sin(");
    press(result, "⌫");
    expect(result.current.expression).toBe("");
  });
});

describe("useScientificCalculator — smart parens", () => {
  it("inserts ( when no open parens", () => {
    const { result } = renderHook(() => useScientificCalculator());
    press(result, "( )");
    expect(result.current.expression).toBe("(");
  });

  it("inserts ) to close open paren after a digit", () => {
    const { result } = renderHook(() => useScientificCalculator());
    press(result, "( )", "5", "( )");
    expect(result.current.expression).toBe("(5)");
  });
});

describe("useScientificCalculator — DEG/RAD toggle", () => {
  it("starts in DEG mode", () => {
    const { result } = renderHook(() => useScientificCalculator());
    expect(result.current.angleMode).toBe("DEG");
  });

  it("toggles to RAD and back", () => {
    const { result } = renderHook(() => useScientificCalculator());
    press(result, "DEG/RAD");
    expect(result.current.angleMode).toBe("RAD");
    press(result, "DEG/RAD");
    expect(result.current.angleMode).toBe("DEG");
  });
});
