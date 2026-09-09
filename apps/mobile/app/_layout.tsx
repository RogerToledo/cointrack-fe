import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { FamilyProvider } from '../contexts/FamilyContext';
import { ToastProvider } from '../contexts/ToastContext';
import { LoadingScreen } from '../components/LoadingScreen';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <AuthProvider>
                    <ToastProvider>
                        <FamilyProvider>
                            <RootNavigator />
                        </FamilyProvider>
                    </ToastProvider>
                </AuthProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

function RootNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <LoadingScreen />;

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
                <Stack.Screen name="(tabs)" />
            ) : (
                <Stack.Screen name="(auth)" />
            )}
        </Stack>
    );
}
