import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useApp } from "@/context/AppContext";
import { supabase } from '@/config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsPage = () => {

  const { darkMode, setDarkMode, selectedChild, profileId } = useApp();
  const [soundEnabled, setSoundEnabled] = useState(true); 

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Error', 'Failed to sign out. Please try again.');
        console.error('Sign out error:', error);
        return;
      }
      // Navigate to welcome page after successful sign out
      router.replace('/welcome');
    } catch (error) {
      console.error('Sign out exception:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  type SettingItemProps = {
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  };

  const SettingItem: React.FC<SettingItemProps> = ({ title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: darkMode ? '#555' : '#f0f0f0' }]} 
      onPress={onPress}
    >
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: darkMode ? '#fff' : '#000' }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: darkMode ? '#aaa' : '#666' }]}>{subtitle}</Text>}
      </View>
      {rightComponent || <Feather name="chevron-right" size={20} color={darkMode ? '#fff' : '#666'} />}
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: darkMode ? '#000' : '#f8f9fa' }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings for {selectedChild?.name || 'Child'}</Text>
        </View>

        <ScrollView style={[styles.content, { backgroundColor: darkMode ? '#000' : '#f8f9fa' }]}>
          
          {/* Child-Specific Settings Section */}
          <View style={[styles.section, { backgroundColor: darkMode ? '#1a1a1a' : '#fff' }]}>
            <SettingItem
              title="Assess your child"
              onPress={() => Alert.alert('Coming Soon', 'Child assessment feature is coming soon!')}
            />

            <SettingItem
              title="Set goals"
              onPress={() => Alert.alert('Coming Soon', 'Goal setting feature is coming soon!')}
            />

            <SettingItem
              title="Set reminders"
              onPress={() => Alert.alert('Coming Soon', 'Reminders feature is coming soon!')}
            />

            <SettingItem
              title="Add/edit therapist"
              onPress={() => router.push('/link-therapist')}
            />
          </View>

          {/* General Settings Header */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeaderText, { color: darkMode ? '#aaa' : '#666' }]}>General settings</Text>
          </View>

          {/* General Settings Section */}
          <View style={[styles.section, { backgroundColor: darkMode ? '#1a1a1a' : '#fff' }]}>
            <SettingItem
              title="Switch child"
              onPress={() => router.push('/switch-child')}
            />

            <SettingItem
              title="Manage account"
              onPress={() => Alert.alert('Coming Soon', 'Account management feature is coming soon!')}
            />

            <SettingItem
              title="Support"
              onPress={() => Alert.alert('Coming Soon', 'Support feature is coming soon!')}
            />
          </View>

          {/* Log out Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
              <Text style={[styles.logoutText, { color: darkMode ? '#fff' : '#ff4444' }]}>Log out</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom padding */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fd9029',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 0,
    paddingVertical: 0,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  logoutContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4444',
  },
});

export default SettingsPage;
