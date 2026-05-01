import { isAxiosError } from "axios";
import { toast } from "sonner";

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Extract a human-readable error message from an Axios error.
 * Toasts it automatically.
 */
export function useApiError() {
  function handleError(error: unknown, fallback = "Une erreur s'est produite") {
    if (!isAxiosError(error)) {
      toast.error(fallback);
      return fallback;
    }

    const data = error.response?.data as ApiError | undefined;
    const message = data?.message ?? fallback;

    if (data?.errors) {
      // Show first validation error
      const first = Object.values(data.errors)[0]?.[0];
      toast.error(first ?? message);
      return first ?? message;
    }

    toast.error(message);
    return message;
  }

  return { handleError };
}
