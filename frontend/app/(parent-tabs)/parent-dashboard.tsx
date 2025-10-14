import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import Filters from "@/components/parent/Filters";
import { useLocalSearchParams } from "expo-router";
import AddChild from '@/components/AddChildCard';

export default function ParentDashboard() {
  const params = useLocalSearchParams<{ variant?: string }>();
  const variant = params.variant;

  let parent_user = "Alice";
  let selected_child = "Alex";

  return (
    <SafeAreaView style={styles.container}>
      {variant === 'newParent' ? (
        <>
          <Text variant='titleLarge' style={styles.title}>Welcome, {parent_user}!</Text>
          <AddChild/>
        </>
      ) : (
        <>
          <Text variant='titleLarge' style={styles.title}>Good evening, {parent_user}!</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>{selected_child}&apos;s progress this week.</Text>
          <Filters />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#fff7de",
  },
  title: {
    paddingTop: "20%",
    fontWeight: "bold",
    color: "black",
  },
  subtitle: {
    color: "black",
    paddingTop: 5,
    fontSize: 15,
  }
});
