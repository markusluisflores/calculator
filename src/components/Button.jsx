export default function Button({
  label,
  variant = "digit",
  span = 1,
  onPress,
}) {
  return (
    <button
      className={`btn btn--${variant}${span > 1 ? ` btn--span-${span}` : ""}`}
      onClick={() => onPress(label)}
    >
      {label}
    </button>
  );
}
