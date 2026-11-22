const DEFAULT_FALLBACK = 'Ocorreu um erro inesperado.';

interface AxiosLikeError {
  isAxiosError?: boolean;
  code?: string;
  message?: string;
  config?: {
    url?: string;
    method?: string;
    data?: unknown;
  };
  response?: {
    status?: number;
    data?: unknown;
  };
}

function isAxiosLikeError(error: unknown): error is AxiosLikeError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('isAxiosError' in error || 'response' in error)
  );
}

function truncate(value: string, max = 300): string {
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
}

function fromString(body: string): string | null {
  if (!body.trim()) return null;

  if (body.trimStart().startsWith('<')) {
    return 'O servidor retornou uma página de erro em vez de JSON. Verifique o status da API.';
  }

  return truncate(body);
}

export function extractErrorMessage(
  error: unknown,
  fallback: string = DEFAULT_FALLBACK
): string {
  if (isAxiosLikeError(error) && (error.isAxiosError || error.response)) {
    const { response } = error;

    if (!response) {
      return error.code === 'ERR_NETWORK'
        ? 'Não foi possível conectar à API. Verifique se o backend está no ar.'
        : error.message || fallback;
    }

    const { status, data } = response;

    if (typeof data === 'string') {
      return fromString(data) || `Erro ${status ?? ''} na requisição.`.trim();
    }

    if (data && typeof data === 'object') {
      const message = (data as { message?: unknown }).message;

      if (typeof message === 'string' && message.trim()) {
        return truncate(message);
      }

      if (Array.isArray(message) && message.length > 0) {
        return truncate(message.map(String).join('; '));
      }

      return status ? `Erro ${status} na requisição.` : fallback;
    }

    return status ? `Erro ${status} na requisição.` : fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function logApiError(context: string, error: unknown): void {
  if (!isAxiosLikeError(error)) {
    console.error(`[${context}]`, error);
    return;
  }

  const { config, response } = error;
  console.error(`[${context}]`, {
    url: config?.url,
    method: config?.method,
    payload: config?.data,
    status: response?.status,
    body: response?.data,
  });
}
