import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { IconButton, RadioButton, Button, Text } from 'react-native-paper';

export default function AddChildGoal() {

  let childName = 'Alex';

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push('/parent/child-needs');
  };

  const [value, setValue] = React.useState('');

  const radioOptions = [
    { id: 1, label: 'Clearer Speech' },
    { id: 2, label: 'Increase Vocabulary' },
    { id: 3, label: 'Following Instructions' },
    { id: 4, label: 'Confidence' },
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

      <Text variant="headlineSmall" style={styles.question}>What is your top goal for {childName}?</Text>

      <RadioButton.Group onValueChange={value => setValue(value)} value={value}>
        {radioOptions.map(option => (
          <RadioButton.Item
            key={option.id}
            label={option.label}
            value={option.label}
            position="leading"
            labelStyle={{ textAlign: 'left', paddingLeft: 10 }}
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
