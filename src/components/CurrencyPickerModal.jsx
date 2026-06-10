import { useState, useEffect, useRef } from "react";

export default function CurrencyPickerModal({
  isOpen,
  selectedCode,
  currencies,
  onSelect,
  onClose,
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered =
    query.trim() === ""
      ? currencies
      : currencies.filter((c) => {
          const q = query.toLowerCase();
          return (
            c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
          );
        });

  return (
    <div
      className="picker-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Select currency"
    >
      <div className="picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="picker-header">
          <span className="picker-title">Select Currency</span>
          <button
            type="button"
            className="picker-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <input
          ref={inputRef}
          className="picker-search"
          type="text"
          placeholder="Search currencies…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search currencies"
        />

        <div className="picker-list">
          {filtered.length === 0 ? (
            <div className="picker-empty">No currencies found</div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                className={`picker-item${c.code === selectedCode ? " picker-item--selected" : ""}`}
                onClick={() => onSelect(c.code)}
              >
                <span className="picker-item-code">{c.code}</span>
                <span className="picker-item-name">{c.name}</span>
                {c.code === selectedCode && (
                  <span className="picker-item-check" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
