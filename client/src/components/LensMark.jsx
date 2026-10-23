// Small camera-lens mark shown next to the studio name (header and footer).
// On hover the inner ring shrinks, like a lens aperture closing (the parent link needs the `group` class).
export default function LensMark({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <circle
        cx="12"
        cy="12"
        r="4"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        className="transition-transform duration-500 group-hover:scale-50 motion-reduce:transition-none"
      />
    </svg>
  )
}
