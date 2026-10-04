import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColors } from '@/hooks/useColors';

export default function TabLayout() {
  const colors = useColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 10, marginBottom: 2 },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, height: 67, paddingTop: 8 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Bosh sahifa', tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="scan" options={{ title: 'Tahlil', tabBarIcon: ({ color, size }) => <Feather name="camera" color={color} size={size} /> }} />
      <Tabs.Screen name="weather" options={{ title: 'Ob-havo', tabBarIcon: ({ color, size }) => <Feather name="cloud" color={color} size={size} /> }} />
      <Tabs.Screen name="guide" options={{ title: 'Qo‘llanma', tabBarIcon: ({ color, size }) => <Feather name="book-open" color={color} size={size} /> }} />
    </Tabs>
  );
}