import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

const PinEntryPage = () => {
  const [pin, setPin] = useState(['', '', '', '']);
  const pinInputRefs = useRef<(TextInput | null)[]>([null, null, null, null]);

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
  };

  // Auto-submit when PIN is complete
  React.useEffect(() => {
    if (pin.every(digit => digit !== '')) {
      const enteredPin = pin.join('');
      // TODO: Validate PIN with backend
      // Navigate to parent introduction page (only on first login)
      router.replace('/parent-introduction' as any);
    }
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