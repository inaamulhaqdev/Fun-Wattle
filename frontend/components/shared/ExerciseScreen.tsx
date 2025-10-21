import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

export default function ExerciseScreen({ route, navigation }: { route: any; navigation: any }) {
  const { exercise } = route.params;

  return (
    <ScrollView style={styles.container}>
      <IconButton
        icon="arrow-left"
        size={30}
        onPress={() => navigation.goBack()}
      />
      <Text variant="headlineMedium">{exercise.title}</Text>
      <exercise.component />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff7de',
  },
});