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
    const base = url.includes("base=EUR") ? "EUR" : "USD";
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

// ── Initial fetch ──────────────────────────────────────────────────────────

describe("useRates — initial fetch", () => {
  it("starts in loading state", () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    expect(result.current.loading).toBe(true);
  });

  it("clears loading and populates rates after fetch succeeds", async () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rates).toEqual(MOCK_RATES_USD.rates);
    expect(result.current.rateDate).toBe("2026-06-04");
  });

  it("populates allCurrencies from API with code and name", async () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    await waitFor(() =>
      expect(result.current.allCurrencies.length).toBeGreaterThan(0),
    );
    expect(result.current.allCurrencies).toContainEqual({
      code: "EUR",
      name: "Euro",
    });
    expect(result.current.allCurrencies).toContainEqual({
      code: "GBP",
      name: "British Pound",
    });
  });

  it("defaults to fromCurrency=USD, toCurrency=EUR, amount=''", () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    expect(result.current.fromCurrency).toBe("USD");
    expect(result.current.toCurrency).toBe("EUR");
    expect(result.current.amount).toBe("");
  });

  it("defaults tableExpanded=false and pickerTarget=null", () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    expect(result.current.tableExpanded).toBe(false);
    expect(result.current.pickerTarget).toBeNull();
  });
});

// ── Error states ───────────────────────────────────────────────────────────

describe("useRates — error states", () => {
  it("sets error when rates fetch fails", async () => {
    vi.stubGlobal("fetch", makeFetch({ rates: false }));
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/Could not fetch rates/);
  });

  it("falls back to empty allCurrencies when currencies fetch fails; rates still load", async () => {
    vi.stubGlobal("fetch", makeFetch({ currencies: false }));
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.allCurrencies).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.rates).toEqual(MOCK_RATES_USD.rates);
  });
});

// ── Session cache ──────────────────────────────────────────────────────────

describe("useRates — session cache", () => {
  it("re-fetches when fromCurrency changes via openPicker + selectCurrency", async () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.openPicker("from"));
    act(() => result.current.selectCurrency("EUR"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.rates).toEqual(MOCK_RATES_EUR.rates);
    expect(result.current.fromCurrency).toBe("EUR");
  });

  it("uses session cache on second visit to same base — no extra fetch", async () => {
    const mockFn = makeFetch();
    vi.stubGlobal("fetch", mockFn);
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.openPicker("from"));
    act(() => result.current.selectCurrency("EUR"));
    await waitFor(() =>
      expect(result.current.rates).toEqual(MOCK_RATES_EUR.rates),
    );

    act(() => result.current.openPicker("from"));
    act(() => result.current.selectCurrency("USD"));
    await waitFor(() =>
      expect(result.current.rates).toEqual(MOCK_RATES_USD.rates),
    );

    const usdFetches = mockFn.mock.calls.filter(([url]) =>
      url.includes("base=USD"),
    );
    expect(usdFetches).toHaveLength(1);
  });

  it("does not re-fetch currencies when fromCurrency changes", async () => {
    const mockFn = makeFetch();
    vi.stubGlobal("fetch", mockFn);
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.openPicker("from"));
    act(() => result.current.selectCurrency("EUR"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const currFetches = mockFn.mock.calls.filter(([url]) =>
      url.includes("/currencies"),
    );
    expect(currFetches).toHaveLength(1);
  });
});

// ── pressDigit ─────────────────────────────────────────────────────────────

describe("useRates — pressDigit", () => {
  it("appends a digit to empty amount", () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    act(() => result.current.pressDigit("5"));
    expect(result.current.amount).toBe("5");
  });

  it("appends digits sequentially", () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    act(() => result.current.pressDigit("1"));
    act(() => result.current.pressDigit("2"));
    act(() => result.current.pressDigit("3"));
    expect(result.current.amount).toBe("123");
  });

  it("prevents leading zero: pressing 0 on empty stays empty", () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    act(() => result.current.pressDigit("0"));
    expect(result.current.amount).toBe("");
  });

  it("enforces 10-digit pre-decimal limit", () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    for (let i = 0; i < 12; i++) {
      act(() => result.current.pressDigit("1"));
    }
    expect(result.current.amount).toBe("1111111111"); // exactly 10
  });

  it("allows digits after a decimal point beyond the 10-digit limit", () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    for (let i = 0; i < 10; i++) {
      act(() => result.current.pressDigit("1"));
    }
    act(() => result.current.pressDecimal());
    act(() => result.current.pressDigit("5"));
    expect(result.current.amount).toBe("1111111111.5");
  });
});

