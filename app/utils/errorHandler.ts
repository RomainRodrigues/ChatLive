/**
 * Centralized error handling for API calls.
 * Displays a toast notification with the error message.
 */
export function handleApiError(error: unknown, fallbackMessage: string): void {
  const toast = useToast()

  let message = fallbackMessage

  if (error && typeof error === 'object') {
    if ('statusMessage' in error && typeof (error as Record<string, unknown>).statusMessage === 'string') {
      // H3/Nitro error format
      message = (error as Record<string, unknown>).statusMessage as string
    } else if ('data' in error) {
      // Fetch error format (ofetch wraps in data.statusMessage)
      const data = (error as Record<string, unknown>).data as Record<string, unknown> | undefined
      if (data && typeof data.statusMessage === 'string') {
        message = data.statusMessage
      }
    } else if ('message' in error && typeof (error as Error).message === 'string') {
      // Standard Error
      message = (error as Error).message
    }
  }

  toast.add({
    title: 'Erreur',
    description: message,
    color: 'error'
  })

  console.error(`[API Error] ${message}`, error)
}
