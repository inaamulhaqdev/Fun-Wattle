import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput, Button, IconButton, Divider, DefaultTheme } from 'react-native-paper';
import { router } from 'expo-router';

export default function AddChildInviteTherapist () {

  const handleBack = () => router.back();
  
  const handleNext = () => router.push('/parent/consent');

  const [therapistName, setTherapistName] = useState('');
  const [clinic, setClinic] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [childName, setChildName] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <IconButton
          icon="arrow-left"
          size={28}
          onPress={handleBack}
        />
        <Text style={styles.title}>Invite a Therapist</Text>
      </View>

      <TextInput
        label="Speech Therapist’s Name*"
        value={therapistName}
        onChangeText={setTherapistName}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Therapy Clinic*"
        value={clinic}
        onChangeText={setClinic}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Email address*"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Phone Number*"
        value={phone}
        onChangeText={setPhone}
        mode="outlined"
        style={styles.input}
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
        disabled={
          !therapistName.trim() ||
          !clinic.trim() ||
          !email.trim() ||
          !phone.trim() ||
          !childName.trim()
        }
      >
        Continue
      </Button>
    </ScrollView>
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
    backgroundColor: "#FDD652",
  },
});