// ── pressDecimal ───────────────────────────────────────────────────────────

describe("useRates — pressDecimal", () => {
  it("appends decimal to empty amount", () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    act(() => result.current.pressDecimal());
    expect(result.current.amount).toBe(".");
  });

  it("appends decimal after digits", () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    act(() => result.current.pressDigit("1"));
    act(() => result.current.pressDecimal());
    expect(result.current.amount).toBe("1.");
  });

  it("is a no-op if decimal already present", () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    act(() => result.current.pressDigit("1"));
    act(() => result.current.pressDecimal());
    act(() => result.current.pressDecimal());
    expect(result.current.amount).toBe("1.");
  });
});

// ── pressBackspace ─────────────────────────────────────────────────────────

describe("useRates — pressBackspace", () => {
  it("removes last character", () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    act(() => result.current.pressDigit("1"));
    act(() => result.current.pressDigit("2"));
    act(() => result.current.pressBackspace());
    expect(result.current.amount).toBe("1");
  });

  it("resets to empty string on single character", () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    act(() => result.current.pressDigit("5"));
    act(() => result.current.pressBackspace());
    expect(result.current.amount).toBe("");
  });

  it("is a no-op on empty string", () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    act(() => result.current.pressBackspace());
    expect(result.current.amount).toBe("");
  });
});

// ── result derivation ──────────────────────────────────────────────────────

describe("useRates — result derivation", () => {
  async function loadedHook() {
    vi.stubGlobal("fetch", makeFetch());
    const hook = renderHook(() => useRates());
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    return hook;
  }

  it("computes result as amount × rates[toCurrency] to 2 decimal places", async () => {
    const { result } = await loadedHook();
    act(() => result.current.pressDigit("1"));
    act(() => result.current.pressDigit("0"));
    act(() => result.current.pressDigit("0"));
    expect(result.current.result).toBe((100 * 0.9214).toFixed(2));
  });

  it("shows '0.00' when amount is empty", async () => {
    const { result } = await loadedHook();
    expect(result.current.result).toBe((0 * 0.9214).toFixed(2)); // "0.00"
  });

  it("shows '—' when toCurrency rate is not in response (e.g. toCurrency = fromCurrency)", async () => {
    const { result } = await loadedHook();
    act(() => result.current.openPicker("to"));
    act(() => result.current.selectCurrency("USD")); // USD not in USD rates
    expect(result.current.result).toBe("—");
  });
});

// ── swap ───────────────────────────────────────────────────────────────────

describe("useRates — swap", () => {
  it("exchanges fromCurrency and toCurrency", async () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.fromCurrency).toBe("USD");
    expect(result.current.toCurrency).toBe("EUR");
    act(() => result.current.swap());
    expect(result.current.fromCurrency).toBe("EUR");
    expect(result.current.toCurrency).toBe("USD");
  });

  it("moves computed result into amount on swap", async () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.pressDigit("1"));
    act(() => result.current.pressDigit("0"));
    act(() => result.current.pressDigit("0"));
    const expectedAmount = (100 * 0.9214).toFixed(2);
    act(() => result.current.swap());
    expect(result.current.amount).toBe(expectedAmount);
  });

  it("sets amount to '' on swap when result is '—'", async () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.openPicker("to"));
    act(() => result.current.selectCurrency("USD"));
    act(() => result.current.swap());
    expect(result.current.amount).toBe("");
  });
});

// ── selectCurrency / openPicker / closePicker ──────────────────────────────

