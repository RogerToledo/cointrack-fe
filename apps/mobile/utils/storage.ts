import * as SecureStore from 'expo-secure-store';

export const secureStorageAdapter = {
    getToken: () => SecureStore.getItemAsync('token'),
    removeToken: () => SecureStore.deleteItemAsync('token'),
    removeUser: () => SecureStore.deleteItemAsync('user'),
};

export const tokenStorage = {
    getToken: () => SecureStore.getItemAsync('token'),
    setToken: (token: string) => SecureStore.setItemAsync('token', token),
    removeToken: () => SecureStore.deleteItemAsync('token'),
    getExpiration: () => SecureStore.getItemAsync('tokenExpiration'),
    setExpiration: (timestamp: string) => SecureStore.setItemAsync('tokenExpiration', timestamp),
    removeExpiration: () => SecureStore.deleteItemAsync('tokenExpiration'),
};

export const userStorage = {
    getUser: async () => {
        const data = await SecureStore.getItemAsync('user');
        return data ? JSON.parse(data) : null;
    },
    setUser: (user: object) => SecureStore.setItemAsync('user', JSON.stringify(user)),
    removeUser: () => SecureStore.deleteItemAsync('user'),
};
