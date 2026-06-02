import Button from './Button'

const BUTTONS = [
  { label: 'AC',  variant: 'utility' },
  { label: '+/−', variant: 'utility' },
  { label: '%',   variant: 'utility' },
  { label: '÷',   variant: 'operator' },
  { label: '7',   variant: 'digit' },
  { label: '8',   variant: 'digit' },
  { label: '9',   variant: 'digit' },
  { label: '×',   variant: 'operator' },
  { label: '4',   variant: 'digit' },
  { label: '5',   variant: 'digit' },
  { label: '6',   variant: 'digit' },
  { label: '−',   variant: 'operator' },
  { label: '1',   variant: 'digit' },
  { label: '2',   variant: 'digit' },
  { label: '3',   variant: 'digit' },
  { label: '+',   variant: 'operator' },
  { label: '0',   variant: 'digit', span: 2 },
  { label: '.',   variant: 'digit' },
  { label: '=',   variant: 'operator' },
]

export default function ButtonGrid({ onButton }) {
  return (
    <div className="button-grid">
      {BUTTONS.map(btn => (
        <Button
          key={btn.label}
          label={btn.label}
          variant={btn.variant}
          span={btn.span}
          onPress={onButton}
        />
      ))}
    </div>
  )
}
