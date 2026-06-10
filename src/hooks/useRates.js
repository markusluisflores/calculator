import { useState, useEffect, useMemo } from "react";

const CURRENCIES_URL = "https://api.frankfurter.dev/v1/currencies";
const ratesUrl = (base) => `https://api.frankfurter.dev/v1/latest?base=${base}`;

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
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState("");
  const [pickerTarget, setPickerTarget] = useState(null);
  const [tableExpanded, setTableExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

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
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (ratesCache[fromCurrency]) {
      setRates(ratesCache[fromCurrency].rates);
      setRateDate(ratesCache[fromCurrency].date);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(ratesUrl(fromCurrency), { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        ratesCache[fromCurrency] = data;
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
  }, [fromCurrency, retryCount]);

  const result = useMemo(() => {
    if (rates[toCurrency] == null) return "—";
    return (parseFloat(amount || "0") * rates[toCurrency]).toFixed(2);
  }, [amount, toCurrency, rates]);

  const currencies = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allCurrencies.filter(
      (c) =>
        c.code !== fromCurrency &&
        (q === "" ||
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q)),
    );
  }, [allCurrencies, search, fromCurrency]);

  const pressDigit = (digit) => {
    setAmount((prev) => {
      if (prev === "" && digit === "0") return prev;
      const dotIdx = prev.indexOf(".");
      const intDigits = dotIdx === -1 ? prev.length : dotIdx;
      if (dotIdx === -1 && intDigits >= 10) return prev;
      if (dotIdx !== -1 && prev.length - dotIdx > 2) return prev;
      return prev + digit;
    });
  };

  const pressDecimal = () => {
    setAmount((prev) => (prev.includes(".") ? prev : prev + "."));
  };

  const pressBackspace = () => {
    setAmount((prev) => (prev.length <= 1 ? "" : prev.slice(0, -1)));
  };

  const swap = () => {
    const swapAmount = result === "—" || parseFloat(result) === 0 ? "" : result;
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount(swapAmount);
  };

  const selectCurrency = (code) => {
    if (pickerTarget === "from") setFromCurrency(code);
    else if (pickerTarget === "to") setToCurrency(code);
    setPickerTarget(null);
  };

  const openPicker = (target) => setPickerTarget(target);
  const closePicker = () => setPickerTarget(null);
  const toggleTable = () => setTableExpanded((v) => !v);

  const retry = () => {
    delete ratesCache[fromCurrency];
    setRetryCount((c) => c + 1);
  };

  const selectTableCurrency = (code) => setToCurrency(code);

  return {
    rates,
    currencies,
    allCurrencies,
    rateDate,
    fromCurrency,
    toCurrency,
    amount,
    result,
    pickerTarget,
    tableExpanded,
    search,
    loading,
    error,
    pressDigit,
    pressDecimal,
    pressBackspace,
    swap,
    selectCurrency,
    openPicker,
    closePicker,
    toggleTable,
    setSearch,
    selectTableCurrency,
    retry,
  };
}
