import CryptoJS from 'crypto-js';
import Constants from 'expo-constants';

// PIN salt is stored in frontend .env and accessed via expo-constants
const PIN_SALT: string = Constants.expoConfig?.extra?.pinSalt || '';


export const hashPin = (pin: string): string => {
  // Combine PIN with salt, and hash using SHA-256
  const saltedPin = pin + PIN_SALT;
  const hash = CryptoJS.SHA256(saltedPin).toString(CryptoJS.enc.Hex);
  return hash;
};

export const verifyPin = (enteredPin: string, storedHash: string): boolean => {
  const enteredPinHash = hashPin(enteredPin);
  return enteredPinHash === storedHash;
};