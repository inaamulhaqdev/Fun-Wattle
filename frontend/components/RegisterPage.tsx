import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { ParentIcon, TherapistIcon } from './UserTypeIcons';
import { useRegistration } from '../context/RegistrationContext';


const RegisterPage = () => {
  const { email, setEmail, password, setPassword, userType, setUserType } = useRegistration();
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [userTypeError, setUserTypeError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false, userType: false });

  // Clear form when component mounts
  useEffect(() => {
    setEmail('');
    setPassword('');
    setUserType(null);
  }, []);

  // Validate email format
  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  // Validate password
  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  // Validate user type
  const validateUserType = (userType: 'parent' | 'therapist' | null) => {
    if (!userType) {
      return 'Please select either Parent or Therapist';
    }
    return '';
  };

  // Real-time validation on change
  useEffect(() => {
    if (touched.email) {
      setEmailError(validateEmail(email));
    }
  }, [email, touched.email]);

  useEffect(() => {
    if (touched.password) {
      setPasswordError(validatePassword(password));
    }
  }, [password, touched.password]);

  useEffect(() => {
    if (touched.userType) {
      setUserTypeError(validateUserType(userType));
    }
  }, [userType, touched.userType]);

  // Check if all fields are valid
  const isFormValid = 
    email.trim() !== '' && 
    password.trim() !== '' && 
    userType !== null &&
    validateEmail(email) === '' &&
    validatePassword(password) === '' &&
    validateUserType(userType) === '';

  const handleRegister = async () => {
    // Mark all fields as touched
    setTouched({ email: true, password: true, userType: true });

    // Validate all fields
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const userTypeErr = validateUserType(userType);

    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setUserTypeError(userTypeErr);

    // If any validation fails, don't proceed
    if (emailErr || passwordErr || userTypeErr) {
      return;
    }

    // Navigate to terms and conditions to finalise registration
    router.push('/terms');
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

      {/* Sign Up form */}
      <View style={styles.formSection}>
        <Text style={styles.formTitle}>Sign Up</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email address</Text>
          <TextInput
            style={[styles.input, emailError && touched.email && styles.inputError]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setTouched({ ...touched, email: true });
            }}
            onBlur={() => setTouched({ ...touched, email: true })}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="your.email@example.com"
          />
          {emailError && touched.email && (
            <Text style={styles.errorText}>{emailError}</Text>
          )}
          {!emailError && email && touched.email && (
            <Text style={styles.successText}>✓ Valid email</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, passwordError && touched.password && styles.inputError]}
              value={password}
              onChangeText={setPassword}
              onBlur={() => setTouched({ ...touched, password: true })}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Enter your password"
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
          <Text style={styles.helperText}>
            Must be 8+ characters with uppercase, number, and special character (!@#$%^&*)
          </Text>
          {passwordError && touched.password && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}
          {!passwordError && password && touched.password && (
            <Text style={styles.successText}>✓ Password meets all requirements</Text>
          )}
        </View>

      {/* User type selection */}
      <View style={styles.userTypeSection}>
        <Text style={styles.questionText}>Are you a parent or therapist?</Text>

        <View style={styles.userTypeOptions}>
          <TouchableOpacity
            style={[
              styles.userTypeButton,
              userType === 'parent' && styles.userTypeButtonSelected,
              userTypeError && touched.userType && styles.userTypeButtonError
            ]}
            onPress={() => {
              setUserType('parent');
              setTouched({ ...touched, userType: true });
            }}
          >
            <ParentIcon
              size={40}
              color={userType === 'parent' ? '#fd9029' : '#000'}
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
              userType === 'therapist' && styles.userTypeButtonSelected,
              userTypeError && touched.userType && styles.userTypeButtonError
            ]}
            onPress={() => {
              setUserType('therapist');
              setTouched({ ...touched, userType: true });
            }}
          >
            <TherapistIcon
              size={40}
              color={userType === 'therapist' ? '#fd9029' : '#000'}
            />
            <Text style={[
              styles.userTypeText,
              userType === 'therapist' && styles.userTypeTextSelected
            ]}>
              Therapist
            </Text>
          </TouchableOpacity>
        </View>
        {userTypeError && touched.userType && (
          <Text style={styles.errorText}>{userTypeError}</Text>
        )}
      </View>

        {/* Validation Summary */}
        {!isFormValid && (email || password || userType) && (
          <View style={styles.validationSummary}>
            <Text style={styles.validationSummaryTitle}>Please complete the following:</Text>
            {validateEmail(email) && <Text style={styles.validationSummaryItem}>• Valid email address</Text>}
            {validatePassword(password) && <Text style={styles.validationSummaryItem}>• Password requirements (8+ chars, uppercase, number, special)</Text>}
            {validateUserType(userType) && <Text style={styles.validationSummaryItem}>• Select Parent or Therapist</Text>}
          </View>
        )}

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[
            styles.signUpButton,
            isFormValid && styles.signUpButtonActive
          ]}
          onPress={handleRegister}
          disabled={!isFormValid}
        >
          <Text style={[
            styles.signUpButtonText,
            isFormValid && styles.signUpButtonTextActive
          ]}>
            {isFormValid ? 'Sign Up' : 'Complete All Fields to Sign Up'}
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
  formSection: {
    flex: 1,
    marginTop: 50,
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
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  successText: {
    color: '#28a745',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '600',
  },
  helperText: {
    color: '#666',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
    fontStyle: 'italic',
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
  userTypeSection: {
    paddingTop: 20,
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
    borderColor: '#000000ff',
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  userTypeButtonSelected: {
    backgroundColor: '#f0f0f0',
    borderColor: '#fd9029',
  },
  userTypeButtonError: {
    borderColor: '#dc3545',
  },
  userTypeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  userTypeTextSelected: {
    color: '#fd9029',
  },
  validationSummary: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
  },
  validationSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  validationSummaryItem: {
    fontSize: 12,
    color: '#856404',
    marginLeft: 8,
    marginTop: 4,
  },
  signUpButton: {
    backgroundColor: '#ccc',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  signUpButtonActive: {
    backgroundColor: '#fd9029',
  },
  signUpButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpButtonTextActive: {
    color: '#fff',
  },
});

export default RegisterPage;