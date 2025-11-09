import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { supabase } from '../config/supabase';
import { API_URL } from '../config/api';
import { useApp } from '../context/AppContext';

// Account data structure
export interface Account {
  id: string;
  name: string;
  type: 'parent' | 'child' | 'therapist';
  isLocked?: boolean;
}

// Placeholder accounts
const accounts: Account[] = [
  {
    id: '1',
    name: 'Alice',
    type: 'parent',
    isLocked: true,
  },
  {
    id: '2',
    name: 'Dwight',
    type: 'therapist',
    isLocked: true,
  },
  // Add more accounts here as needed
  // {
  //   id: '2',
  //   name: 'Child Profile',
  //   type: 'child',
  //   isLocked: false,
  // },
];

const AccountSelectionPage = () => {
  const { session, setProfile } = useApp(); // Here useApp provides session and lets us set profile and child id's
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [firstChild, setFirstChild] = useState<Account | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        if (!session) {
          Alert.alert('No active session', 'Please log in again.');
          router.replace('/login');
          return;
        }

        const user = session.user;

        const response = await fetch(`${API_URL}/profile/${user.id}/list/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch profiles (${response.status})`);
        }

        const data = await response.json();

        // Transform API data to match frontend Account type
        const transformedData = data.map((profile: any) => ({
          id: profile.id.toString(),
          name: profile.name,
          type: profile.profile_type,
          isLocked: profile.pin_hash ? true : false,
        }));

        setAccounts(transformedData);

        // Set the first child account if it exists
        const firstChildAccount = transformedData.find((profile: Account) => profile.type === 'child');
        if (firstChildAccount) {
          setFirstChild(firstChildAccount);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
        Alert.alert('Error', 'Failed to load profiles. Please try again.');
      }
    };

    fetchAccounts();
  }, [session]); // Re-run when session changes

  const handleAccountSelect = async (account: Account) => {
    // Store profile and child IDs in global context
    await setProfile(account.id, firstChild?.id);

    if (account.isLocked) {
      // Navigate to PIN entry screen for locked accounts
      router.push('/pin-entry');
      return;
    } else if (account.type === 'therapist') {
      router.replace('/therapist-dashboard');
      return;
    } else if (account.type === 'parent') {
      // Parent accounts must have PINs
      Alert.alert('Error', 'Parent accounts must have a PIN set. Please contact support.');
      return;
    } else {
      // Child accounts don't have PINs
      router.replace('/child-dashboard');
      return;
    }
  };

  const renderAccountCard = (account: Account) => {
    return (
      <TouchableOpacity
        key={account.id}
        style={styles.accountCard}
        onPress={() => handleAccountSelect(account)}
      >
        {/* Profile Icon */}
        <View style={styles.profileIcon}>
          <Feather name="user" size={24} color="#fff" />
        </View>

        {/* Account Info */}
        <Text style={styles.accountName}>
          {account.name} ({account.type === 'parent' ? 'Parent' : account.type === 'child' ? 'Child' : 'Therapist'})
        </Text>

        {/* Lock Icon */}
        {account.isLocked && (
          <View style={styles.lockIcon}>
            <Feather name="lock" size={20} color="#000" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Choose your profile</Text>

        <ScrollView style={styles.accountsList} showsVerticalScrollIndicator={false}>
          {accounts.map(account => renderAccountCard(account))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 40,
    textAlign: 'left',
  },
  accountsList: {
    flex: 1,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    minHeight: 80,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accountName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  lockIcon: {
    marginLeft: 12,
  },
});

export default AccountSelectionPage;