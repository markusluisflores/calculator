import { useState } from "react";

export default function RatesConverter({
  from,
  to,
  amount,
  result,
  rateDate,
  rates,
  allCurrencies,
  loading,
  setFrom,
  setTo,
  setAmount,
  swap,
}) {
  return (
    <div className="rates-converter">
      <div className="rates-field">
        <span className="rates-label">AMOUNT</span>
        <div className="rates-row">
          <input
            className="rates-input"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-label="Amount to convert"
          />
          <CurrencyDropdown value={from} onChange={setFrom} currencies={allCurrencies} accent />
        </div>
      </div>

      <button type="button" className="rates-swap" onClick={swap} aria-label="Swap currencies">
        ⇅
      </button>

      <div className="rates-field">
        <span className="rates-label">RESULT</span>
        <div className="rates-row">
          <span className="rates-result">{loading ? "—" : result}</span>
          <CurrencyDropdown value={to} onChange={setTo} currencies={allCurrencies} />
        </div>
      </div>

      {!loading && rateDate && rates[to] != null && (
        <div className="rates-hint">
          1 {from} ={" "}
          {rates[to].toLocaleString(undefined, { maximumFractionDigits: 4 })} {to} · {rateDate}
        </div>
      )}
    </div>
  );
}

function CurrencyDropdown({ value, onChange, currencies, accent }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = currencies.filter((c) => {
    const q = search.toLowerCase();
    return (
      q === "" ||
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q)
    );
  });

  const select = (code) => {
    onChange(code);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="currency-dropdown">
      <button
        type="button"
        className={`currency-btn${accent ? " currency-btn--accent" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        {value} ▾
      </button>
      {open && (
        <div className="currency-dropdown__panel">
          <input
            className="currency-search"
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="currency-list">
            {filtered.length === 0 ? (
              <div className="currency-empty">No currencies found</div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  className="currency-option"
                  onClick={() => select(c.code)}
                >
                  <span className="currency-code">{c.code}</span>
                  <span className="currency-name">{c.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
