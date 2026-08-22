import axios, { AxiosInstance } from 'axios';

export interface StorageAdapter {
    getToken: () => Promise<string | null> | string | null;
    removeToken: () => Promise<void> | void;
    removeUser: () => Promise<void> | void;
}

export interface ApiClientConfig {
    baseURL: string;
    timeout?: number;
    storage: StorageAdapter;
    onUnauthorized?: () => void;
}

export function createApiClient(config: ApiClientConfig): AxiosInstance {
    const instance = axios.create({
        baseURL: config.baseURL,
        timeout: config.timeout ?? 15000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        withCredentials: false,
    });

    instance.interceptors.request.use(
        async (reqConfig) => {
            const token = await config.storage.getToken();
            if (token) {
                reqConfig.headers.Authorization = `Bearer ${token}`;
            }
            return reqConfig;
        },
        (error) => {
            console.error('Interceptor request error:', error);
            return Promise.reject(error);
        }
    );

    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            console.error('API Error Response:', error);

            const isAuthRequest = error.config?.url?.includes('/auth/');

            if (error.response && error.response.status === 401 && !isAuthRequest) {
                await config.storage.removeToken();
                await config.storage.removeUser();
                config.onUnauthorized?.();
            }

            return Promise.reject(error);
        }
    );

    return instance;
}
