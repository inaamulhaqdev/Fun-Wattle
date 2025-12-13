import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { IconButton, RadioButton, Button, Text } from 'react-native-paper';
import { useChild } from '@/context/ChildContext';

export default function AddChildGoal() {

  const { childName, setChildTopGoal } = useChild();

  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    if (!value) {
      Alert.alert('Missing Information', 'Please select a goal.');
      return;
    }

    const selectedId = parseInt(value);
    if (selectedId === 1) {
      setChildTopGoal('Articulation Skills');
    } else if (selectedId === 2) {
      setChildTopGoal('Expressive Language Skills');
    } else if (selectedId === 3) {
      setChildTopGoal('Comprehension Skills');
    } else {
      setChildTopGoal("I don't know");
    }

    if (returnTo === 'summary') {
      router.push('/child-onboarding/child-summary');
    } else {
      router.push('/child-onboarding/child-communication-needs');
    }
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
  ];

  return (
    <>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={28}
          onPress={handleBack}
        />
      </View>  
      <ScrollView contentContainerStyle={styles.container}>

        <Text variant="titleLarge" style={styles.title}>Parent Goal</Text>

        <Text variant="bodyMedium" style={{ paddingBottom: 20 }}>This will help us set the top objective for your child.</Text>

        <Text variant="bodyLarge" style={styles.question}>What is your top goal for {childName}&apos;s Development?</Text>

        <RadioButton.Group onValueChange={value => setValue(value)} value={value}>
          {radioOptions.map((option) => (
            <RadioButton.Item
              key={option.id}
              label={option.label}
              value={option.id.toString()}
              color="#FD902B"
              position="leading"
              labelStyle={{ textAlign: 'left', paddingLeft: 10, fontSize: 13 }}
              style={{ marginLeft: 0, paddingLeft: 0 }}
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 25,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fd9029',
    paddingHorizontal: 20,
    paddingTop: 50,
    alignItems: 'flex-start'
  },
  title: {
    fontSize: 25,
    paddingBottom: 15,
    marginTop: 10,
    fontWeight: 'bold',
  },
  question: {
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    paddingBottom: 10,
    paddingTop: 15,
  },
  nextButton: {
    marginTop: 30,
    marginBottom: 30,
    borderRadius: 8,
    backgroundColor: "#fd9029",
  },
});
