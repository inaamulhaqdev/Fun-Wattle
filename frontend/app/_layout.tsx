import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconButton, Provider as PaperProvider, MD3LightTheme as DefaultPaperTheme, MD3LightTheme } from 'react-native-paper';
import { RegistrationProvider } from '../context/RegistrationContext';
import { ChildProvider } from '@/context/ChildContext';
import { AppProvider } from '../context/AppContext';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { ActivityIndicator } from 'react-native';

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center'}} />;
  }

  const paperTheme = {
    ...MD3LightTheme,
    fonts: {
      ...MD3LightTheme.fonts,
      bodyLarge: { ...MD3LightTheme.fonts.bodyLarge, fontFamily: 'Poppins_400Regular'},
      bodyMedium: { ...MD3LightTheme.fonts.bodyMedium, fontFamily: 'Poppins_400Regular'},
      titleLarge: { ...MD3LightTheme.fonts.titleLarge, fontFamily: 'Poppins_600SemiBold'},
      titleMedium: { ...MD3LightTheme.fonts.titleMedium, fontFamily: 'Poppins_600SemiBold'},
      labelLarge: { ...MD3LightTheme.fonts.labelLarge, fontFamily: 'Poppins_600SemiBold'},
      labelMedium: { ...MD3LightTheme.fonts.labelMedium, fontFamily: 'Poppins_600SemiBold'},
      labelSmall: { ...MD3LightTheme.fonts.labelSmall, fontFamily: 'Poppins_400Regular'},

    }
  };

  const navTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const headerStyle = {
    headerTitleStyle: { fontFamily: 'Poppins_600SemiBold' },
    headerBackTitleStyle: { fontFamily: 'Poppins_400Regular' },
  };

  return (
    <AppProvider>
      <RegistrationProvider>
        <ChildProvider>
          <PaperProvider theme={paperTheme}>
          <ThemeProvider value={navTheme}>
        <Stack screenOptions={headerStyle}>
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
          <Stack.Screen name="child-stats" options={{ headerShown: false }} />
          <Stack.Screen name="activity" options={{ headerShown: false }} />
          <Stack.Screen name="multiple_drag_exercise" options={{ headerShown: false }} />
          <Stack.Screen name="multiple_select_exercise" options={{ headerShown: false }} />
          <Stack.Screen name="ordered_drag_exercise" options={{ headerShown: false }} />
          <Stack.Screen name="describe_exercise" options={{ headerShown: false }} />
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
          <Stack.Screen name="chat-messages" options={{ headerShown: false }} />
          <Stack.Screen name="(parent-tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="parent" options={{ headerShown: false }} />
        </Stack>
          </ThemeProvider>
          </PaperProvider>
        </ChildProvider>
      </RegistrationProvider>
    </AppProvider>
  );
}
