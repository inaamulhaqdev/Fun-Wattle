import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';

export default function Settings() {

  return (
    <ScrollView style={styles.container}>
      <Button
        mode="contained"
        onPress={() => router.push('/parent/add-child-details')}
        style={styles.actionButton}
        contentStyle={{ paddingVertical: 8 }}
        textColor="black"
      >
        Add Child
      </Button>

      <Button
        mode="contained"
        onPress={() => router.push('/account-selection')}
        style={styles.actionButton}
        contentStyle={{ paddingVertical: 8 }}
        textColor="black"
      >
        Change Profile
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  childRow: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginVertical: 6,
  },
  selectedRow: {
    backgroundColor: "#c6e6ff",
    borderWidth: 1,
    borderColor: "#007aff",
  },
  childName: {
    fontSize: 16,
    fontWeight: "500",
  },
  actionButton: {
    marginTop: 20,
  }
});
