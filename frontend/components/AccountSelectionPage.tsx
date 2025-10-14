import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

// Account data structure
interface Account {
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
  // Add more accounts here as needed
  // {
  //   id: '2',
  //   name: 'Child Profile',
  //   type: 'child',
  //   isLocked: false,
  // },
  {
    id: '2',
    name: 'Alice 2.0',
    type: 'parent',
    isLocked: false,
  },
  {
    id: '2',
    name: 'Dwight',
    type: 'therapist',
    isLocked: false,
  },
];

const AccountSelectionPage = () => {
  const handleAccountSelect = (account: Account) => {
    if (account.isLocked) {
      // Navigate to PIN entry screen for locked accounts
      router.push('/pin-entry' as any);
      return;
    }
    
    // Navigate to main app with selected account
    console.log('Selected account:', account);
    if (account.type == "therapist") {
      router.replace('/(therapist-tabs)/therapist-dashboard');
    }
    if (account.type == "parent") {
      router.replace({
        pathname: '/(parent-tabs)/parent-dashboard',
        params: { variant: 'newParent' },
      });
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