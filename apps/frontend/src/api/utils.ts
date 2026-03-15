import { toast } from 'sonner'

export const showApiErrorToast = (error: unknown, fallbackMessage: string) => {
  const message =
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
      ? error.message
      : fallbackMessage

  toast.error(message)
}
