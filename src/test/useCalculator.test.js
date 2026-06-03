import { describe, it, expect } from "vitest";

// processKey is not exported, so we test via the public evaluate/fmt helpers
// by importing the module and exercising the state machine through renderHook.
import { renderHook, act } from "@testing-library/react";
import useCalculator from "../hooks/useCalculator";

function press(result, ...keys) {
  keys.forEach((key) => act(() => result.current.handleButton(key)));
}

describe("useCalculator — basic arithmetic", () => {
  it("adds two numbers", () => {
    const { result } = renderHook(() => useCalculator());
    press(result, "5", "+", "3", "=");
    expect(result.current.result).toBe("8");
  });

  it("subtracts", () => {
    const { result } = renderHook(() => useCalculator());
    press(result, "9", "−", "4", "=");
    expect(result.current.result).toBe("5");
  });

  it("multiplies", () => {
    const { result } = renderHook(() => useCalculator());
    press(result, "6", "×", "7", "=");
    expect(result.current.result).toBe("42");
  });

  it("divides", () => {
    const { result } = renderHook(() => useCalculator());
    press(result, "8", "÷", "4", "=");
    expect(result.current.result).toBe("2");
  });

  it("returns Error on division by zero", () => {
    const { result } = renderHook(() => useCalculator());
    press(result, "5", "÷", "0", "=");
    expect(result.current.result).toBe("Error");
  });
});

describe("useCalculator — operator chaining", () => {
  it("chains operations left-to-right", () => {
    const { result } = renderHook(() => useCalculator());
    press(result, "2", "+", "3", "×", "4", "=");
    // 2+3=5, then 5×4=20 (left-to-right, not precedence)
    expect(result.current.result).toBe("20");
  });
});

describe("useCalculator — = repeat", () => {
  it("repeats last operation on successive = presses", () => {
    const { result } = renderHook(() => useCalculator());
    press(result, "5", "+", "3", "=");
    expect(result.current.result).toBe("8");
    press(result, "=");
    expect(result.current.result).toBe("11");
    press(result, "=");
    expect(result.current.result).toBe("14");
  });

  it("resets repeat when new expression is started", () => {
    const { result } = renderHook(() => useCalculator());
    press(result, "5", "+", "3", "="); // 8
    press(result, "2", "×", "4", "="); // fresh: 2×4=8
    expect(result.current.result).toBe("8");
  });
});

describe("useCalculator — AC and Backspace", () => {
  it("AC resets to 0", () => {
    const { result } = renderHook(() => useCalculator());
    press(result, "9", "9", "AC");
    expect(result.current.result).toBe("0");
  });

  it("Backspace removes last digit", () => {
    const { result } = renderHook(() => useCalculator());
    press(result, "1", "2", "3", "Backspace");
    expect(result.current.result).toBe("12");
  });
});

describe("useCalculator — % and +/−", () => {
  it("% divides by 100", () => {
    const { result } = renderHook(() => useCalculator());
    press(result, "5", "0", "%");
    expect(result.current.result).toBe("0.5");
  });

  it("+/− negates the current input", () => {
    const { result } = renderHook(() => useCalculator());
    press(result, "4", "+/−");
    expect(result.current.result).toBe("-4");
  });
});
