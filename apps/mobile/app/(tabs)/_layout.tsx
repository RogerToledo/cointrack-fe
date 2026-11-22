import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFamily } from '../../contexts/FamilyContext';
import { FamilySelector } from '../../components/FamilySelector';
import { theme } from '../../constants/theme';

export default function TabLayout() {
  const { families, selectedFamily, setSelectedFamily } = useFamily();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.primaryDark,
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerRight:
          families.length > 1
            ? () => (
                <FamilySelector
                  families={families}
                  selectedFamily={selectedFamily}
                  onSelect={setSelectedFamily}
                />
              )
            : undefined,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mutedLight,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
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
