import { Image } from 'expo-image';
import { StyleSheet, Pressable, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  const navigateToRegister = () => {
    router.push('/register');
  };

  const navigateToLogin = () => {
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        <ThemedText style={styles.welcomeText}>Welcome{'\n'}to{'\n'}FunWattle</ThemedText>
      </View>

      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.logo}
        />
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
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 42,
    fontWeight: '300', // Thin weight
    lineHeight: 50,
    textAlign: 'center',
    color: '#333',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  logo: {
    width: 230,
    height: 280,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 15,
    marginTop: 30,
    paddingHorizontal: 20,
  },
  signUpButton: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#000000',
  },
  signUpButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#000000',
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  // Hover styles for Sign Up button (inverts to black background, white text)
  signUpButtonHover: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#000000',
  },
  signUpButtonTextHover: {
    color: '#ffffff',
  },
  // Hover styles for Login button (inverts to black background, white text)
  loginButtonHover: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#000000',
  },
  loginButtonTextHover: {
    color: '#ffffff',
  },
});