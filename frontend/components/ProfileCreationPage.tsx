import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import bcrypt from 'react-native-bcrypt';

const ProfileCreationPage = () => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const pinInputRefs = useRef<(TextInput | null)[]>([null, null, null, null]);
  const [loading, setLoading] = useState(false);

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

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (pin.join('').length !== 4) {
      Alert.alert('Error', 'Please complete your 4-digit PIN');
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Not signed in', 'Please log in again.');
      return;
    }

    setLoading(true);

    try {
      const idToken = await user.getIdToken();

      await fetch('http://localhost:8000/api/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          profile_picture: '', // Placeholder for now - sprint 2 thing
          pin_hash: bcrypt.hashSync(pin.join(''), 10), // Hash the PIN before sending
        }),
      });

      // Navigate to profile confirmation
      router.replace('/profile-confirmation');
    } catch (error) {
      console.error('Profile Creation error:', error);
      Alert.alert('Profile Creation Error', 'Profile Creation failed. Please try again and contact support if the issue persists.');
    } finally {
      setLoading(false);
    }
  };

  const isPinComplete = pin.every(digit => digit !== '');
  const isFormValid = name.trim() && isPinComplete;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Complete your profile</Text>

        {/* Name Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder=""
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        {/* PIN Input */}
        <View style={styles.pinSection}>
          <Text style={styles.pinLabel}>Choose 4 digit PIN to secure your account</Text>

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
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            isFormValid ? styles.continueButtonActive : styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!isFormValid}
        >
          <Text style={[
            styles.continueButtonText,
            isFormValid ? styles.continueButtonTextActive : styles.continueButtonTextDisabled
          ]}>
            Continue
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
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 40,
    textAlign: 'left',
  },
  inputSection: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
    fontWeight: '500',
  },
  nameInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pinSection: {
    marginBottom: 40,
  },
  pinLabel: {
    fontSize: 16,
    color: '#000',
    marginBottom: 20,
    fontWeight: '500',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxWidth: 400,
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
  footer: {
    marginTop: 'auto',
  },
  continueButton: {
    height: 55,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonActive: {
    backgroundColor: '#000',
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  continueButtonTextActive: {
    color: '#fff',
  },
  continueButtonTextDisabled: {
    color: '#888',
  },
});

export default ProfileCreationPage;