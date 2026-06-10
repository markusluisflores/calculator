export default function RatesTable({
  currencies,
  rates,
  fromCurrency,
  search,
  expanded,
  loading,
  error,
  onToggle,
  onSelectCurrency,
  onSearchChange,
  onRetry,
}) {
  return (
    <div className="rates-table">
      <button
        type="button"
        className="rates-table-header"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="rates-table-header__label">
          EXCHANGE RATES (base: {fromCurrency})
        </span>
        <span
          className={`rates-table-header__chevron${expanded ? " rates-table-header__chevron--open" : ""}`}
        >
          ›
        </span>
      </button>

      {expanded && (
        <div className="rates-table-body">
          {error ? (
            <div className="rates-error">
              <p className="rates-error__msg">{error}</p>
              <button type="button" className="rates-retry" onClick={onRetry}>
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="rates-search-row">
                <input
                  className="rates-search-input"
                  type="text"
                  placeholder="Search currencies…"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  aria-label="Search currencies"
                />
              </div>
              <div className="rates-list">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="rates-skeleton" />
                  ))
                ) : currencies.length === 0 ? (
                  <div className="rates-empty">No currencies found</div>
                ) : (
                  currencies.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      className="rates-row-item"
                      onClick={() => onSelectCurrency(c.code)}
                    >
                      <div className="rates-row-left">
                        <span className="rates-code">{c.code}</span>
                        {c.name && <span className="rates-name">{c.name}</span>}
                      </div>
                      <span className="rates-value">
                        {rates[c.code] != null
                          ? rates[c.code].toLocaleString(undefined, {
                              maximumFractionDigits: 4,
                            })
                          : "—"}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
