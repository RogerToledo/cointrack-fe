import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFamily } from '../../contexts/FamilyContext';
import { FamilySelector } from '../../components/FamilySelector';

export default function TabLayout() {
    const { families, selectedFamily, setSelectedFamily } = useFamily();

    return (
        <Tabs
            screenOptions={{
                headerRight: families.length > 1
                    ? () => (
                        <FamilySelector
                            families={families}
                            selectedFamily={selectedFamily}
                            onSelect={setSelectedFamily}
                        />
                    )
                    : undefined,
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'bar-chart' : 'bar-chart-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="purchases"
                options={{
                    title: 'Compras',
                    headerShown: false,
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'cart' : 'cart-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

        </Tabs>
    );
}
