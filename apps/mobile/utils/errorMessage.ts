import axios from 'axios';

/**
 * Extracts a user-friendly error message from various error types.
 * Handles AxiosError (response data message), network errors (no response),
 * generic Error instances, and unknown error types.
 */
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return typeof error.response.data.message === 'string'
        ? error.response.data.message
        : fallback;
    }
    if (!error.response) {
      return 'Sem conexão com o servidor. Verifique sua internet.';
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
