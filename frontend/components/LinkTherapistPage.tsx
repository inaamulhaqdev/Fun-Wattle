import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
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
  const userId = session?.user?.id;

  const [loading, setLoading] = useState(true);

  const [therapistProfiles, setTherapistProfiles] = useState<Therapist[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');

  // Redirect if no session
  useEffect(() => {
    if (!session) {
      router.replace('/welcome');
    }
  }, [session]);

  const showSnackbar = (message: string, type: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch(`${API_URL}/profile/${userId}/list/`, {
          headers: { 
            'Authorization': `Bearer ${session.access_token}`
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch profiles`);
        }

        const profiles = await response.json();

        const childProfiles = profiles.filter((p: any) => p.profile_type === "child");

        setChildren(childProfiles);
      } catch (err: any) {
        Alert.alert("Error", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleLinkTherapist = async (therapistId: string) => {      
    try {
      console.log('Linking therapist:', { therapistId, childId, selectedChild });
      
      const requestBody = {
        therapist: therapistId,
        child: childId,
      };
      console.log('Request body:', requestBody);
      
      const response = await fetch(`${API_URL}/therapist/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Link therapist error:', response.status, errorData);
        
        let message = 'An error occurred with linking therapist';
        
        // Use backend error message if available
        if (errorData.error) {
          if (errorData.error === 'Profile connection exists') {
            message = `This therapist is already assigned to ${selectedChild?.name || 'this child'}`;
          } else if (errorData.error === 'Either not found') {
            message = 'Profile not found. Please try again.';
          } else if (errorData.error === 'Therapist not found') {
            message = 'Therapist profile not found.';
          } else {
            message = errorData.error;
          }
        } else {
          // Fallback to status code messages
          switch (response.status) {
            case 400:
              message = `Unable to link therapist to ${selectedChild?.name || 'child'}`;
              break;
            case 404:
              message = 'Profile not found';
              break;
            default:
              message = `Unexpected error: ${response.status}`;
          }
        }
        
        console.log('Showing alert with message:', message);
        showSnackbar(message, 'error');
        return;
      }

      const successData = await response.json();
      console.log('Success response:', successData);
      showSnackbar(`Therapist successfully assigned to ${selectedChild?.name || 'child'}!`, 'success');

      // Navigate back to settings after successful linking
      setTimeout(() => {
        router.push('/(parent-tabs)/settings');
      }, 1500);

    } catch (error: any) {
      console.error('Error linking therapist to child:', error);
      showSnackbar(error.message || 'An unexpected error occurred', 'error');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchTherapists = async () => {
        if (!userId) return;
        
        try {
          const response = await fetch(`${API_URL}/therapist/`, { method: 'GET' });
          if (!response.ok) throw new Error(`Failed to fetch therapist profiles (${response.status})`);

          const data = await response.json();
          console.log('Fetched therapists:', data);

          const therapists: Therapist[] = data.map((therapist: any) => ({
            profileId: therapist.id.toString(),
            name: therapist.name,
          }));
          
          console.log('Mapped therapists:', therapists);
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

  // Guard after all hooks
  if (!session) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#000' : '#fff' }]}>
      {children.length === 0 ? (
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD902B" />
        </View>
      ) : children.length === 0 ? (
        <AddChild />
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

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{
          backgroundColor: snackbarType === 'error' ? '#d32f2f' : '#4caf50',
        }}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>{snackbarMessage}</Text>
      </Snackbar>
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