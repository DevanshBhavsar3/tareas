type ButtonProps = React.ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const base =
  'cursor-pointer rounded-full flex gap-2 items-center justify-center'
const primaryVariant =
  'bg-(--bg-secondary) text-(--text-secondary) transition-all hover:bg-(--bg-secondary)/80'
const secondaryVariant = 'border border-(--border-color) text-(--text-muted) '
const iconVariant = 'border border-(--border-color) p-1.5'

const smSize = 'text-sm px-2.5 py-1'
const mdSize = 'text-md px-3.5 py-1.5'
const lgSize = 'text-lg px-5 py-2'

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
          ${base} 
          ${variant === 'primary' ? primaryVariant : variant === 'secondary' ? secondaryVariant : iconVariant} 
          ${size === 'sm' ? smSize : size === 'md' ? mdSize : lgSize} 
          ${className}
        `}
      {...props}
    >
      {props.children}
    </button>
  )
}
