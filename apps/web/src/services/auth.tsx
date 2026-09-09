import api from './config';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  level?: string;
}

interface AuthResponse {
  statusCode: number;
  message: {
    token: string;
  };
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
}

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/v1/auth/login', credentials);
    return response.data;
  },

  // Registro
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/v1/auth/register', data);
    return response.data;
  },

  // Recuperação de senha
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/v1/auth/forgot-password', { email });
    return response.data;
  },

  // Reset de senha
  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await api.post('/v1/auth/reset-password', { token, password });
    return response.data;
  },

  // Obter perfil do usuário
  getProfile: async (): Promise<UserResponse> => {
    const response = await api.get('/v1/auth/profile');
    return response.data;
  },

  // Atualizar perfil
  updateProfile: async (data: { name?: string; email?: string }): Promise<UserResponse> => {
    const response = await api.put('/v1/auth/profile', data);
    return response.data;
  },

  // Atualizar senha
  updatePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.put('/v1/auth/password', { currentPassword, newPassword });
    return response.data;
  },
};

export default authService;
