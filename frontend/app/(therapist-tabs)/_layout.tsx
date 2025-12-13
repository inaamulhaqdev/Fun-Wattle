import { Tabs } from 'expo-router';
import React from 'react';
import { useApp } from '@/context/AppContext';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const { darkMode } = useApp();
  const colorScheme = useColorScheme();

  const backgroundColor = darkMode ? "#000000" : "#fd9029";
  const activeColor = darkMode ? "#ffffff" : "#ffffff";
  const inactiveColor = darkMode ? "#aaaaaa" : "rgba(255,255,255,0.7)";
  const screenBackground = darkMode ? "#000000" : "#FFFFFF";

  return (
      <Tabs
        screenOptions={{
          tabBarStyle: { backgroundColor },
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarShowLabel: true,
        }}>
        <Tabs.Screen
          name="therapist-dashboard"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="learning-units"
          options={{
            title: 'Learning Units',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="chat-rooms"
          options={{
          title: 'Chat',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="bubble.left.and.bubble.right.fill" color={color} />,
          }}
        />
        <Tabs.Screen
            name="settings"
            options={{
            title: 'Settings',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
            }}
        />
      </Tabs>
  );
}