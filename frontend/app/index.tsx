import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';

export default function SplashScreen() {
  // Animation values
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(40)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(50)).current;
  const autoNavigateTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    checkAuthAndNavigate();
  }, []);

  const checkAuthAndNavigate = async () => {
    try {
      const storedSession = await AsyncStorage.getItem('session');
      if (storedSession) {
        // User is logged in, skip animations and go to account selection
        console.log('User already logged in, navigating to account-selection');
        router.replace('/account-selection');
        return;
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    }

    // No session found, proceed with normal splash animation
    animateIn();
  };

  const animateIn = () => {
    // Title animation (starts first)
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(titleTranslateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

      // Logo animation (starts 200ms after title)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(logoTranslateY, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      }, 200);

      // Subtitle animation (starts 400ms after title)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(subtitleOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(subtitleTranslateY, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      }, 400);

      // Auto-navigate after 4 seconds
      autoNavigateTimeoutRef.current = setTimeout(() => {
        navigateToWelcome();
      }, 4000);
    };

  const navigateToWelcome = useCallback(() => {
    // Clear the auto-navigate timeout if user manually navigates
    if (autoNavigateTimeoutRef.current) {
      clearTimeout(autoNavigateTimeoutRef.current);
      autoNavigateTimeoutRef.current = null;
    }
    
    // Animate out before navigating
    const animateOut = () => {
      Animated.parallel([
        // Fade out and slide down title
        Animated.parallel([
          Animated.timing(titleOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(titleTranslateY, {
            toValue: -20,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        // Fade out and slide down subtitle (150ms delay)
        Animated.sequence([
          Animated.delay(100),
          Animated.parallel([
            Animated.timing(subtitleOpacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(subtitleTranslateY, {
              toValue: -40,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => {
        // Navigate to intro video after animation completes
        router.push('/intro-video');
      });
    };

    animateOut();
  }, [titleOpacity, titleTranslateY, subtitleOpacity, subtitleTranslateY]);

  return (
    <Pressable style={styles.container} onPress={navigateToWelcome}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoImage,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            }
          ]}
        >
          <Image
            source={require('@/assets/images/funwattle-logo.avif')}
            style={styles.logoImage}
            contentFit="contain"
          />
        </Animated.View>

        {/* Subtitle
        <Animated.View
          style={[
            styles.subtitleContainer,
            {
              opacity: subtitleOpacity,
              transform: [{ translateY: subtitleTranslateY }],
            },
          ]}
        >
          <ThemedText style={styles.subtitle}>
            Helping your child&apos;s speech{'\n'}
            grow with fun and{'\n'}
            consistent practice
          </ThemedText>
        </Animated.View>
        */}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fd902b',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoImage: {
    width: 350,
    height: 100,
    top: -30,
    tintColor: '#ffffff',
  },
  /*
  subtitleContainer: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#ffe9c6ff',
    opacity: 0.7,
    lineHeight: 26,
    marginTop: 40,
  },
  */
});