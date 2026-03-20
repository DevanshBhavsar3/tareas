import { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export const showApiErrorToast = (error: unknown, fallbackMessage: string) => {
  let message = fallbackMessage

  if (error instanceof AxiosError) {
    // Try to get error message from API response
    const responseMessage = error.response?.data?.message
    if (responseMessage && typeof responseMessage === 'string') {
      message = responseMessage
    }
  }

  toast.error(message)
}

export function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
