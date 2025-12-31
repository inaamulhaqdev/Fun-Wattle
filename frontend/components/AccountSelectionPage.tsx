import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const AccountSelectionPage = () => {
  const { session, setProfile, profileId, childId } = useApp(); // Here useApp provides session and lets us set profile and child id's
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      // Don't fetch if there's no session - just redirect to login
      if (!session) {
        console.log('No session, redirecting to login');
        router.replace('/login');
        setLoading(false);
        return;
      }

      // Check if user has a stored profile and navigate directly
      if (profileId) {
        const storedProfile = await AsyncStorage.getItem(`profile_${profileId}`);
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          console.log('Found cached profile, navigating to:', profile.type);
          // Note: We'll validate this against fetched profiles below before using it
        } else {
          console.log('No cached profile, fetching from API to determine profile type');
        }
      }

      setLoading(true);
      try {

        const user = session.user;
        console.log('Fetching profiles for user:', user.id);
        console.log('API_URL:', API_URL);

        const response = await fetch(`${API_URL}/profile/${user.id}/list/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          }
        });
        
        console.log('Profile fetch response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch profiles:', response.status, errorText);
          throw new Error(`Failed to fetch profiles (${response.status})`);
        }

        const data = await response.json();
        console.log('Fetched profiles data:', data);

        // If no profiles exist, redirect to membership/profile creation
        if (data.length === 0) {
          console.log('No profiles found, redirecting to membership');
          router.replace('/membership');
          setLoading(false);
          return;
        }

        // Transform API data to match frontend Account type
        const transformedData = data.map((profile: any) => ({
          id: profile.id.toString(),
          name: profile.name,
          type: profile.profile_type,
          isLocked: profile.pin_hash ? true : false,
        }));

        // Filter profiles based on user type
        // Therapists should only see their own therapist profile, not child profiles
        const userOwnProfiles = transformedData.filter((profile: Account) => {
          // If there's a therapist profile, only show parent/therapist profiles (not children)
          const hasTherapistProfile = transformedData.some((p: Account) => p.type === 'therapist');
          if (hasTherapistProfile) {
            return profile.type !== 'child';
          }
          // Otherwise (parent user), show all profiles
          return true;
        });

        setAccounts(userOwnProfiles);

        // Don't auto-navigate for returning users - let them choose their profile
        // This was causing automatic profile selection when user taps avatar

        // Determine which child to select (only for parent users)
        const childAccounts = userOwnProfiles.filter((profile: Account) => profile.type === 'child');
        
        if (childAccounts.length > 0) {
          // If there's already a childId in context and it exists in the list, use it
          if (childId && childAccounts.some((child: Account) => child.id === childId)) {
            setSelectedChildId(childId);
          } else {
            // Otherwise, use the most recently created child (last in the list)
            const lastChild = childAccounts[childAccounts.length - 1];
            setSelectedChildId(lastChild.id);
          }
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
        alert('Error\n\nFailed to load profiles. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [session, childId]); // Re-run when session changes

  const handleAccountSelect = async (account: Account) => {
    // Store profile and child IDs in global context
    await setProfile(account.id, selectedChildId || undefined);

    // Store profile details for quick navigation on app restart
    await AsyncStorage.setItem(`profile_${account.id}`, JSON.stringify({
      type: account.type,
      isLocked: account.isLocked,
      name: account.name
    }));

    if (account.isLocked) {
      // Navigate to PIN entry screen for locked accounts
      router.push('/pin-entry');
      return;
    } else if (account.type === 'therapist') {
      // Mark intro as seen for therapist
      await AsyncStorage.setItem(`parent_intro_seen_${account.id}`, 'true');
      router.replace('/(therapist-tabs)/therapist-dashboard');
      return;
    } else if (account.type === 'parent') {
      // Parent accounts must have PINs
      alert('Error\n\nParent accounts must have a PIN set. Please contact support.');
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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FD902B" />
          </View>
        ) : (
          <ScrollView style={styles.accountsList} showsVerticalScrollIndicator={false}>
            {accounts.map(account => renderAccountCard(account))}
          </ScrollView>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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