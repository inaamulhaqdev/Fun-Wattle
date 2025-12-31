import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';

export default function SplashScreen() {
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedSession = await AsyncStorage.getItem('session');
      if (storedSession) {
        // User was previously logged in, skip intro and go to account selection
        const session = JSON.parse(storedSession);
        
        // Check if they have a profileId (already selected a profile)
        const storedProfileId = await AsyncStorage.getItem('profileId');
        if (storedProfileId) {
          // They were in a profile, go to pin entry
          router.replace('/account-selection');
        } else {
          // They logged in but haven't selected a profile yet
          router.replace('/account-selection');
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    }
  };

  const navigateToWelcome = () => {
    router.push('/welcome');
  };

  return (
    <Pressable style={styles.container} onPress={navigateToWelcome}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>FunWattle</ThemedText>
        
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.logo}
          />
        </View>
        
        <ThemedText style={styles.subtitle}>
          Helping your child&apos;s{'\n'}
          speech grow with fun{'\n'}
          and consistent practice
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  logoContainer: {
    marginVertical: 40,
  },
  logo: {
    width: 200,
    height: 280,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    lineHeight: 26,
    marginTop: 40,
  },
});