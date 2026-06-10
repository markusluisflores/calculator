const ROWS = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  [".", "0", "⌫"],
];

export default function RatesNumpad({ onDigit, onDecimal, onBackspace }) {
  const handlePress = (label) => {
    if (label === "⌫") onBackspace();
    else if (label === ".") onDecimal();
    else onDigit(label);
  };

  return (
    <div className="rates-numpad">
      {ROWS.flat().map((label) => (
        <button
          key={label}
          type="button"
          className={`btn ${label === "⌫" ? "btn--utility" : "btn--digit"}`}
          onClick={() => handlePress(label)}
          aria-label={label === "⌫" ? "Backspace" : label}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
