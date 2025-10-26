import React, { useState} from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Checkbox, IconButton, Button, Text } from 'react-native-paper';

import { useChild } from '@/context/ChildContext';

export default function AddChildMotivations() {

  const { childName } = useChild();

  const options = [
    'Rewards and prizes',
    'Fun and games',
    'Seeing progress',
    'Positive encouragement',
    "I'm not sure",
    'Other'
  ];

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(o => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };


  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push('/parent/child-summary');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.headerRow}>
          <IconButton
            icon="arrow-left"
            size={28}
            onPress={handleBack}
          />
          <Text style={styles.title}>Motivations</Text>
        </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.question}>What motivates {childName} the most?</Text>
        <Text variant="bodyMedium" style={{paddingVertical: 10}}>Select all that apply</Text>

        {options.map(option => (
          <Checkbox.Item
            key={option}
            label={option}
            position="leading"
            labelStyle={{ textAlign: 'left', paddingLeft: 10}}
            status={selectedOptions.includes(option) ? 'checked' : 'unchecked'}
            onPress={() => toggleOption(option)}
            color="#FD902B"
            mode="android"
          />
        ))}

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
    marginTop: 50,
  },
  title: {
    paddingLeft: 20,
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
