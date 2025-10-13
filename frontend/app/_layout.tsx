import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconButton } from 'react-native-paper';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
