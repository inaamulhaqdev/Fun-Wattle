import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import { useApp } from '@/context/AppContext';
import { verifyPin } from '../utils/pinUtils';

const PinEntryPage = () => {
  const { profileId } = useApp();
  const [pin, setPin] = useState(['', '', '', '']);
  const pinInputRefs = useRef<(TextInput | null)[]>([null, null, null, null]);
  const { session } = useApp();

  const handlePinChange = (index: number, value: string) => {
    // Only allow single digits
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);

      // Auto-focus to next input if a digit was entered
      if (value !== '' && index < 3) {
        pinInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    // Handle backspace to go to previous input
    if (key === 'Backspace' && pin[index] === '' && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    }
  };

  const goBack = () => {
    router.back();
  };

  const handleForgotPin = () => {
    // TODO: Implement forgot PIN functionality
    // Do this after we have PINs properly hashed and stored
  };

  // Auto-submit when PIN is complete
  React.useEffect(() => {
    const submitPin = async () => {
      if (pin.every(digit => digit !== '')) {
        const enteredPin = pin.join('');

        if (!session?.access_token) {
          Alert.alert('Error', 'You must be authorized to perform this action');
          return;
        }

        try {
          // Get the stored PIN hash from the backend
          const response = await fetch(`${API_URL}/profile/${profileId}/data/`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${session?.access_token}`
            }
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch profile (${response.status})`);
          }

          const data = await response.json();
          const correctPinHash = data.pin_hash;

          // Verify PIN by comparing hashes
          if (verifyPin(enteredPin, correctPinHash)) {
            // Navigate to appropriate dashboard
            if (data.profile_type === 'parent') {
              // Check if this parent profile has seen the introduction
              const storageKey = `parent_intro_seen_${profileId}`;
              const hasSeenIntro = await AsyncStorage.getItem(storageKey);
              
              if (hasSeenIntro === 'true') {
                // Already seen, go directly to dashboard
                router.replace('/(parent-tabs)/parent-dashboard');
              } else {
                // First time, show introduction
                router.replace('/parent-introduction');
              }
            } else { // Therapist
              router.replace('/therapist-dashboard');
            }
          } else {
            Alert.alert('Error', 'Incorrect PIN. Please try again.');
            setPin(['', '', '', '']);
            pinInputRefs.current[0]?.focus();
          }
        } catch (error) {
          console.error('PIN verification error:', error);
          Alert.alert('Error', 'Failed to verify PIN. Please try again.');
          setPin(['', '', '', '']);
          pinInputRefs.current[0]?.focus();
        }
      }
    };

    submitPin();
  }, [pin]);

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Enter your passcode</Text>

        {/* PIN Input */}
        <View style={styles.pinContainer}>
          {pin.map((digit, index) => (
            <View key={index} style={styles.pinInputContainer}>
              <TextInput
                ref={(ref) => { pinInputRefs.current[index] = ref; }}
                style={styles.pinInput}
                value={digit}
                onChangeText={(value) => handlePinChange(index, value)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                secureTextEntry={true}
                caretHidden={true}
                autoFocus={index === 0}
              />
              <View style={styles.pinDisplay}>
                {digit !== '' && <View style={styles.pinDot} />}
              </View>
            </View>
          ))}
        </View>

        {/* Forgot PIN Link */}
        <TouchableOpacity style={styles.forgotPinContainer} onPress={handleForgotPin}>
          <Text style={styles.forgotPinText}>Forgot PIN?</Text>
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
    fontSize: 28,
    color: '#000',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    marginTop: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 60,
    textAlign: 'left',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  pinInputContainer: {
    position: 'relative',
  },
  pinInput: {
    width: 60,
    height: 70,
    borderColor: '#000',
    borderWidth: 2,
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#fff',
    color: 'transparent',
  },
  pinDisplay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
  },
  forgotPinContainer: {
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  forgotPinText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'right',
  },
});

export default PinEntryPage;