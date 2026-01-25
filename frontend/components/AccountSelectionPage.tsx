import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
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
          console.log('Found cached profile, will validate and navigate to:', profile.type);
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
          
          // If user not found (404), they need to complete registration or log in again
          if (response.status === 404) {
            alert('Session expired or incomplete registration. Please log in again.');
            await supabase.auth.signOut();
            router.replace('/login');
            setLoading(false);
            return;
          }
          
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

        // Commented out auto-navigation to allow users to manually switch profiles
        // When user clicks avatar to switch profile, they should see all options
        // if (profileId) {
        //   const storedProfile = await AsyncStorage.getItem(`profile_${profileId}`);
        //   if (storedProfile) {
        //     const profile = JSON.parse(storedProfile);
        //     // Validate that this profile still exists in the fetched profiles
        //     const existingProfile = userOwnProfiles.find((p: Account) => p.id === profileId);
        //     if (existingProfile) {
        //       console.log('Auto-navigating to stored profile:', profile.type);
        //       if (profile.isLocked) {
        //         router.replace('/pin-entry');
        //       } else if (profile.type === 'therapist') {
        //         router.replace('/(therapist-tabs)/therapist-dashboard');
        //       } else if (profile.type === 'child') {
        //         router.replace('/child-dashboard');
        //       }
        //       setLoading(false);
        //       return;
        //     }
        //   }
        // }

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
        alert('Failed to load profiles. Please log in again.');
        await supabase.auth.signOut();
        router.replace('/login');
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
    const profileTypeLabel = account.type === 'parent' ? 'Parent' : account.type === 'child' ? 'Child' : 'Therapist';
    const avatarUrl = `https://ui-avatars.com/api/?name=${account.name}&size=200&background=random`;
    
    return (
      <TouchableOpacity
        key={account.id}
        style={styles.profileCard}
        onPress={() => handleAccountSelect(account)}
      >
        <View style={styles.avatarContainer}>
          {/* Profile Avatar */}
          <Image
            source={{ uri: avatarUrl }}
            style={styles.profileAvatar}
          />
          
          {/* Lock Icon Badge */}
          {account.isLocked && (
            <View style={styles.lockBadge}>
              <Feather name="lock" size={20} color="#000" />
            </View>
          )}
        </View>

        {/* Account Info */}
        <Text style={styles.accountName}>
          {account.name}
        </Text>
        <Text style={styles.accountType}>
          ({profileTypeLabel})
        </Text>
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
          <ScrollView contentContainerStyle={styles.profilesContainer} showsVerticalScrollIndicator={false}>
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
  profilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
  },
  profileCard: {
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 30,
    width: 120,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
  },
  lockBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  accountType: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default AccountSelectionPage;