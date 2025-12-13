import React, { useState} from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { RadioButton, IconButton, Button, Text, Checkbox } from 'react-native-paper';
import { useChild } from '@/context/ChildContext';

export interface CommunicationNeeds {
  speechArea: string;
  focus: string[];
}

export default function AddChildCommunicationNeeds() {

  const { childName, setChildCommunicationNeeds } = useChild();

  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();

  const [selectedOptions, setSelectedOptions] = useState<CommunicationNeeds[]>([]);
  const [instructionAbility, setInstructionsAbility] = React.useState('');

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    if (selectedOptions.length === 0) {
      Alert.alert('Missing Information', `Please select at least one speech area to focus on.`);
      return;
    }

    for (const option of selectedOptions) {
      const areaType = options.find(o => o.key === option.speechArea)?.type;
      const title = followUpQuestions[option.speechArea]?.title || option.speechArea;

      if (areaType === "multi-select" && option.focus.length === 0) {
        Alert.alert('Missing Information', `Please select at least one option for ${title}.`);
        return;
      }

      if (areaType === "radio" && !option.focus[0]) {
        Alert.alert('Missing Information', `Please choose a follow-up option for ${title}.`);
        return;
      }
    }

    setChildCommunicationNeeds(selectedOptions);

    if (returnTo === 'summary') {
      router.push('/child-onboarding/child-summary');
    } else {
      router.push('/child-onboarding/child-learning-style');
    }
  };

  const toggleOption = (key: string) => {
    setSelectedOptions(prev => {
      const exists = prev.find(n => n.speechArea === key);

      if (exists) {
        return prev.filter(n => n.speechArea !== key);
      }

      return [...prev, { speechArea: key, focus: [] }];
    });
  };

  const isSelected = (key: string) => selectedOptions.some(o => o.speechArea === key);

  const setFocus = (speechArea: string, value: string) => {
    setSelectedOptions(prev =>
      prev.map(o =>
        o.speechArea === speechArea ? { ...o, focus: [value] } : o
      )
    );
  };

  const toggleFocus = (speechArea: string, value: string) => {
    setSelectedOptions(prev =>
      prev.map(o => {
        if (o.speechArea !== speechArea) return o;

        const current = o.focus;
        const newFocus = current.includes(value)
          ? current.filter(f => f !== value)
          : [...current, value];

        return { ...o, focus: newFocus };
      })
    );
  };

  const instructionOptions = [
    { id: 1, label: 'Always' },
    { id: 2, label: 'Sometimes' },
    { id: 3, label: 'Rarely' },
    { id: 4, label: 'Not at all' },
  ];

  const options = [
    { key: 'Articulation', label: 'Articulation (sound production)', type: "multi-select" },
    { key: 'Comprehension', label: 'Comprehension (understanding words/sentences)', type: "radio"  },
    { key: 'Language building', label: 'Language building (vocabulary, sentences, storytelling)', type: "radio"  },
    { key: 'Not sure', label: 'Not sure' },
  ];

  const followUpQuestions: Record<string, { title: string; question: string }> = {
    Articulation: {
      title: 'Difficult Speech Sounds',
      question: `Does ${childName} have difficulty with any of these sounds?`,
    },
    Comprehension: {
      title: 'Listening Challenges',
      question: `When ${childName} is listening, what’s the biggest challenge you notice?`,
    },
    'Language building': {
      title: 'Language Focus',
      question: ` Which area of language do you most want to build right now?`,
    },
  };

  const followUpOptions: Record<string, { label: string; example?: string }[]> = {
    Articulation: [
      { label: 'P / B', example: 'Papa, Ball' },
      { label: 'S / Z', example: 'Sun, Zoo' },
      { label: 'T / D', example: 'Tap, Dog' },
      { label: 'R / L', example: 'Run, Lion' },
      { label: 'K / G', example: 'Cat, Go' },
      { label: 'Not sure' },
      { label: 'Other' },
    ],
    Comprehension: [
      { label: 'Following simple instructions', example: 'e.g. "touch the ball"' },
      { label: 'Understanding short sentences or questions' },
      { label: 'Remembering what was said' },
      { label: 'Not sure' },
    ],
    'Language building': [
      { label: 'Learning new words' },
      { label: 'Putting words together in short sentences' },
      { label: 'Telling simple stories or describing events' },
      { label: 'Not sure' },
    ],
  };
  
  

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
      
      <Text variant="titleLarge" style={styles.title}>Communication Needs</Text>
      
      <Text variant="bodyMedium" style={{ paddingBottom: 20 }}>
        This will help us understand your child’s needs and recommend the right learning units.
      </Text>
  
      <Text variant="titleSmall" style={styles.subtitle}>Main area to focus on</Text>
      
      <Text variant="bodyLarge" style={styles.question}>
        Which speech areas are most important for {childName} to work on right now? (Choose all that apply)
      </Text>

      {options.map(option => (
          <Checkbox.Item
            key={option.key}
            label={option.label}
            position="leading"
            status={isSelected(option.key) ? 'checked' : 'unchecked'}
            onPress={() => toggleOption(option.key)}
            color="#FD902B"
            mode="android"
            labelStyle={styles.optionLabelStyle}
            style={styles.optionSelectorStyle}
          />
      ))}

      {['Articulation', 'Comprehension', 'Language building'].map(area =>
        isSelected(area) ? (
          <View key={area} style={{ marginTop: 20 }}>
            <Text variant="titleSmall" style={styles.subtitle}>{followUpQuestions[area].title}</Text>
            <Text variant="bodyLarge" style={styles.question}>{followUpQuestions[area].question}</Text>

            {area === "Articulation" ? (
              followUpOptions[area].map(option => {
                const current = selectedOptions.find(n => n.speechArea === area);
                const checked = current?.focus.includes(option.label);
                return (
                  <Checkbox.Item
                    key={option.label}
                    label={`${option.label}${option.example ? ` (e.g. ${option.example})` : ''}`}
                    status={checked ? "checked" : "unchecked"}
                    onPress={() => toggleFocus(area, option.label)}
                    color="#FD902B"
                    mode="android"
                    position="leading"
                    labelStyle={styles.optionLabelStyle}
                    style={styles.optionSelectorStyle}
                  />
                );
              })
            ) : (
              <RadioButton.Group
                onValueChange={value => setFocus(area, value)}
                value={selectedOptions.find(n => n.speechArea === area)?.focus[0] || ""}
              >
                {followUpOptions[area].map(option => (
                  <RadioButton.Item
                    key={option.label}
                    label={`${option.label}${option.example ? ` (${option.example})` : ''}`}
                    value={option.label}
                    color="#FD902B"
                    position="leading"
                    labelStyle={styles.optionLabelStyle}
                    style={styles.optionSelectorStyle}
                    mode="android"
                  />
                ))}
              </RadioButton.Group>
            )}
          </View>
        ) : null
      )}

      
      <Text variant="titleSmall" style={[styles.subtitle, { paddingTop: 20 }]}>Following Instructions</Text>

      <Text variant="bodyLarge" style={styles.question}>Can {childName} follow simple instructions during activities (e.g. “Tap the blue circle”)?</Text>
      
      <RadioButton.Group onValueChange={value => setInstructionsAbility(value)} value={instructionAbility}>
        {instructionOptions.map((option) => (
          <RadioButton.Item
            key={option.id}
            label={option.label}
            value={option.label}
            color="#fd9029"
            position="leading"
            labelStyle={styles.optionLabelStyle}
            style={styles.optionSelectorStyle}
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
    fontSize: 23,
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
    paddingTop: 5,
  },
  content: {
    paddingVertical: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredText: {
    textAlign: 'center',
    fontWeight: 'bold'
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
    marginBottom: 30,
    borderRadius: 8,
    backgroundColor: "#fd9029",
  },
});
