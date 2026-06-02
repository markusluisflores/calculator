import useCalculator from "../hooks/useCalculator";
import Display from "./Display";
import ButtonGrid from "./ButtonGrid";

export default function BasicCalculator() {
  const { expression, result, handleButton } = useCalculator();

  return (
    <div className="calculator">
      <Display expression={expression} result={result} />
      <ButtonGrid onButton={handleButton} />
    </div>
  );
}
