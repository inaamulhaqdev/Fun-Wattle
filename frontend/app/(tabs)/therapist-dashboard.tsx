import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import Filters from "../../components/parent/Filters";
import { useRouter } from "expo-router";

export default function TherapistDashboard() {
  let therapist_user = "Dwight";
  let selected_child = "Phillip";

  return (
    <SafeAreaView style={styles.container}>
      <Text variant='titleLarge' style={styles.title}>Good evening, {therapist_user}!</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>{selected_child}&apos;s progress this week.</Text>
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
