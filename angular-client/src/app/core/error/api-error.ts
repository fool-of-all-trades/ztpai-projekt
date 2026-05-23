export interface ApiErrorResponse {
  message?: string;
  validationErrors?: Record<string, string>;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const body = (error as { error?: ApiErrorResponse }).error;
    if (body?.message) {
      return body.message;
    }
  }

  return fallback;
}
