export default function Display({ expression, result }) {
  const len = result.length
  const fontSize = Math.max(24, 48 - Math.max(0, len - 9) * 3)

  return (
    <div className="display">
      <div className="display__expression">{expression || ' '}</div>
      <div className="display__result" style={{ fontSize }}>
        {result}
      </div>
    </div>
  )
}
