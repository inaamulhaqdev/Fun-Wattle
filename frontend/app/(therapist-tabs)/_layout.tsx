import { Tabs } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';
import { useApp } from '@/context/AppContext';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const { darkMode } = useApp();
  const colorScheme = useColorScheme();

  const backgroundColor = "#FFFFFF";
  const activeColor = "#000000";
  const inactiveColor = "#666666";
  const screenBackground = darkMode ? "#000000" : "#FFFFFF";

  return (
      <Tabs
        screenOptions={{
          tabBarStyle: { 
            backgroundColor,
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}>
        <Tabs.Screen
          name="therapist-dashboard"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house" color={color} />,
          }}
        />
        <Tabs.Screen
          name="learning-units"
          options={{
            title: 'Learning Units',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="book" color={color} />,
          }}
        />
        <Tabs.Screen
          name="chat-rooms"
          options={{
          title: 'Chat',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="bubble.left.and.bubble.right" color={color} />,
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Reports',
            tabBarIcon: ({ color }) => (
              <Image
                source={require('@/assets/icons/reports-icon.png')}
                style={{ width: 28, height: 28, tintColor: color }}
              />
            ),
          }}
        />
        <Tabs.Screen
            name="settings"
            options={{
            title: 'Settings',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape" color={color} />,
            }}
        />
      </Tabs>
  );
}