import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { router, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';

const SettingsPage = () => {
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const { darkMode, setDarkMode } = useApp(); 

  type SettingItemProps = {
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  };

  const SettingItem: React.FC<SettingItemProps> = ({ title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: darkMode ? '#fff' : '#000' }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: darkMode ? '#fff' : '#000' }]}>{subtitle}</Text>}
      </View>
      {rightComponent || <Feather name="chevron-right" size={20} color={darkMode ? '#fff' : '#000'} />}
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: darkMode ? '#000' : '#f8f9fa' }]}>
        {/* Header */}
        <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: darkMode ? '#000' : '#fff' }]}>
        {/* General Settings */}
        <View style={[styles.section, { backgroundColor: darkMode ? '#393939ff' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#000' }]}>General</Text>
          
          <SettingItem
            title="Sound Effects"
            subtitle="Enable app sounds and music"
            rightComponent={
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: '#ddd', true: '#4CAF50' }}
                thumbColor={soundEnabled ? '#fff' : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* Accessibility Settings */}
        <View style={[styles.section, { backgroundColor: darkMode ? '#393939ff' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#000' }]}>Accessibility</Text>
          
          <SettingItem
            title="Dark Mode"
            subtitle="Switch between light and dark mode"
            rightComponent={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#ddd', true: '#4CAF50' }}
                thumbColor={darkMode ? '#fff' : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* Support & Info */}
        <View style={[styles.section, { backgroundColor: darkMode ? '#393939ff' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#000' }]}>Support & Information</Text>
          
          <SettingItem
            title="Help & FAQ"
            subtitle="Get help with common questions"
            onPress={() => {/* Navigate to help */}}
          />

          <SettingItem
            title="Contact Support"
            subtitle="Get in touch with our team"
            onPress={() => {/* Navigate to support */}}
          />

          <SettingItem
            title="Privacy Policy"
            subtitle="Learn about data usage"
            onPress={() => {/* Navigate to privacy policy */}}
          />

          <SettingItem
            title="About"
            subtitle="App version and information"
            onPress={() => {/* Navigate to about */}}
          />
        </View>

        {/* Logout Section */}
        <View style={[styles.section, { backgroundColor: darkMode ? '#000' : '#f8f9fa' }]}>
          <TouchableOpacity style={styles.logoutButton} onPress={() => router.push('/account-selection')}>
            <Text style={styles.logoutText}>Sign Out</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFB366',
    paddingVertical: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navButton: {
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default SettingsPage;