import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import NarrativeInferencingEx1 from '@/app/multiple_select';
import NarrativeInferencingEx2 from '@/app/narrative-inferencing-ex2';

export default function ExerciseScreen() {
  const { title, component } = useLocalSearchParams();

  const exerciseComponents: Record<string, React.ComponentType<any>> = {
    'Exercise1': NarrativeInferencingEx1,
    'Exercise2': NarrativeInferencingEx2,
  }

  const Component = component ? exerciseComponents[component as string] : null;

  return (
    <ScrollView style={styles.container}>
      <IconButton
        icon="arrow-left"
        size={30}
        onPress={() => router.back()}
      />
      <Text variant="headlineMedium">{title}</Text>
      {Component && <Component/>}
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