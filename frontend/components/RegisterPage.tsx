import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { ParentIcon, TherapistIcon } from './UserTypeIcons';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'parent' | 'therapist' | null>(null);

  const handleRegister = async () => {    
    router.push('/terms' as any);
  };

  const goBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      {/* User type selection */}
      <View style={styles.userTypeSection}>
        <Text style={styles.questionText}>Are you a parent or therapist?</Text>
        
        <View style={styles.userTypeOptions}>
          <TouchableOpacity
            style={[
              styles.userTypeButton,
              userType === 'parent' && styles.userTypeButtonSelected
            ]}
            onPress={() => setUserType('parent')}
          >
            <ParentIcon 
              size={40} 
              color={userType === 'parent' ? '#007bff' : '#000'} 
            />
            <Text style={[
              styles.userTypeText,
              userType === 'parent' && styles.userTypeTextSelected
            ]}>
              Parent
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.userTypeButton,
              userType === 'therapist' && styles.userTypeButtonSelected
            ]}
            onPress={() => setUserType('therapist')}
          >
            <TherapistIcon 
              size={40} 
              color={userType === 'therapist' ? '#007bff' : '#000'} 
            />
            <Text style={[
              styles.userTypeText,
              userType === 'therapist' && styles.userTypeTextSelected
            ]}>
              Therapist
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign Up form */}
      <View style={styles.formSection}>
        <Text style={styles.formTitle}>Sign Up</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
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
              value={password}
              onChangeText={setPassword}
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

        {/* Sign Up Button */}
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={handleRegister}
        >
          <Text style={styles.signUpButtonText}>
            Sign Up
          </Text>
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
  userTypeSection: {
    marginTop: 60,
    marginBottom: 40,
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
    textAlign: 'left',
  },
  userTypeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  userTypeButton: {
    flex: 1,
    height: 120,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  userTypeButtonSelected: {
    backgroundColor: '#f0f0f0',
    borderColor: '#007bff',
  },

  userTypeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  userTypeTextSelected: {
    color: '#007bff',
  },
  formSection: {
    flex: 1,
  },
  formTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
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
  signUpButton: {
    backgroundColor: '#ccc',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  signUpButtonDisabled: {
    backgroundColor: '#eee',
  },
  signUpButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterPage;