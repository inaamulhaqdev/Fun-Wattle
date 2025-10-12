import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import Filters from "../../components/parent/Filters";

export default function ParentDashboard() {
  let parent_user = "Alice";
  let selected_child = "Alex";

  return (
    <SafeAreaView style={styles.container}>
      <Text variant='titleLarge' style={styles.title}>Good evening, {parent_user}!</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>{selected_child}'s progress this week.</Text>
      <Filters />
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
    paddingTop: "10%",
    fontWeight: "bold",
    color: "black",
  },
  subtitle: {
    color: "black",
    paddingTop: 5,
    fontSize: 15,
  }
});
