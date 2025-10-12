import React from "react";
import { useRouter } from "expo-router";
import { View, StyleSheet } from "react-native";
 import { Text, Provider as PaperProvider } from "react-native-paper";

const TherapistDashboard = () => {
  return (
    <PaperProvider>
      <View style={styles.container}>
        <View>
          <ProfileCircle initials="FW" />
        </View>
      </View>

      <View>
        <Text variant="headlineMedium">Good morning!</Text>
        <Text variant="bodyMedium">Here is your schedule for today.</Text>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TherapistDashboard;  