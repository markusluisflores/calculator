import Display from "./Display";
import ScientificButtonGrid from "./ScientificButtonGrid";
import ButtonGrid from "./ButtonGrid";
import useScientificCalculator from "../hooks/useScientificCalculator";

export default function ScientificCalculator() {
  const { expression, result, angleMode, isSecond, handleButton } =
    useScientificCalculator();

  const badge = (
    <button
      type="button"
      className="deg-rad-pill"
      onClick={() => handleButton("DEG/RAD")}
      aria-label={`Angle mode: ${angleMode}. Tap to switch.`}
    >
      <span
        className={`deg-rad-pill__seg${angleMode === "DEG" ? " deg-rad-pill__seg--active" : ""}`}
      >
        DEG
      </span>
      <span
        className={`deg-rad-pill__seg${angleMode === "RAD" ? " deg-rad-pill__seg--active" : ""}`}
      >
        RAD
      </span>
    </button>
  );

  return (
    <div className="calculator">
      <Display expression={expression} result={result} badge={badge} />
      <ScientificButtonGrid onButton={handleButton} isSecond={isSecond} />
      <ButtonGrid onButton={handleButton} />
    </div>
  );
}
