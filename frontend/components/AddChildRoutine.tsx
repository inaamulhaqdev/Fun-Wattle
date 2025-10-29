import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { IconButton, RadioButton, Button, Text } from 'react-native-paper';

import { useChild } from '@/context/ChildContext';

export default function AddChildRoutine() {

  const { childName, setChildHomePracticeFrequency, setChildPracticeDuration } = useChild();

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    if (!freqValue || !durationValue) {
      Alert.alert('Missing Information', 'Please select an option for both questions.');
      return;
    }

    setChildHomePracticeFrequency(freqValue);
    setChildPracticeDuration(durationValue);

    router.push('/parent/child-instructions');
  };

  // Separate selection state for each question (store selected option IDs as strings)
  const [freqValue, setFreqValue] = React.useState('');
  const [durationValue, setDurationValue] = React.useState('');

  interface Option {
    id: number;
    label: string;
    description?: string;
  }

  const radioOptions1: Option[] = [
    { id: 1, label: 'Daily' },
    { id: 2, label: 'A few times a week' },
    { id: 3, label: 'Once a week' },
    { id: 4, label: 'Rarely' },
    { id: 5, label: 'Never' },
  ];

  const radioOptions2: Option[] = [
    { id: 1, label: '5-10 minutes' },
    { id: 2, label: '10-30 minutes' },
    { id: 3, label: '30+ minutes' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.headerRow}>
          <IconButton
            icon="arrow-left"
            size={28}
            onPress={handleBack}
          />
          <Text style={styles.title}>Current Routine</Text>
        </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.question}>How often does {childName} currently practice speech activities at home?</Text>

        <RadioButton.Group onValueChange={setFreqValue} value={freqValue}>
          {radioOptions1.map((option) => (
            <RadioButton.Item
              key={option.id}
              label={option.label}
              value={option.label}
              position="leading"
              labelStyle={{ textAlign: 'left', paddingLeft: 10, fontSize: 15 }}
              color="#FD902B"
              mode="android"
            />
          ))}
        </RadioButton.Group>

        <Text variant="headlineSmall" style={styles.question}>On average, how long does {childName} spend per practice session?</Text>

        <RadioButton.Group onValueChange={setDurationValue} value={durationValue}>
          {radioOptions2.map((option) => (
            <RadioButton.Item
              key={option.id}
              label={option.label}
              value={option.label}
              position="leading"
              labelStyle={{ textAlign: 'left', paddingLeft: 10, fontSize: 15 }}
              color="#FD902B"
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  question: {
    fontSize: 20,
    paddingBottom: 10,
    paddingTop: 15,
  },
  nextButton: {
    marginTop: 30,
    borderRadius: 8,
    backgroundColor: "#FDD652",
  },
});
