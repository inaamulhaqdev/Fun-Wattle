import React, { useState, useEffect } from "react";
import { StyleSheet, Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, ActivityIndicator } from "react-native-paper";
import Filters from "@/components/parent/Filters";
import AddChild from '@/components/AddChildCard';
import { supabase } from '@/config/supabase';
import { API_URL } from '@/config/api';

import { Account } from '@/components/AccountSelectionPage';

export default function ParentDashboard() {
  const [loading, setLoading] = useState(true);
  const [parentName, setParentName] = useState('');
  const [selectedChild, setSelectedChild] = useState('');

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          Alert.alert('No active session', 'Please log in again.');
          return;
        }

        const user = session.user;
        const response = await fetch(`${API_URL}/api/profiles/${user.id}/`);
        if (!response.ok) throw new Error(`Failed to fetch profiles (${response.status})`);

        const data = await response.json();

        // Transform API data to match frontend Account type
        const transformedData: Account[] = data.map((profile: any) => ({
          id: profile.id.toString(),
          name: profile.name,
          type: profile.profile_type,
          isLocked: !!profile.pin_hash,
        }));

        const parentProfile = transformedData.find(profile => profile.type === 'parent');
        if (parentProfile) setParentName(parentProfile.name);

        const firstChildProfile = transformedData.find(profile => profile.type === 'child');
        if (firstChildProfile) setSelectedChild(firstChildProfile.name);

      } catch (error) {
        console.error('Error fetching profiles:', error);
        Alert.alert('Error', 'Failed to load profiles. Please try again.');
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
      {!selectedChild ? (
        <>
          <Text variant='titleLarge' style={styles.title}>Welcome, {parentName}!</Text>
          <AddChild />
        </>
      ) : (
        <>
          <Text variant='titleLarge' style={styles.title}>Good evening, {parentName}!</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>{selectedChild}&apos;s progress this week.</Text>
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
