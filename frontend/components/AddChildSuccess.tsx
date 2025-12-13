import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Text } from 'react-native-paper';

import { useChild } from '@/context/ChildContext';

export default function AddChildSuccess() {

  const { childName } = useChild();

  const handleNext = () => {
    router.push('/account-selection');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{childName} is now ready to have fun with FunWattle!</Text>

      <Button
          mode="contained"
          style={styles.nextButton}
          onPress={handleNext}
          contentStyle={{ paddingVertical: 8 }}
          textColor="black"
        >
          Continue
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
  title: {
    fontSize: 25,
    marginTop: "50%",
    paddingBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  nextButton: {
    marginTop: 30,
    borderRadius: 8,
    backgroundColor: "#fd9029",
  },
});
