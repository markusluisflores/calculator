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

  it("populates currencies from API with code and name", async () => {
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

  it("defaults to from=USD, to=EUR, amount=1", () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    expect(result.current.from).toBe("USD");
    expect(result.current.to).toBe("EUR");
    expect(result.current.amount).toBe("1");
  });
});

describe("useRates — error states", () => {
  it("sets error when rates fetch fails", async () => {
    vi.stubGlobal("fetch", makeFetch({ rates: false }));
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/Could not fetch rates/);
  });

  it("falls back to empty currencies when currencies fetch fails, rates still load", async () => {
    vi.stubGlobal("fetch", makeFetch({ currencies: false }));
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.allCurrencies).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.rates).toEqual(MOCK_RATES_USD.rates);
  });
});

describe("useRates — from change and session cache", () => {
  it("fetches new rates when from changes", async () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setFrom("EUR"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.rates).toEqual(MOCK_RATES_EUR.rates);
    expect(result.current.from).toBe("EUR");
  });

  it("uses the session cache on second visit to same base — no extra fetch", async () => {
    const mockFn = makeFetch();
    vi.stubGlobal("fetch", mockFn);
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setFrom("EUR"));
    await waitFor(() =>
      expect(result.current.rates).toEqual(MOCK_RATES_EUR.rates),
    );

    act(() => result.current.setFrom("USD"));
    await waitFor(() =>
      expect(result.current.rates).toEqual(MOCK_RATES_USD.rates),
    );

    const usdFetches = mockFn.mock.calls.filter(([url]) =>
      url.includes("from=USD"),
    );
    expect(usdFetches).toHaveLength(1); // only the initial mount fetch
  });

  it("does not re-fetch currencies when from changes", async () => {
    const mockFn = makeFetch();
    vi.stubGlobal("fetch", mockFn);
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setFrom("EUR"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const currFetches = mockFn.mock.calls.filter(([url]) =>
      url.includes("/currencies"),
    );
    expect(currFetches).toHaveLength(1);
  });
});

describe("useRates — conversion", () => {
  async function loadedHook() {
    vi.stubGlobal("fetch", makeFetch());
    const hook = renderHook(() => useRates());
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    return hook;
  }

  it("computes result as amount × rates[to]", async () => {
    const { result } = await loadedHook();
    act(() => result.current.setAmount("100"));
    const expected = (100 * 0.9214).toLocaleString(undefined, {
      maximumFractionDigits: 4,
    });
    expect(result.current.result).toBe(expected);
  });

  it("shows '—' when amount is empty", async () => {
    const { result } = await loadedHook();
    act(() => result.current.setAmount(""));
    expect(result.current.result).toBe("—");
  });

  it("shows '—' when amount is non-numeric", async () => {
    const { result } = await loadedHook();
    act(() => result.current.setAmount("abc"));
    expect(result.current.result).toBe("—");
  });

  it("shows '—' when to equals from (base not in API response)", async () => {
    const { result } = await loadedHook();
    act(() => result.current.setTo("USD")); // from is already USD; rates[USD] is undefined
    expect(result.current.result).toBe("—");
  });
});

describe("useRates — swap", () => {
  it("exchanges from and to", async () => {
    vi.stubGlobal("fetch", makeFetch());
    const { result } = renderHook(() => useRates());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.from).toBe("USD");
    expect(result.current.to).toBe("EUR");
    act(() => result.current.swap());
    expect(result.current.from).toBe("EUR");
    expect(result.current.to).toBe("USD");
  });
});

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

describe("useRates — search filter", () => {
  async function loadedHook() {
    vi.stubGlobal("fetch", makeFetch());
    const hook = renderHook(() => useRates());
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    return hook;
  }

  it("returns all currencies except from when search is empty", async () => {
    const { result } = await loadedHook(); // from=USD, 4 mock currencies → 3 shown
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

  it("excludes the base currency regardless of search", async () => {
    const { result } = await loadedHook();
    act(() => result.current.setSearch("dollar")); // matches "US Dollar" (USD)
    expect(result.current.currencies.map((c) => c.code)).not.toContain("USD");
  });
});
