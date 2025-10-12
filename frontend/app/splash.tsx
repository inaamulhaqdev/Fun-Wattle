import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';

export default function SplashScreen() {
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