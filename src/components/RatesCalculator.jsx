import useRates from "../hooks/useRates";
import RatesConverter from "./RatesConverter";
import RatesTable from "./RatesTable";

export default function RatesCalculator() {
  const {
    rates,
    currencies,
    allCurrencies,
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
  } = useRates();

  return (
    <div className="rates-calculator">
      <RatesConverter
        from={from}
        to={to}
        amount={amount}
        result={result}
        rateDate={rateDate}
        rates={rates}
        allCurrencies={allCurrencies}
        loading={loading}
        setFrom={setFrom}
        setTo={setTo}
        setAmount={setAmount}
        swap={swap}
      />
      <div className="rates-divider" />
      <RatesTable
        currencies={currencies}
        rates={rates}
        from={from}
        search={search}
        loading={loading}
        error={error}
        setSearch={setSearch}
        retry={retry}
      />
    </div>
  );
}
