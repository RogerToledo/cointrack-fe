import { AxiosInstance } from 'axios';
import { AuthResponse, LoginCredentials, RegisterData, UserResponse } from '@cointrack/types';

export function createAuthService(client: AxiosInstance) {
    return {
        login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
            const response = await client.post('/v1/auth/login', credentials);
            return response.data;
        },

        register: async (data: RegisterData): Promise<AuthResponse> => {
            const response = await client.post('/v1/auth/register', data);
            return response.data;
        },

        forgotPassword: async (email: string): Promise<{ message: string }> => {
            const response = await client.post('/v1/auth/forgot-password', { email });
            return response.data;
        },

        resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
            const response = await client.post('/v1/auth/reset-password', { token, password });
            return response.data;
        },

        getProfile: async (): Promise<UserResponse> => {
            const response = await client.get('/v1/auth/profile');
            return response.data;
        },

        updateProfile: async (data: { name?: string; email?: string }): Promise<UserResponse> => {
            const response = await client.put('/v1/auth/profile', data);
            return response.data;
        },

        updatePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
            const response = await client.put('/v1/auth/password', { currentPassword, newPassword });
            return response.data;
        },
    };
}
