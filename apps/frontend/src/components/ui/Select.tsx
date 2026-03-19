import { ChevronDown } from 'lucide-react'
import { forwardRef } from 'react'

type SelectOption = {
  value: string
  label: string
}

type SelectProps = Omit<React.ComponentProps<'select'>, 'children'> & {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-(--text-primary)">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`w-full appearance-none rounded-lg border border-(--border-color) bg-(--bg-primary) px-3 py-2 pr-10 text-sm text-(--text-primary) transition-colors focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted)"
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  },
)

Select.displayName = 'Select'

export default Select
