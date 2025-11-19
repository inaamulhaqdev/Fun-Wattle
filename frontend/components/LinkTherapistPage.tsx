import React, { useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Card, Text, Searchbar } from 'react-native-paper';
import { useFocusEffect, router } from 'expo-router';
import { useApp } from '../context/AppContext';
import { API_URL } from '@/config/api';

type Therapist = {
  profileId: string;
  name: string;
};

function matchesFilters(
  item: Therapist,
  searchQuery: string,
) {
  const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

  if (!matchesSearch) {
    return false;
  }

  return matchesSearch;
}

export default function LinkTherapistPage() {
  const { selectedChild, childId, session } = useApp();
  const userId = session.user.id;

  const [loading, setLoading] = useState(true);

  const [therapistProfiles, setTherapistProfiles] = useState<Therapist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLinkTherapist = async (therapistId: string) => {      
    try {
      const response = await fetch(`${API_URL}/therapist/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          therapist_id: therapistId,
          child: childId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to link therapist to child: ${response.status}`);
      }

      Alert.alert('Success', 'Child successfully linked to therapist!');

      // Navigate back to settings after successful linking
      router.push('/(parent-tabs)/settings');

    } catch (error) {
      console.error('Error linking therapist to child:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchTherapists = async () => {
        try {
          const response = await fetch(`${API_URL}/therapist/`, { method: 'GET' });
          if (!response.ok) throw new Error(`Failed to fetch therapist profiles (${response.status})`);

          const data = await response.json();

          console.log("Data:", data);

          const therapists: Therapist[] = data.map((therapist: any) => ({
            profileId: therapist.id,
            name: therapist.name,
          }));

          console.log("Transformed data:", therapists);

          setTherapistProfiles(therapists);
        } catch (err) {
          console.error('Error fetching therapist profiles:', err);
          Alert.alert('Error', 'Failed to load therapist profiles.');
        } finally {
          setLoading(false);
        }
      };
      fetchTherapists();
    }, [childId, userId])
  );

  // Library view
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assign a Therapist to {selectedChild.name}</Text>

      <Searchbar
        placeholder="Search therapists..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchbar}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD902B" />
        </View>
      ) : (
        <FlatList
          data={therapistProfiles.filter(item => matchesFilters(item, searchQuery))}
          keyExtractor={item => item.profileId}
          renderItem={({ item }) => {
            return (
              <Card style={styles.card} onPress={() => {handleLinkTherapist(item.profileId)}}>
                <Card.Title title={item.name} />
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    alignContent: 'center'
  },
  searchbar: {
    marginTop: 30,
    marginBottom: 20,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fd9029',
    width: '48%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    marginTop: 20,
    fontWeight: '600',
    color: '#000',
    alignSelf: 'center'
  },
});