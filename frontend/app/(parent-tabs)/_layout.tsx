import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ParentLayout() {
  // const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Commented out code = orange navbar instead of black or white
        // tabBarStyle: { backgroundColor: '#fd9029' },
        // tabBarActiveTintColor: '#ffffff',
        // tabBarInactiveTintColor: 'rgba(255,255,255,0.7)',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
      }}>
      <Tabs.Screen
        name="parent-dashboard"
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
          name="chat"
          options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bubble.left.and.bubble.right.fill" color={color} />,
        }}
      />
       <Tabs.Screen
          name="reports"
          options={{
          title: 'Reports',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text.fill" color={color} />,
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