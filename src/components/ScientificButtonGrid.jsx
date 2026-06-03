const ROW1 = [
  { label: "2nd", variant: "second-key" },
  { label: "( )", variant: "sci-utility" },
  { label: "n!", variant: "sci-utility" },
  { label: "⌫", variant: "sci-utility" },
];

const ROW2 = [
  { label: "sin", secondLabel: "sin⁻¹", variant: "scientific" },
  { label: "cos", secondLabel: "cos⁻¹", variant: "scientific" },
  { label: "tan", secondLabel: "tan⁻¹", variant: "scientific" },
  { label: "ln", secondLabel: "log", variant: "scientific" },
];

const ROW3 = [
  { label: "x²", secondLabel: "xʸ", variant: "scientific" },
  { label: "√x", secondLabel: "ˣ√y", variant: "scientific" },
  { label: "π", secondLabel: "e", variant: "scientific" },
  { label: "AC", variant: "sci-utility" },
];

const ALL_BUTTONS = [...ROW1, ...ROW2, ...ROW3];

function ScientificButton({ btn, isSecond, onPress }) {
  const showSecond = isSecond && btn.secondLabel;
  const variant =
    btn.variant === "second-key" && isSecond
      ? "second-key-active"
      : btn.variant;

  return (
    <button
      type="button"
      className={`btn btn--${variant}`}
      onClick={() => onPress(btn.label)}
    >
      {btn.secondLabel ? (
        <span className="sci-btn-content">
          <span
            className={`sci-btn-second${showSecond ? " sci-btn-second--active" : ""}`}
          >
            {btn.secondLabel}
          </span>
          <span className="sci-btn-primary">{btn.label}</span>
        </span>
      ) : (
        btn.label
      )}
    </button>
  );
}

export default function ScientificButtonGrid({ onButton, isSecond }) {
  return (
    <div className="button-grid sci-button-grid">
      {ALL_BUTTONS.map((btn) => (
        <ScientificButton
          key={btn.label}
          btn={btn}
          isSecond={isSecond}
          onPress={onButton}
        />
      ))}
    </div>
  );
}
