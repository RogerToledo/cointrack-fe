import axios from 'axios';

const FALLBACK_MESSAGE = 'Ocorreu um erro inesperado.';

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

export function extractErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const { response } = error;

        if (!response) {
            return error.code === 'ERR_NETWORK'
                ? 'Não foi possível conectar à API. Verifique se o backend está no ar.'
                : error.message || FALLBACK_MESSAGE;
        }

        const { status, data } = response;

        if (typeof data === 'string') {
            return fromString(data) || `Erro ${status} na requisição.`;
        }

        if (data && typeof data === 'object') {
            const message = (data as { message?: unknown }).message;

            if (typeof message === 'string' && message.trim()) {
                return truncate(message);
            }

            if (Array.isArray(message) && message.length > 0) {
                return truncate(message.map(String).join('; '));
            }

            return `Erro ${status} na requisição.`;
        }

        return `Erro ${status} na requisição.`;
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return FALLBACK_MESSAGE;
}

export function logApiError(context: string, error: unknown): void {
    if (!axios.isAxiosError(error)) {
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
