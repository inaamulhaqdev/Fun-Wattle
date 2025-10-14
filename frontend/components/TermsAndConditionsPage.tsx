import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, firestore } from '../config/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { useRegistration } from '../context/RegistrationContext';

const TermsAndConditionsPage = () => {
  const { email, password, userType, signedPrivacyPolicy, setSignedPrivacyPolicy } = useRegistration();
  const [ loading, setLoading ] = useState(false);


  const goBack = () => {
    router.back();
  };

  const handleContinue = async() => {
    if (!signedPrivacyPolicy) {
      alert('Please agree to the Terms & Conditions to continue');
      return;
    }

    setLoading(true);

    // Create new user account
    try {
      // Save user authentication to Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Navigate to confirmation page once registration complete (can't go back to terms)
      router.replace('/confirmation');

    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Registration Error', 'Registration failed. Please try again and contact support if the issue persists.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={true}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Terms & Conditions</Text>

          {/* Section 1 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. About Our Service</Text>
            <Text style={styles.sectionText}>
                FunWattle provides tools, exercises, and resources to support speech and language development. We do not provide medical advice. The app is intended as a supplement to, not a replacement for, professional speech therapy services. Always consult a qualified healthcare professional regarding diagnosis or treatment of speech or language conditions.
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Eligibility</Text>
            <Text style={styles.sectionText}>
                You must be at least 18 years old, or have a parent/guardian’s permission, to use this app. Parents or guardians are responsible for supervising use by children.
            </Text>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. User Accounts</Text>
            <Text style={styles.bulletPoint}>• You are responsible for keeping your account information secure.</Text>
            <Text style={styles.bulletPoint}>• You agree not to share your login details with others.</Text>
            <Text style={styles.bulletPoint}>• You must provide accurate information when creating your account.</Text>
          </View>

          {/* Section 4 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Use of the App</Text>
            <Text style={styles.sectionText}>
              You agree to use FunWattle only for lawful purposes. You may not:
            </Text>
            <Text style={styles.bulletPoint}>• Copy, modify, or distribute app content without permission.</Text>
            <Text style={styles.bulletPoint}>• Misuse the app in a way that disrupts services for others.</Text>
            <Text style={styles.bulletPoint}>• Use the app for commercial purposes without our consent.</Text>
          </View>

          {/* Section 5 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscriptions & Payments (if applicable)</Text>
              <Text style={styles.bulletPoint}>• Some features may require a paid subscription.</Text>
              <Text style={styles.bulletPoint}>• Fees, billing periods, and cancellation terms will be clearly stated before purchase.</Text>
              <Text style={styles.bulletPoint}>• Payments are processed through [App Store / Google Play / Payment Provider].</Text>
          </View>

          {/* Section 6 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
            <Text style={styles.sectionText}>
                All app content—including exercises, designs, graphics, and branding—belongs to [Company Name] unless otherwise stated. You may use it only within the app for personal, non-commercial purposes.
            </Text>
          </View>

          {/* Section 7 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Disclaimers & Limitations of Liability</Text>
              <Text style={styles.bulletPoint}>• The app is provided “as is” without warranties of any kind.</Text>
              <Text style={styles.bulletPoint}>• We do not guarantee that the app will always be available, error-free, or secure.</Text>
              <Text style={styles.bulletPoint}>• To the maximum extent permitted by law, we are not liable for any loss, injury, or damages arising from your use of the app.</Text>
          </View>

          {/* Section 8 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Privacy</Text>
            <Text style={styles.sectionText}>
              Your privacy is important to us. Please review our [Privacy Policy] to understand how we collect, use, and protect your information.
            </Text>
          </View>

          {/* Section 9 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Changes to the Terms</Text>
            <Text style={styles.sectionText}>
              We may update these Terms from time to time. If we make significant changes, we will notify you within the app or by email. Continued use of the app after changes means you accept the updated Terms.
            </Text>
          </View>

          {/* Section 10 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Contact Us</Text>
            <Text style={styles.sectionText}>
              If you have questions about these Terms, please contact us at: [Company Name] [Email Address] [Postal Address]
            </Text>
          </View>

          {/* Agreement Section */}
          <View style={styles.agreementSection}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setSignedPrivacyPolicy(!signedPrivacyPolicy)}
            >
              <View style={[styles.checkbox, signedPrivacyPolicy && styles.checkboxChecked]}>
                {signedPrivacyPolicy && <Feather name="check" size={16} color="#fff" />}
              </View>
              <Text style={styles.agreementText}>
                I agree to the Terms & Conditions
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom padding for scroll */}
          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            signedPrivacyPolicy ? styles.continueButtonActive : styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
        >
          <Text style={[
            styles.continueButtonText,
            signedPrivacyPolicy ? styles.continueButtonTextActive : styles.continueButtonTextDisabled
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 5,
    marginLeft: 10,
  },
  agreementSection: {
    marginTop: 30,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  agreementText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  bottomPadding: {
    height: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  continueButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonActive: {
    backgroundColor: '#007bff',
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextActive: {
    color: '#fff',
  },
  continueButtonTextDisabled: {
    color: '#888',
  },
});

export default TermsAndConditionsPage;