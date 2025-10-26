import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { IconButton, RadioButton, Button, Text } from 'react-native-paper';

import { useChild } from '@/context/ChildContext';

export default function AddChildGoal() {

  const { childName } = useChild();

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push('/parent/child-extra');
  };

  const [value, setValue] = React.useState('');

  interface Option {
    id: number;
    label: string;
  }

  const radioOptions: Option[] = [
    { id: 1, label: 'Articulation Skills \n (Clearer speech: helping your child pronounce sounds and words more accurately so they can be better understood by others)' },
    { id: 2, label: 'Expressive Language Skills \n (Using more words and sentences: building vocabulary and forming longer, more meaningful sentences to express thoughts and ideas)' },
    { id: 3, label: 'Comprehension Skills \n (Understanding and following instructions: improving listening skills and ability to understand questions, stories, and daily directions)' },
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
        <Text style={styles.title}>Set Goals</Text>
      </View>

      <Text variant="headlineSmall" style={styles.question}>What is your top goal for {childName}&apos;s Development?</Text>

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
    paddingTop: 20
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    paddingLeft: 50,
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
