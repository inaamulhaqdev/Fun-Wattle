import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { IconButton, RadioButton, Button, Text } from 'react-native-paper';

import { useChild } from '@/context/ChildContext';

export default function AddChildInstructions() {

  const { childName } = useChild();

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push('/parent/child-preferred-activities');
  };

  const [value, setValue] = React.useState('');

  interface Option {
    id: number;
    label: string;
    description?: string;
  }

  const radioOptions: Option[] = [
    { id: 1, label: 'Always' },
    { id: 2, label: 'Sometimes' },
    { id: 3, label: 'Rarely' },
    { id: 4, label: 'Not at all' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.headerRow}>
          <IconButton
            icon="arrow-left"
            size={28}
            onPress={handleBack}
          />
          <Text style={styles.title}>Ability to follow instructions</Text>
        </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.question}>Can {childName} follow simple instructions on digital devices? (E.g., "Tap the blue circle", "Match the picture")</Text>

        <RadioButton.Group onValueChange={value => setValue(value)} value={value}>
          {radioOptions.map((option) => (
            <RadioButton.Item
              label={option.label}
              value={option.label}
              color="#FD902B"
              position="leading"
              labelStyle={{ textAlign: 'left', paddingLeft: 10, fontSize: 15 }}
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
    marginTop: 20,
  },
  title: {
    fontSize: 22,
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
