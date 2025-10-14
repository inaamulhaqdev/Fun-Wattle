import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';

export default function SplashScreen() {
  // Animation values
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(40)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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
    };

    animateIn();
  }, [titleOpacity, titleTranslateY, logoOpacity, logoTranslateY, subtitleOpacity, subtitleTranslateY]);

  const navigateToWelcome = () => {
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
        // Fade out and slide down logo (100ms delay)
        Animated.sequence([
          Animated.delay(50),
          Animated.parallel([
            Animated.timing(logoOpacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(logoTranslateY, {
              toValue: -30,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
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
  };

  return (
    <Pressable style={styles.container} onPress={navigateToWelcome}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          <ThemedText style={styles.title}>FunWattle</ThemedText>
        </Animated.View>
        
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ translateY: logoTranslateY }],
            },
          ]}
        >
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.logo}
          />
        </Animated.View>
        
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
            Helping your child&apos;s{'\n'}
            speech grow with fun{'\n'}
            and consistent practice
          </ThemedText>
        </Animated.View>
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
  titleContainer: {
    alignItems: 'center',
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
  subtitleContainer: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    lineHeight: 26,
    marginTop: 40,
  },
});