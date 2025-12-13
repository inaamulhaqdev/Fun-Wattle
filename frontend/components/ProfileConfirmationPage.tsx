import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

const ProfileConfirmationPage = () => {
  const handleLogIn = () => {
    // Navigate to main app
    router.replace('/login' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Your profile has been created</Text>
        
        <Text style={styles.subtitle}>
          You are now ready to explore FunWattle!
        </Text>
      </View>
      
      {/* Log In Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logInButton} onPress={handleLogIn}>
          <Text style={styles.logInButtonText}>Log In</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  footer: {
    marginTop: 'auto',
  },
  logInButton: {
    backgroundColor: '#000',
    height: 55,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProfileConfirmationPage;