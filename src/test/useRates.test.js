import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useRates, { __resetCacheForTest } from "../hooks/useRates";

const MOCK_CURRENCIES = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
};

const MOCK_RATES_USD = {
  base: "USD",
  date: "2026-06-04",
  rates: { EUR: 0.9214, GBP: 0.7891, JPY: 149.82 },
};

const MOCK_RATES_EUR = {
  base: "EUR",
  date: "2026-06-04",
  rates: { USD: 1.0853, GBP: 0.8564, JPY: 162.6 },
};

function makeFetch({ currencies = true, rates = true } = {}) {
  return vi.fn((url) => {
    if (url.includes("/currencies")) {
      if (!currencies) return Promise.reject(new Error("Network error"));
      return Promise.resolve({ json: () => Promise.resolve(MOCK_CURRENCIES) });
    }
    const base = url.includes("from=EUR") ? "EUR" : "USD";
    if (!rates) return Promise.reject(new Error("Network error"));
    return Promise.resolve({
      json: () =>
        Promise.resolve(base === "EUR" ? MOCK_RATES_EUR : MOCK_RATES_USD),
    });
  });
}

beforeEach(() => {
  __resetCacheForTest();
  vi.unstubAllGlobals();
});

describe("useRates — scaffold", () => {
  it.todo("loads currency list on mount");
});
