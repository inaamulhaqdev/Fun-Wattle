import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconButton } from 'react-native-paper';
import { RegistrationProvider } from '../context/RegistrationContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <RegistrationProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen 
            name="index" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="intro-video" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="welcome" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="terms" options={{ headerShown: false }} />
          <Stack.Screen name="confirmation" options={{ headerShown: false }} />
          <Stack.Screen name="membership" options={{ headerShown: false }} />
          <Stack.Screen name="profile-creation" options={{ headerShown: false }} />
          <Stack.Screen name="profile-confirmation" options={{ headerShown: false }} />
          <Stack.Screen name="account-selection" options={{ headerShown: false }} />
          <Stack.Screen name="pin-entry" options={{ headerShown: false }} />
          <Stack.Screen name="parent-introduction" options={{ headerShown: false }} />
          <Stack.Screen name="child-dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="activity" options={{ headerShown: false }} />
          <Stack.Screen name="mascot-customization" options={{ headerShown: false }} />
          <Stack.Screen name="(therapist-tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="learning-unit-details" options={{
            title: 'Unit Details',
            headerLeft: ({ tintColor}) => (
              <IconButton
                icon="arrow-left"
                size={24}
                onPress={() => {
                  router.back();
                }}
                iconColor={tintColor}
              />
            )
            }} />
          <Stack.Screen name="(parent-tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="parent/add-child-details" options={{ headerShown: false }} />
        <Stack.Screen name="parent/child-goal" options={{ headerShown: false }} />
        <Stack.Screen name="parent/child-needs" options={{ headerShown: false }} />
        <Stack.Screen name="parent/child-summary" options={{ headerShown: false }} />
        <Stack.Screen name="parent/child-added" options={{ headerShown: false }} />
      </Stack>
      </ThemeProvider>
    </RegistrationProvider>
  );
}
