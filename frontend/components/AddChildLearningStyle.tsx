import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { IconButton, Checkbox, RadioButton, Button, Text } from 'react-native-paper';

import { useChild } from '@/context/ChildContext';

export default function AddChildLearningStyle() {

  const { childName, setChildHomePracticeFrequency, setChildMotivations, setChildPreferredActivities } = useChild();

  const [freqValue, setFreqValue] = React.useState('');
  
  const [selectedMotivations, setSelectedMotivations] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    if (!freqValue) {
      Alert.alert('Missing Information', 'Please select an option for practice frequency.');
      return;
    }

    if (selectedMotivations.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one motivation style.');
      return;
    }

    if (selectedActivities.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one preferred activity.');
      return;
    }

    setChildHomePracticeFrequency(freqValue);
    setChildMotivations(selectedMotivations);
    setChildPreferredActivities(selectedActivities);
    
    router.push('/child-onboarding/child-summary');
  };

  const toggleOption = (group: 'motivations' | 'activities', option: string) => {
    if (group === 'motivations') {
      setSelectedMotivations(prev =>
        prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
      );
    } else {
      setSelectedActivities(prev =>
        prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
      );
    }
  };

  const practiceFrequencies = [
    { id: 1, label: 'Daily' },
    { id: 2, label: 'A few times a week' },
    { id: 3, label: 'Once a week' },
    { id: 4, label: 'Rarely' },
    { id: 5, label: 'Never' },
  ];

  const motivations = [
    'Rewards and prizes',
    'Fun and games',
    'Seeing progress',
    'Positive encouragement',
    "I'm not sure",
    'Other'
  ];

  const preferredActivities = [
    { label: 'Story-based activities', example: '(interactive stories with speech prompts)' },
    { label: 'Songs and rhymes', example: '(singing, repeating, and rhyming words)' },
    { label: 'Puzzles and challenges', example: '(speech games and problem-solving tasks)' },
    { label: 'Role-playing games', example: '(talking to characters, pretend play)' },
    { label: 'Interactive games', example: '(speech-based video games or activities)' },
    { label: 'Family interaction activities', example: '(games parents and siblings can join)' },
    { label: 'Talking to a virtual assistant', example: '(FunWattle’s AI speech assistant)' },
    { label: 'Not sure', example: '' }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={28}
          onPress={handleBack}
        />
       </View>
      
      <ScrollView contentContainerStyle={styles.container}>
        
        <Text variant="titleLarge" style={styles.title}>Learning Style</Text>

        <Text variant="titleSmall" style={styles.subtitle}>Current Practice Frequency</Text>

        <Text variant="bodyLarge" style={styles.question}>
          How often does {childName} currently practice speech activities at home?
        </Text>

        <RadioButton.Group onValueChange={setFreqValue} value={freqValue}>
          {practiceFrequencies.map((option) => (
            <RadioButton.Item
              key={option.id}
              label={option.label}
              value={option.label}
              position="leading"
              labelStyle={styles.optionLabelStyle}
              style={styles.optionSelectorStyle}
              color="#FD902B"
              mode="android"
            />
          ))}
        </RadioButton.Group>

        <Text variant="titleSmall" style={styles.subtitle}>Motivation Style</Text>
        
        <Text variant="bodyLarge" style={styles.question}>What motivates {childName} the most?</Text>

        {motivations.map(option => (
          <Checkbox.Item
            key={option}
            label={option}
            status={selectedMotivations.includes(option) ? 'checked' : 'unchecked'}
            onPress={() => toggleOption('motivations', option)}
            position="leading"
            labelStyle={styles.optionLabelStyle}
            style={styles.optionSelectorStyle}
            color="#FD902B"
            mode="android"
          />
        ))}

        <Text variant="titleSmall" style={styles.subtitle}>Preferred Activity Types</Text>
       
        <Text variant="bodyLarge" style={styles.question}>
          What type of speech activities would {childName} enjoy the most?
        </Text>

        {preferredActivities.map(option => (
          <Checkbox.Item
            key={option.label}
            label={`${option.label} ${option.example}`}
            status={selectedActivities.includes(option.label) ? 'checked' : 'unchecked'}
            onPress={() => toggleOption('activities', option.label)}
            position="leading"
            labelStyle={styles.optionLabelStyle}
            style={styles.optionSelectorStyle}
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
    fontSize: 23,
    paddingBottom: 15,
    marginTop: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    paddingBottom: 10,
    paddingTop: 20,
  },
  question: {
    paddingVertical: 10,
  },
  optionLabelStyle: { 
    textAlign: 'left', 
    paddingLeft: 10, 
    fontSize: 14 
  },
  optionSelectorStyle: { 
    marginLeft: 0, 
    paddingLeft: 0 
  },
  nextButton: {
    marginTop: 30,
    borderRadius: 8,
    backgroundColor: "#fd9029",
  },
});
