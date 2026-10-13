import { MAX_HOURS } from '../data/studioData'

// This component has NO state of its own. The parent owns the number and
// passes it down as `value`. When a button is clicked we don't change anything
// here, we call onChange(newValue) and the parent updates its state, which
// re-renders this component with the new `value`.
//
//   parent:  const [hours, setHours] = useState(1)
//            <HoursStepper value={hours} onChange={setHours} label="Portraits" />
//
// The same component is reused on every service card and on every basket line.
export default function HoursStepper({ value, onChange, label, min = 1, max = MAX_HOURS }) {
  const buttonClasses =
    'flex size-9 items-center justify-center rounded-full text-lg leading-none transition hover:bg-clay disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent'

  return (
    <div role="group" aria-label={`Hours for ${label}`} className="inline-flex items-center rounded-full border border-line">
      <button
        type="button"
        className={buttonClasses}
        aria-label={`Remove one hour of ${label}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        &minus;
      </button>

      <span className="min-w-12 text-center text-sm" aria-label={`${value} ${value === 1 ? 'hour' : 'hours'}`}>
        {value} h
      </span>

      <button
        type="button"
        className={buttonClasses}
        aria-label={`Add one hour of ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  )
}