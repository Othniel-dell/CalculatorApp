import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 66,
          paddingTop: 7,
          paddingBottom: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Basic',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator-outline" color={typeof color === 'string' ? color : colors.muted} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="scientific"
        options={{
          title: 'Scientific',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flask-outline" color={typeof color === 'string' ? color : colors.muted} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="currency"
        options={{
          title: 'Currency',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" color={typeof color === 'string' ? color : colors.muted} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="converter"
        options={{
          title: 'Converter',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="swap-horizontal-outline" color={typeof color === 'string' ? color : colors.muted} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" color={typeof color === 'string' ? color : colors.muted} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
