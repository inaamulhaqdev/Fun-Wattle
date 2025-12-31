import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Checkbox, IconButton, Button, Text } from 'react-native-paper';
import { supabase } from '../config/supabase';
import { API_URL } from '../config/api';

import { useChild } from '@/context/ChildContext';
import { useApp } from '@/context/AppContext';

export default function AddChildExtraQs() {

  const { childName, dateOfBirth, childTopGoal, childHomePracticeFrequency, childPreferredActivities, childMotivations, childAttendedTherapist } = useChild();
  const { selectChild } = useApp();

  const handleBack = () => {
    router.back();
  };

  const [loading, setLoading] = useState(false);

  const [consentChecked, setConsentChecked] = useState(false);

  const handleNext = async () => {

    if (!consentChecked) {
      Alert.alert('Consent Required', 'Please provide consent to proceed.');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      Alert.alert('No active session', 'Please log in again.');
      return;
    }

    const user = session.user;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/profile/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          creating_child_profile: true,
          name: childName,
          profile_picture: '',
          child_details: {
            date_of_birth: dateOfBirth,
            top_goal: childTopGoal,
            home_practice_frequency: childHomePracticeFrequency,
            preferred_activities: childPreferredActivities,
            motivations: childMotivations,
            attended_therapist: childAttendedTherapist,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Profile creation failed:', response.status, errorText);
        setLoading(false);
        Alert.alert('Child Profile Creation Error', `Profile Creation failed (${response.status}). Please try again and contact support if the issue persists.`);
        return;
      }

      const responseData = await response.json();
      console.log('Profile creation response:', responseData);
      const newChildProfile = responseData.profile;
      
      // Set the newly created child as the active child
      await selectChild(newChildProfile);

      // Navigate to child added confirmation
      router.replace('/child-onboarding/child-added');
    } catch (error) {
      Alert.alert('Child Profile Creation Error', 'Child Profile Creation failed. Please try again and contact support if the issue persists.');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.headerRow}>
        <IconButton
          icon="arrow-left"
          size={28}
          onPress={handleBack}
        />
        <Text style={styles.title}>Consent Confirmation</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.middleContainer}>
          <Text variant="bodyLarge" style={styles.centeredText}>{'\u2022 '}I give {childName} permission to use FunWattle on this device and on other linked devices.</Text>
        </View>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setConsentChecked(!consentChecked)}
        >
          <Checkbox.Android
            status={consentChecked ? 'checked' : 'unchecked'}
            color="#FD902B"
          />
          <Text style={styles.checkboxLabel}>I consent to the statement above</Text>
        </TouchableOpacity>

        <Button
          mode="contained"
          style={styles.nextButton}
          onPress={handleNext}
          contentStyle={{ paddingVertical: 8 }}
          textColor="black"
          disabled={!consentChecked || loading}
        >
          {loading ? 'Submitting...' : 'Agree & Continue'}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 50
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingLeft: 10
  },
  middleContainer: {
    paddingVertical: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredText: {
    textAlign: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  nextButton: {
    marginTop: 200,
    borderRadius: 8,
    backgroundColor: "#fd9029",
  },
});
