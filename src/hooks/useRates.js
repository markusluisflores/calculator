import { useState, useEffect, useMemo } from "react";

const CURRENCIES_URL = "https://api.frankfurter.app/currencies";
const ratesUrl = (base) => `https://api.frankfurter.app/latest?from=${base}`;

const currenciesCache = { data: null };
const ratesCache = {};

export function __resetCacheForTest() {
  currenciesCache.data = null;
  Object.keys(ratesCache).forEach((k) => delete ratesCache[k]);
}

export default function useRates() {
  const [allCurrencies, setAllCurrencies] = useState([]);
  const [rates, setRates] = useState({});
  const [rateDate, setRateDate] = useState("");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [amount, setAmount] = useState("1");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Currencies — fetch once, cache for session
  useEffect(() => {
    if (currenciesCache.data) {
      setAllCurrencies(currenciesCache.data);
      return;
    }
    fetch(CURRENCIES_URL)
      .then((r) => r.json())
      .then((data) => {
        const list = Object.entries(data).map(([code, name]) => ({
          code,
          name,
        }));
        currenciesCache.data = list;
        setAllCurrencies(list);
      })
      .catch(() => {}); // fallback: allCurrencies stays [], rows show code only
  }, []);

  // Rates — fetch when from changes or retry is requested
  useEffect(() => {
    if (ratesCache[from]) {
      setRates(ratesCache[from].rates);
      setRateDate(ratesCache[from].date);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(ratesUrl(from), { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        ratesCache[from] = data;
        setRates(data.rates);
        setRateDate(data.date);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError("Could not fetch rates. Check your connection and try again.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [from, retryCount]);

  const result = useMemo(() => {
    const n = Number(amount);
    if (!amount || isNaN(n) || rates[to] == null) return "—";
    return (n * rates[to]).toLocaleString(undefined, {
      maximumFractionDigits: 4,
    });
  }, [amount, to, rates]);

  const currencies = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allCurrencies.filter(
      (c) =>
        c.code !== from &&
        (q === "" ||
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q)),
    );
  }, [allCurrencies, search, from]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const retry = () => {
    delete ratesCache[from];
    setRetryCount((c) => c + 1);
  };

  return {
    rates,
    currencies, // filtered by search, excludes from — for rate table
    allCurrencies, // full list — for currency dropdowns
    rateDate,
    from,
    to,
    amount,
    result,
    search,
    loading,
    error,
    setFrom,
    setTo,
    setAmount,
    setSearch,
    swap,
    retry,
  };
}
