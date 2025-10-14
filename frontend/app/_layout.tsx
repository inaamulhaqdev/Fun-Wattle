import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
