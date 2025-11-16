import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';

export default function Settings() {

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <Button
          mode="contained"
          onPress={() => router.push('/parent/add-child-details')}
          style={styles.actionButton}
          contentStyle={{ paddingVertical: 8 }}
          textColor="white"
        >
          Add Child
        </Button>

        <Button
          mode="contained"
          onPress={() => router.push('/account-selection')}
          style={styles.actionButton}
          contentStyle={{ paddingVertical: 8 }}
          textColor="white"
        >
          Change Profile
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  actionButton: {
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: '#fd9029',
  }
});
