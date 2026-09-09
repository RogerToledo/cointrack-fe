import { Stack } from 'expo-router';

export default function PurchasesLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="form" options={{ title: 'Compra' }} />
        </Stack>
    );
}
