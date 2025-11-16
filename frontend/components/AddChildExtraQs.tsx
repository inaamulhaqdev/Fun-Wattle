import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { IconButton, Button, Text } from 'react-native-paper';
import { useChild } from '@/context/ChildContext';

export default function AddChildExtraQs() {

  const { childName } = useChild();

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push('/parent/child-routine');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <IconButton
          icon="arrow-left"
          size={28}
          onPress={handleBack}
        />
        <Text style={styles.title}>Questions about speech and communication based on previous responses</Text>
      </View>

      <View style={styles.middleContainer}>
        <Text variant="headlineSmall" style={styles.centeredText}>To be determined</Text>
      </View>

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
    marginTop: 30,
    fontSize: 20,
    paddingRight: 40,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  middleContainer: {
    paddingVertical: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredText: {
    textAlign: 'center',
    fontWeight: 'bold'
  },
  nextButton: {
    marginTop: 200,
    borderRadius: 8,
    backgroundColor: "#fd9029",
  },
});
