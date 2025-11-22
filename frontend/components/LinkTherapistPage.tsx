import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Card, Text, Searchbar } from 'react-native-paper';
import { useFocusEffect, router } from 'expo-router';
import { useApp } from '../context/AppContext';
import { API_URL } from '@/config/api';
import AddChild from '@/components/ui/AddChildCard';

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
  const { darkMode, selectedChild, childId, session } = useApp();
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
          therapist: therapistId,
          child: childId,
        }),
      });

      if (!response.ok) {
        let message = 'An error occurred with linking therapist';
        
        switch (response.status) {
          case 400:
            message = `This therapist is already assigned to ${selectedChild.name}`;
            break;
          case 404:
            message = 'Profile not found';
            break;
          default:
            message = `Unexpected error: ${response.status}`;
        }
        Alert.alert('Error', message);
        return;
      }

      Alert.alert('Success', `Therapist successfully assigned to ${selectedChild.name}!`);

      // Navigate back to settings after successful linking
      router.push('/(parent-tabs)/settings');

    } catch (error: any) {
      console.error('Error linking therapist to child:', error);
      Alert.alert('Error', error.message);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchTherapists = async () => {
        try {
          const response = await fetch(`${API_URL}/therapist/`, { method: 'GET' });
          if (!response.ok) throw new Error(`Failed to fetch therapist profiles (${response.status})`);

          const data = await response.json();

          const therapists: Therapist[] = data.map((therapist: any) => ({
            profileId: therapist.id,
            name: therapist.name,
          }));

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

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#000' : '#fff' }]}>
      {!childId? (
        <Text style={[styles.title, { color: darkMode ? '#fff' : '#000' }]}>Assign a Therapist</Text>
      ) : (
        <Text style={[styles.title, { color: darkMode ? '#fff' : '#000' }]}>Assign a Therapist to {selectedChild.name}</Text>
      )}

      <Searchbar
        placeholder="Search therapists..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={[styles.searchbar, { backgroundColor: darkMode ? '#404040ff' : '#fff' }]}
      />

      {!childId ? (
        <AddChild />
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD902B" />
        </View>
      ) : (
        <FlatList
          data={therapistProfiles.filter(item => matchesFilters(item, searchQuery))}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyExtractor={item => item.profileId}
          renderItem={({ item }) => {
            return (
              <Card style={[styles.card, { backgroundColor: darkMode ? '#9f4d00ff' : '#ffaf65ff' }]} onPress={() => {handleLinkTherapist(item.profileId)}}>
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
    borderColor: '#fd9029',
    borderWidth: 2,
    width: '90%',
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    marginTop: 10,
    fontWeight: '600',
    color: '#000',
    alignSelf: 'center'
  },
});