export default function RatesDisplay({
  fromCurrency,
  toCurrency,
  amount,
  result,
  rateDate,
  rates,
  loading,
  onSwap,
  onOpenFromPicker,
  onOpenToPicker,
}) {
  return (
    <div className="rates-display">
      <div className="rates-currency-row">
        <span className="rates-currency-amount">{amount || "0"}</span>
        <button
          type="button"
          className="rates-currency-btn"
          onClick={onOpenFromPicker}
          aria-label={`Change from currency, currently ${fromCurrency}`}
        >
          {fromCurrency} ▾
        </button>
      </div>

      <div className="rates-swap-row">
        <button
          type="button"
          className="rates-swap"
          onClick={onSwap}
          aria-label="Swap currencies"
        >
          ⇅
        </button>
      </div>

      <div className="rates-currency-row rates-currency-row--result">
        <span className="rates-currency-result">{loading ? "—" : result}</span>
        <button
          type="button"
          className="rates-currency-btn"
          onClick={onOpenToPicker}
          aria-label={`Change to currency, currently ${toCurrency}`}
        >
          {toCurrency} ▾
        </button>
      </div>

      {!loading && rateDate && rates[toCurrency] != null && (
        <div className="rates-hint">
          1 {fromCurrency} ={" "}
          {rates[toCurrency].toLocaleString(undefined, {
            maximumFractionDigits: 4,
          })}{" "}
          {toCurrency} · {rateDate}
        </div>
      )}
    </div>
  );
}
