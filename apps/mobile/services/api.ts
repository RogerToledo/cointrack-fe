import { createApiClient, createAuthService, createDashboardService, createCreditCardService } from '@cointrack/services';
import { secureStorageAdapter } from '../utils/storage';
import { API_BASE_URL } from '../constants/config';

let onUnauthorizedCallback: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void) {
    onUnauthorizedCallback = callback;
}

export const apiClient = createApiClient({
    baseURL: API_BASE_URL,
    storage: secureStorageAdapter,
    onUnauthorized: () => onUnauthorizedCallback?.(),
});

export const authService = createAuthService(apiClient);
export const dashboardService = createDashboardService(apiClient);
export const creditCardService = createCreditCardService(apiClient);
