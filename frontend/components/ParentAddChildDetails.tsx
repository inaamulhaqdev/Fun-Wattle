import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Provider as PaperProvider, Text, TextInput, Button, IconButton, Menu, DefaultTheme } from 'react-native-paper';
import { router } from 'expo-router';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const AddChildDetails = () => {
  const [firstName, setFirstName] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [year, setYear] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push('/parent/child-goal');
  };

  return (
    <PaperProvider theme={DefaultTheme}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back */}
        <IconButton
          icon="arrow-left"
          size={28}
          onPress={handleBack}
          style={styles.backButton}
        />

        <Text variant="titleLarge" style={styles.title}>
          Child's Details
        </Text>

        {/* First Name Input */}
        <TextInput
          label="First Name / Nickname"
          value={firstName}
          onChangeText={setFirstName}
          mode="outlined"
          style={styles.input}
        />

        {/* Birthday Section */}
        <Text variant="bodyMedium" style={styles.subtitle}>
          When is their birthday?
        </Text>

        {/* Month */}
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              style={styles.dropdown}
            >
              {selectedMonth || 'Select Month'}
            </Button>
          }
        >
          {months.map((month) => (
            <Menu.Item
              key={month}
              title={month}
              onPress={() => {
                setSelectedMonth(month);
                setMenuVisible(false);
              }}
            />
          ))}
        </Menu>

        {/* Year */}
        <TextInput
          label="Year"
          value={year}
          onChangeText={setYear}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />

        {/* Next */}
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
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    marginBottom: 10,
  },
  title: {
    marginTop: 80,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#fff7de',
  },
  subtitle: {
    marginBottom: 10,
  },
  dropdown: {
    marginBottom: 20,
    justifyContent: 'flex-start',
  },
  nextButton: {
    marginTop: 30,
    borderRadius: 8,
    backgroundColor: "#FDD652",
  },
});

export default AddChildDetails;