describe("useRates — picker actions", () => {
  it("openPicker sets pickerTarget", () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    act(() => result.current.openPicker("from"));
    expect(result.current.pickerTarget).toBe("from");
  });

  it("closePicker clears pickerTarget", () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    act(() => result.current.openPicker("to"));
    act(() => result.current.closePicker());
    expect(result.current.pickerTarget).toBeNull();
  });

  it("selectCurrency updates fromCurrency when pickerTarget=from", async () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.openPicker("from"));
    act(() => result.current.selectCurrency("GBP"));
    expect(result.current.fromCurrency).toBe("GBP");
  });

  it("selectCurrency updates toCurrency when pickerTarget=to", async () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.openPicker("to"));
    act(() => result.current.selectCurrency("JPY"));
    expect(result.current.toCurrency).toBe("JPY");
  });

  it("selectCurrency closes the picker", async () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.openPicker("to"));
    act(() => result.current.selectCurrency("JPY"));
    expect(result.current.pickerTarget).toBeNull();
  });

  it("selectCurrency with null pickerTarget does not change currencies", async () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.selectCurrency("GBP")); // pickerTarget is null
    expect(result.current.fromCurrency).toBe("USD");
    expect(result.current.toCurrency).toBe("EUR");
  });

  it("selectTableCurrency sets toCurrency directly without touching pickerTarget", async () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.openPicker("from")); // pickerTarget is "from"
    act(() => result.current.selectTableCurrency("JPY")); // should NOT close picker or change fromCurrency
    expect(result.current.toCurrency).toBe("JPY");
    expect(result.current.pickerTarget).toBe("from"); // pickerTarget unchanged
    expect(result.current.fromCurrency).toBe("USD"); // fromCurrency unchanged
  });
});

// ── toggleTable / setSearch ────────────────────────────────────────────────

describe("useRates — table controls", () => {
  it("toggleTable flips tableExpanded", () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    expect(result.current.tableExpanded).toBe(false);
    act(() => result.current.toggleTable());
    expect(result.current.tableExpanded).toBe(true);
    act(() => result.current.toggleTable());
    expect(result.current.tableExpanded).toBe(false);
  });

  it("setSearch updates search string", () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    act(() => result.current.setSearch("eur"));
    expect(result.current.search).toBe("eur");
  });
});

// ── search filter ──────────────────────────────────────────────────────────

describe("useRates — search filter", () => {
  async function loadedHook() {
    vi.stubGlobal("fetch", makeFetch());
    const hook = renderHook(() => useRates());
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    return hook;
  }

  it("returns all currencies except fromCurrency when search is empty", async () => {
    const { result } = await loadedHook();
    expect(result.current.currencies).toHaveLength(3);
    expect(result.current.currencies.map((c) => c.code)).not.toContain("USD");
  });

  it("filters by currency code, case-insensitive", async () => {
    const { result } = await loadedHook();
    act(() => result.current.setSearch("eur"));
    expect(result.current.currencies).toHaveLength(1);
    expect(result.current.currencies[0].code).toBe("EUR");
  });

  it("filters by currency name, case-insensitive", async () => {
    const { result } = await loadedHook();
    act(() => result.current.setSearch("pound"));
    expect(result.current.currencies).toHaveLength(1);
    expect(result.current.currencies[0].code).toBe("GBP");
  });

  it("returns empty array when no match", async () => {
    const { result } = await loadedHook();
    act(() => result.current.setSearch("zzz"));
    expect(result.current.currencies).toHaveLength(0);
  });

  it("excludes fromCurrency regardless of search", async () => {
    const { result } = await loadedHook();
    act(() => result.current.setSearch("dollar"));
    expect(result.current.currencies.map((c) => c.code)).not.toContain("USD");
  });
});

// ── retry ──────────────────────────────────────────────────────────────────

describe("useRates — retry", () => {
  it("clears error and re-fetches on retry", async () => {
    let callCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn((url) => {
        if (url.includes("/currencies"))
          return Promise.resolve({
            json: () => Promise.resolve(MOCK_CURRENCIES),
          });
        callCount++;
        if (callCount === 1) return Promise.reject(new Error("Network error"));
        return Promise.resolve({ json: () => Promise.resolve(MOCK_RATES_USD) });
      }),
    );
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.error).toBeTruthy());

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.rates).toEqual(MOCK_RATES_USD.rates);
  });
});
