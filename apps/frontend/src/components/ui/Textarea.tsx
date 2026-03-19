import { forwardRef } from 'react'

type TextareaProps = React.ComponentProps<'textarea'> & {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-(--text-primary)">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full rounded-lg border border-(--border-color) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary) placeholder:text-(--text-tertiary) transition-colors focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'

export default Textarea
