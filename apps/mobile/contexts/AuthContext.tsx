import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { tokenStorage, userStorage } from '../utils/storage';
import { TOKEN_EXPIRATION_TIME } from '../constants/config';
import { setOnUnauthorized } from '../services/api';
import { LoadingScreen } from '../components/LoadingScreen';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: User) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (userData: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(async () => {
        await tokenStorage.removeToken();
        await tokenStorage.removeExpiration();
        await userStorage.removeUser();
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    useEffect(() => {
        async function validateStoredToken() {
            try {
                const token = await tokenStorage.getToken();
                const expiration = await tokenStorage.getExpiration();

                if (token && expiration) {
                    const expirationTime = parseInt(expiration, 10);
                    if (Date.now() < expirationTime) {
                        const storedUser = await userStorage.getUser();
                        if (storedUser) {
                            setUser(storedUser);
                            setIsAuthenticated(true);
                        } else {
                            await tokenStorage.removeToken();
                            await tokenStorage.removeExpiration();
                            setIsAuthenticated(false);
                        }
                    } else {
                        // Token expired
                        await tokenStorage.removeToken();
                        await tokenStorage.removeExpiration();
                        await userStorage.removeUser();
                        setIsAuthenticated(false);
                    }
                } else {
                    setIsAuthenticated(false);
                }
            } catch {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        }

        validateStoredToken();
    }, []);

    // Connect the 401 unauthorized handler to logout
    useEffect(() => {
        setOnUnauthorized(logout);
    }, [logout]);

    const login = useCallback(async (token: string, userData: User) => {
        await tokenStorage.setToken(token);
        const expiration = Date.now() + TOKEN_EXPIRATION_TIME;
        await tokenStorage.setExpiration(expiration.toString());
        await userStorage.setUser(userData);
        setUser(userData);
        setIsAuthenticated(true);
    }, []);

    const updateUser = useCallback(async (userData: User) => {
        await userStorage.setUser(userData);
        setUser(userData);
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
