import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { supabase } from '../config/supabase';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if all fields are filled
  const isFormValid = email.trim() !== '' && password.trim() !== '';

  // Clear form when component mounts
  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Note that AppContext will handle storing session info, and the onAuthStateChange listener will pick this up
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setLoading(false);
        Alert.alert('Login Error', error.message);
        return;
      }
      setLoading(false);
      // Navigate to account selection
      router.push('/account-selection');

    } catch (error) {
      setLoading(false);
      Alert.alert('Login Error', 'Login failed, please try again.');
    }
  };

  const goBack = () => {
    router.back();
  };

  const navigateToRegister = () => {
    router.push('/register');
  };

  const handleForgotPassword = async() => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address to reset your password');
      return;
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      Alert.alert('Error', 'Failed to send password reset email');
    } else {
      Alert.alert('Success', 'Password reset email sent');
    }
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
            value={email}
            onChangeText={setEmail}
            // Web specific props for demo b
            inputMode="email"
            enterKeyHint="next"
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
              value={password}
              onChangeText={setPassword}
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
          style={[
            styles.loginButton, 
            isFormValid && !loading && styles.loginButtonActive,
            loading && styles.loginButtonDisabled
          ]}
          onPress={handleLogin}
          disabled={loading || !isFormValid}
        >
          <Text style={[
            styles.loginButtonText,
            isFormValid && !loading && styles.loginButtonTextActive
          ]}>
            {loading ? 'Logging in...' : 'Log In'}
          </Text>
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
  loginButtonActive: {
    backgroundColor: '#fd9029', // Blue color when form is valid
  },
  loginButtonDisabled: {
    backgroundColor: '#eee',
  },
  loginButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButtonTextActive: {
    color: '#fff', // White text when button is active
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