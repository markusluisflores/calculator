import useRates from "../hooks/useRates";
import RatesDisplay from "./RatesDisplay";
import RatesNumpad from "./RatesNumpad";
import RatesTable from "./RatesTable";
import CurrencyPickerModal from "./CurrencyPickerModal";

export default function RatesCalculator() {
  const {
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
    selectTableCurrency,
    setSearch,
    retry,
  } = useRates();

  const selectedCode = pickerTarget === "from" ? fromCurrency : toCurrency;

  return (
    <div className="rates-calculator">
      <RatesDisplay
        fromCurrency={fromCurrency}
        toCurrency={toCurrency}
        amount={amount}
        result={result}
        rateDate={rateDate}
        rates={rates}
        loading={loading}
        onSwap={swap}
        onOpenFromPicker={() => openPicker("from")}
        onOpenToPicker={() => openPicker("to")}
      />

      <RatesNumpad
        onDigit={pressDigit}
        onDecimal={pressDecimal}
        onBackspace={pressBackspace}
      />

      <RatesTable
        currencies={currencies}
        rates={rates}
        fromCurrency={fromCurrency}
        search={search}
        expanded={tableExpanded}
        loading={loading}
        error={error}
        onToggle={toggleTable}
        onSelectCurrency={selectTableCurrency}
        onSearchChange={setSearch}
        onRetry={retry}
      />

      <CurrencyPickerModal
        isOpen={pickerTarget !== null}
        selectedCode={selectedCode}
        currencies={allCurrencies}
        onSelect={selectCurrency}
        onClose={closePicker}
      />
    </div>
  );
}
