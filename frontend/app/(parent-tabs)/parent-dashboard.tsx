import React, { useState, useEffect } from "react";
import { StyleSheet, Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, ActivityIndicator } from "react-native-paper";
import Filters from "@/components/parent/Filters";
import AddChild from '@/components/AddChildCard';
import { API_URL } from '@/config/api';
import { Account } from '@/components/AccountSelectionPage';
import { useApp } from '@/context/AppContext';
import { router } from "expo-router";

export default function ParentDashboard() {
  const { profileId, childId, session } = useApp();
  const [loading, setLoading] = useState(true);
  const [parentName, setParentName] = useState('');
  const [selectedChildName, setSelectedChildName] = useState('');

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        if (!session) {
          Alert.alert('No active session', 'Please log in again.');
          router.replace('/login');
          return;
        }

        // Get parent profile
        const parentProfileResponse = await fetch(`${API_URL}/api/profile/${profileId}/`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });
        if (!parentProfileResponse.ok) {
          throw new Error(`Failed to fetch parent profile (${parentProfileResponse.status})`);
        }
        const parentProfileData = await parentProfileResponse.json();
        setParentName(parentProfileData.name);

        // Get selected child profile
        const selectedChildResponse = await fetch(`${API_URL}/api/profile/${childId}/`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });
        if (!selectedChildResponse.ok) {
          throw new Error(`Failed to fetch child profile (${selectedChildResponse.status})`);
        }
        const selectedChildData = await selectedChildResponse.json();
        setSelectedChildName(selectedChildData.name);

      } catch (error: any) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#FD902B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!selectedChildName ? (
        <>
          <Text variant='titleLarge' style={styles.title}>Welcome, {parentName}!</Text>
          <AddChild />
        </>
      ) : (
        <>
          <Text variant='titleLarge' style={styles.title}>Good evening, {parentName}!</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>{selectedChildName}&apos;s progress this week.</Text>
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
