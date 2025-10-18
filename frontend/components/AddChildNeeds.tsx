import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { IconButton, RadioButton, Button, Text } from 'react-native-paper';

export default function AddChildNeeds() {

  let childName = 'Alex';

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push('/parent/child-summary');
  };

  const [value, setValue] = React.useState('');

  interface Option {
    id: number;
    label: string;
    description?: string;
  }

  const radioOptions: Option[] = [
    { id: 1, label: 'Articulation \n (Sound production)' },
    { id: 2, label: 'Comprehension \n (Understanding words/sentences)' },
    { id: 3, label: 'Language building \n (Vocabulary, sentences, storytelling)' },
    { id: 4, label: "I don't know" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <IconButton
          icon="arrow-left"
          size={28}
          onPress={handleBack}
        />
        <Text style={styles.title}>{childName}&apos;s Speech & Communication Needs</Text>
      </View>

      <Text variant="headlineSmall" style={styles.question}>Which speech area would you like  {childName} to start with?</Text>

      <RadioButton.Group onValueChange={value => setValue(value)} value={value}>
        {radioOptions.map((option) => (
          <RadioButton.Item
            label={option.label}
            value={option.label}
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
