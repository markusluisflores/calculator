export default function RatesTable({
  currencies,
  rates,
  from,
  search,
  loading,
  error,
  setSearch,
  retry,
}) {
  return (
    <div>
      <div className="rates-section-label">EXCHANGE RATES (base: {from})</div>

      {error ? (
        <div className="rates-error">
          <p className="rates-error__msg">{error}</p>
          <button type="button" className="rates-retry" onClick={retry}>
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
              onChange={(e) => setSearch(e.target.value)}
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
                <div key={c.code} className="rates-row-item">
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
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
