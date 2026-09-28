import axios from "axios";

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8180',
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    // Adding withCredentials can help with CORS issues in some cases
    withCredentials: false
  });

  // Interceptor para adicionar o token JWT aos headers
  instance.interceptors.request.use(
    config => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    error => {
      console.error('Interceptor request error:', error);
      return Promise.reject(error);
    }
  );

  // Interceptor para tratar erros de resposta
  instance.interceptors.response.use(
    response => response,
    error => {
      if (error.response) {
        console.error(`[API ${error.response.status}] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          payload: error.config?.data,
          body: error.response.data,
        });
      } else {
        console.error(`[API] ${error.config?.method?.toUpperCase()} ${error.config?.url} falhou sem resposta`, {
          code: error.code,
          message: error.message,
        });
      }
      
      // Se receber 401 (Unauthorized), limpar dados e redirecionar para login
      // EXCETO se for em rotas de autenticação (para permitir mostrar mensagem de erro)
      const isAuthRequest = error.config?.url?.includes('/auth/');
      
      if (error.response && error.response.status === 401 && typeof window !== 'undefined' && !isAuthRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Usar replace para não adicionar à história do navegador
        window.location.replace('/login');
      }
      
      return Promise.reject(error);
    }
  );

export default instance;