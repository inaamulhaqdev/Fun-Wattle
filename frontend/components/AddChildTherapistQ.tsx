import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { RadioButton, Button, Text } from 'react-native-paper';
import { useChild } from '@/context/ChildContext';

export default function AddChildTherapistQ() {

  const { childName } = useChild();

  const handleNext = () => {
    router.push('/parent/invite-therapist');
 };

  const [value, setValue] = React.useState('');

  interface Option {
    id: number;
    label: string;
    description?: string;
  }

  const radioOptions: Option[] = [
    { id: 1, label: 'Currently seeing a speech therapist' },
    { id: 2, label: 'Not currently seeing a speech therapist' },
    { id: 3, label: 'Never seen a speech therapist' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Use of Therapist</Text>

      <Text variant="headlineSmall" style={styles.question}>Has {childName} ever attended speech therapy?</Text>

      <RadioButton.Group onValueChange={value => setValue(value)} value={value}>
          {radioOptions.map((option) => (
            <RadioButton.Item
              label={option.label}
              value={option.label}
              color="#FD902B"
              position="leading"
              labelStyle={{ textAlign: 'left', paddingLeft: 10, fontSize: 15 }}
              mode="android"
            />
        ))}
      </RadioButton.Group>

      <Button
          mode="contained"
          style={styles.nextButton}
          onPress={handleNext}
          contentStyle={{ paddingVertical: 8 }}
          textColor="black"
        >
          Next
        </Button>
    </ScrollView>
  );
}

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
  },
  question: {
    fontSize: 20, 
    paddingBottom: 10,
    paddingTop: 15,
  },
  title: {
    fontSize: 25,
    marginTop: 30,
    paddingBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  nextButton: {
    marginTop: 30,
    borderRadius: 8,
    backgroundColor: "#FDD652",
  }
});
