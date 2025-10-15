import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { getAuth } from 'firebase/auth';

// Account data structure
interface Account {
  id: string;
  name: string;
  type: 'parent' | 'child' | 'therapist';
  isLocked?: boolean;
}

const AccountSelectionPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          Alert.alert('Not signed in', 'Please log in again.');
          return;
        }

        const response = await fetch(`http://192.168.0.234:8000/api/profile/${user.uid}/`, {
          method: 'GET',
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
      } catch (error) {
        console.error('Error fetching profiles:', error);
        Alert.alert('Error', 'Failed to load profiles. Please try again.');
      }
    };

    fetchAccounts();
  }, []);

  const handleAccountSelect = (account: Account) => {
    if (account.isLocked) {
      // Navigate to PIN entry screen for locked accounts
      router.push({ pathname: '/pin-entry', params: { id: account.id } });
      return;
    }

    // Navigate based on account type
    if (account.type === 'child') {
      router.replace({ pathname: '/child-dashboard', params: { id: account.id } });
    } else if (account.type === 'parent') {
      router.replace({ pathname: '/(tabs)/parent-dashboard', params: { id: account.id } });
    } else {
      // Default fallback for therapist or other types
      router.replace({ pathname: '/(tabs)/therapist-dashboard', params: { id: account.id } });
      // router.replace('/(tabs)/' as any); KEPT JUST IN CASE
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