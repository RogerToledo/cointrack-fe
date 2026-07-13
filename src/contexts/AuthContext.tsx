import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Tempo de expiração do token em milissegundos (24 horas)
  const TOKEN_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

  // Função para verificar se o token expirou
  const isTokenExpired = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const expirationTime = localStorage.getItem('tokenExpiration');
    if (!expirationTime) return true;
    
    return Date.now() > parseInt(expirationTime);
  };

  useEffect(() => {
    // Verificar se está no browser
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    // Verificar se há um token armazenado ao carregar a aplicação
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData && userData !== 'undefined' && userData !== 'null') {
      // Verificar se o token expirou
      if (isTokenExpired()) {
        console.log('Token expirado. Fazendo logout...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiration');
        setIsLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && typeof parsedUser === 'object') {
          setUser(parsedUser);
        } else {
          // Limpar dados inválidos
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('tokenExpiration');
        }
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiration');
      }
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiration');
    }
    setUser(null);
    router.replace('/login');
  }, [router]);

  // Verificar expiração do token periodicamente
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      if (isTokenExpired()) {
        console.log('Token expirado. Fazendo logout automático...');
        logout();
      }
    }, 60000); // Verificar a cada 1 minuto

    return () => clearInterval(interval);
  }, [user, logout]);

  const login = (token: string, userData: User) => {
    if (typeof window !== 'undefined') {
      const expirationTime = Date.now() + TOKEN_EXPIRATION_TIME;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tokenExpiration', expirationTime.toString());
    }
    setUser(userData);
  };

  const updateUser = (userData: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setUser(userData);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
