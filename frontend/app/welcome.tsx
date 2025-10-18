import { Image } from 'expo-image';
import { StyleSheet, Pressable, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';

export default function WelcomeScreen() {
  const navigateToRegister = () => {
    router.push('/register');
  };

  const navigateToLogin = () => {
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        <ThemedText style={styles.welcomeText}>Welcome{'\n'}to</ThemedText>
        <Image 
          source={require('@/assets/images/funwattle-logo.avif')} 
          style={styles.titleLogo}
          contentFit="contain"
        />
      </View>

      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/koala.png')}
          style={styles.logo}
        />
        {/*  
        <Image
          source={require('@/assets/images/child-dashboard-background.jpg')}
          style={styles.backgroundImage}
        />
        */}
      </View>

      <View style={styles.buttonContainer}>
        <Pressable 
          style={({ hovered }) => [
            styles.signUpButton,
            hovered && styles.signUpButtonHover
          ]}
          onPress={navigateToRegister}
        >
          {({ hovered }) => (
            <ThemedText style={[
              styles.signUpButtonText,
              hovered && styles.signUpButtonTextHover
            ]}>
              Sign Up
            </ThemedText>
          )}
        </Pressable>
        
        <Pressable 
          style={({ hovered }) => [
            styles.loginButton,
            hovered && styles.loginButtonHover
          ]}
          onPress={navigateToLogin}
        >
          {({ hovered }) => (
            <ThemedText style={[
              styles.loginButtonText,
              hovered && styles.loginButtonTextHover
            ]}>
              Log in
            </ThemedText>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FD902B',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  welcomeText: {
    fontSize: 42,
    fontWeight: '300',
    textAlign: 'center',
    color: '#ffffff',
    lineHeight: 50,
  },
  titleLogo: {
    width: 280,
    height: 150,
    top: -40,
    filter: 'brightness(0) invert(1)',
  },
  logoContainer: {
    width: 220,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 20,
    //backgroundColor: '#ffc18fff',
    top: -50,
    borderRadius: 10,
    objectFit: 'contain',
  },
  logo: {
    width: 180,
    height: 230,
    zIndex: 2,
  },
  backgroundImage: {
    width: 220,
    height: 280,
    opacity: 0.7,
    borderRadius: 10,
    filter: 'brightness(1.2)',
    position: 'absolute',
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 15,
    top: -50,
    paddingHorizontal: 20,
  },
  signUpButton: {
    backgroundColor: '#ffbe6eff',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    width: '85%',
  },
  signUpButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#e7cb57ff',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    width: '85%',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  signUpButtonHover: {
    backgroundColor: '#cf5716ff',
  },
  signUpButtonTextHover: {
    color: '#ffffff',
  },
  loginButtonHover: {
    backgroundColor: '#ad680dff',
  },
  loginButtonTextHover: {
    color: '#ffffff',
  },
});