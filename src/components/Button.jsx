// One button style used everywhere. Renders a link if you pass `href`, otherwise a button.
const base =
  'inline-flex items-center justify-center rounded-full border-[1.5px] font-medium transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'

const sizes = {
  md: 'px-7 py-3',
  sm: 'px-5 py-2 text-sm',
}

const variants = {
  primary: 'border-transparent bg-ink text-cream hover:bg-ember',
  ghost: 'border-ink text-ink hover:bg-ink hover:text-cream',
  light: 'border-transparent bg-cream text-ink hover:bg-gold',
  ghostLight: 'border-cream text-cream hover:bg-cream hover:text-ink',
}

export default function Button({ variant = 'primary', size = 'md', href, className = '', children, ...props }) {
  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}