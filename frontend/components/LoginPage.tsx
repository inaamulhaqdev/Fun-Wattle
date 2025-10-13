import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Navigate to account selection
    router.push('/account-selection' as any);
  };

  const goBack = () => {
    router.back();
  };

  const navigateToRegister = () => {
    router.push('/register');
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      {/* Login form */}
      <View style={styles.formSection}>
        <Text style={styles.title}>Log In</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email address</Text>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder=""
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder=""
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password Link */}
        <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Up Link */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpPrompt}>Don&apos;t have an account? </Text>
        <TouchableOpacity onPress={navigateToRegister}>
          <Text style={styles.signUpLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  formSection: {
    flex: 1,
    marginTop: 60,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 40,
    textAlign: 'left',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 30,
    marginTop: -10,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#000',
    textDecorationLine: 'none',
  },
  loginButton: {
    backgroundColor: '#ccc',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#eee',
  },
  loginButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    marginTop: 'auto',
  },
  signUpPrompt: {
    fontSize: 16,
    color: '#000',
  },
  signUpLink: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LoginPage;