import React, { useState } from 'react';
import { Platform, KeyboardAvoidingView, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, IconButton, Divider, Checkbox } from 'react-native-paper';
import { router } from 'expo-router';

export default function AddChildInviteTherapist () {

  const handleBack = () => router.back();

  // TODO: Ask how this should work? Do we send an email to the therapist to sign up? 
  const handleNext = () => router.push('/child-onboarding/consent');

  const [therapistName, setTherapistName] = useState('');
  const [clinic, setClinic] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [childName, setChildName] = useState('');
  const [assignTherapist, setAssignTherapist] = useState(false);

  const allTherapistFieldsFilled =
    therapistName.trim() &&
    clinic.trim() &&
    email.trim() &&
    phone.trim();

  const isContinueEnabled = childName.trim() && (allTherapistFieldsFilled || assignTherapist);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <IconButton
            icon="arrow-left"
            size={28}
            onPress={handleBack}
          />
          <Text style={styles.title}>Invite a Therapist</Text>
        </View>

        <Button
          mode="text"
          onPress={() => {
            setAssignTherapist(true);
            setTherapistName('');
            setClinic('');
            setEmail('');
            setPhone('');
          }}
          textColor="#FD902B"
          style={{ alignSelf: 'flex-end', marginBottom: 10 }}
        >
          Skip for now
        </Button>

        <TextInput
          label="Speech Therapist’s Name*"
          value={therapistName}
          onChangeText={setTherapistName}
          mode="outlined"
          style={styles.input}
          disabled={assignTherapist}
        />
        <TextInput
          label="Therapy Clinic*"
          value={clinic}
          onChangeText={setClinic}
          mode="outlined"
          style={styles.input}
          disabled={assignTherapist}
        />
        <TextInput
          label="Email address*"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          disabled={assignTherapist}
        />
        <TextInput
          label="Phone Number*"
          value={phone}
          onChangeText={setPhone}
          mode="outlined"
          style={styles.input}
          disabled={assignTherapist}
        />

        <Divider style={styles.divider} />

        <TextInput
          label="Child’s Full Name*"
          value={childName}
          onChangeText={setChildName}
          mode="outlined"
          style={styles.input}
        />

        <Text variant="bodyLarge">With the information you’ve provided, FunWattle will invite the therapist on your behalf.</Text>

        <Button
          mode="contained"
          style={styles.nextButton}
          onPress={handleNext}
          contentStyle={{ paddingVertical: 8 }}
          textColor="black"
          disabled={!isContinueEnabled}
        >
          Continue
        </Button>
      </ScrollView>
    </KeyboardAvoidingView> 
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 45
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 30,
    paddingBottom: 10 
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#000',
  },
  backButton: {
    marginBottom: 10,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    paddingLeft: 20,
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#fff7de',
  },
  divider: {
    marginVertical: 20,
    height: 1,
    backgroundColor: '#ccc',
  },
  nextButton: {
    marginTop: 30,
    borderRadius: 8,
    backgroundColor: "#fd9029",
  },
});
