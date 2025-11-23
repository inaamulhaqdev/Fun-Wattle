import React, { useState } from 'react';
import { View, Alert, ScrollView, StyleSheet } from 'react-native';
import { Provider as PaperProvider, Text, TextInput, Button, IconButton, DefaultTheme, RadioButton } from 'react-native-paper';
import { Dropdown } from "react-native-element-dropdown";
import { router, useLocalSearchParams } from 'expo-router';
import { useChild } from '@/context/ChildContext';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const AddChildDetails = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [year, setYear] = useState('');
  const [therapyHistory, setTherapyHistory] = useState('');

  const { childName, setChildName, setDateOfBirth, setChildAttendedTherapist } = useChild();

  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  
  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    if (!selectedMonth || !year.trim()) {
      Alert.alert('Missing Information', 'Please enter date of birth.');
      return;
    }

    if (isNaN(Number(year)) || year.length !== 4 || Number(year) < 1900 || Number(year) > new Date().getFullYear()) {
      Alert.alert('Invalid Year', 'Please enter a valid 4-digit year.');
      return;
    }

    if (!therapyHistory) {
      Alert.alert('Missing Information', "Please answer about your child's speech therapy history");
      return;
    }

    const dob = `${selectedMonth} ${year}`;
    setDateOfBirth(dob);

    setChildAttendedTherapist(therapyHistory);

    if (returnTo === 'summary') {
      router.push('/child-onboarding/child-summary');
    } else {
      router.push('/child-onboarding/child-goal');
    }
  };

  const radioOptions = [
    { id: 1, label: 'Currently seeing a speech therapist' },
    { id: 2, label: 'Not currently' },
    { id: 3, label: 'Never' },
  ];

  return (
    <PaperProvider theme={DefaultTheme}>
      {/* Back */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={28}
          onPress={handleBack}
          style={styles.backButton}
        />
      </View>

      <ScrollView contentContainerStyle={styles.container}>

        <Text variant="titleLarge" style={styles.title}>Child Basics</Text>
        
        <Text variant="titleSmall" style={styles.subtitle}>Let’s start with the basics!</Text>

        <Text variant="bodyMedium" style={{ paddingBottom: 20 }}>We’ll begin by setting up a simple profile for your child. These details will help us make activities age-appropriate and more personal.</Text>

        <Text variant="bodyLarge" style={styles.question}>
          Enter your child's name.
        </Text>

        {/* First Name Input */}
        <TextInput
          label="First Name / Nickname"
          value={childName}
          onChangeText={setChildName}
          mode="outlined"
          style={styles.input}
          outlineColor="#000"
          activeOutlineColor="#FD902B"
        />

        {/* Birthday Section */}
        <Text variant="bodyMedium" style={styles.question}>
          What is their date of birth?
        </Text>

        {/* Month */}
        <Dropdown
          style={{
            height: 50,
            borderColor: "#FD902B",
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
            backgroundColor: "#ffa24bff",
            marginBottom: 20,
          }}
          placeholderStyle={{ color: "#fff", fontWeight: 'bold' }}
          selectedTextStyle={{ color: "#fff", fontWeight: 'bold' }}
          itemTextStyle={{ color: "#000" }}
          activeColor="#ffb46dff"
          placeholder="Select Month"
          data={months.map((m) => ({ label: m, value: m }))}
          labelField="label"
          valueField="value"
          value={selectedMonth}
          onChange={(item) => setSelectedMonth(item.value)}
        />

        {/* Year */}
        <TextInput
          label="Year"
          value={year}
          onChangeText={setYear}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          outlineColor="#000"
          activeOutlineColor="#FD902B"
        />

        {/* Therapist */}
        <Text style={styles.subtitle}>Speech Therapy History</Text>

        <Text variant="bodyLarge" style={styles.question}>
          Has {childName || "your child"} ever attended speech therapy?
        </Text>

        <RadioButton.Group
          onValueChange={(value) => setTherapyHistory(value)}
          value={therapyHistory}
        >
          {radioOptions.map((option) => (
            <RadioButton.Item
              key={option.id}
              label={option.label}
              value={option.label}
              color="#FD902B"
              position="leading"
              labelStyle={styles.radioLabel}
              mode="android"
            />
          ))}
        </RadioButton.Group>

        {/* Next */}
        <Button
          mode="contained"
          style={styles.nextButton}
          onPress={handleNext}
          contentStyle={{ paddingVertical: 8 }}
          textColor="black"
          disabled={
            !childName.trim() || !selectedMonth || !year.trim() || !therapyHistory
          }
        >
          Next
        </Button>
      </ScrollView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 25,
    backgroundColor: '#fff',
  },
  backButton: {
    marginBottom: 10,
  },
  title: {
    marginTop: 10,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#ffebd8ff',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 15,
  },
  question: {
    marginBottom: 10,
  },
  monthLabel: {
    color: '#fd9029',
    textAlign: 'center',
  },
  radioLabel: {
    textAlign: 'left',
    paddingLeft: 10,
    fontSize: 15,
  },
  dropdown: {
    marginBottom: 20,
    justifyContent: 'flex-start',
  },
  header: {
    backgroundColor: '#fd9029',
    paddingHorizontal: 20,
    paddingTop: 50,
    alignItems: 'flex-start'
  },
  nextButton: {
    marginTop: 30,
    marginBottom: 30,
    borderRadius: 8,
    backgroundColor: "#fd9029",
  },
});

export default AddChildDetails;
