import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from "react-native";
import { ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from "@/config/api";
import { useApp } from "@/context/AppContext";
import { router } from "expo-router";
import AddChild from '@/components/ui/AddChildCard';

export default function SwitchChildPage() {
  const { darkMode, session, childId, selectChild } = useApp();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = session.user.id;

  useEffect(() => {
    const fetchProfiles = async () => {
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

  const handleSelect = async (child: any) => {
    await selectChild(child);
    router.replace('/parent-dashboard');
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FD902B" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#000' : '#fff' }]}>
      {children.length == 0 ? (
        <AddChild />
      ) : (
        <ScrollView contentContainerStyle={styles.profilesContainer}>
          {children.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={styles.profileCard}
              onPress={() => handleSelect(child)}
            >
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: child.avatar_url || `https://ui-avatars.com/api/?name=${child.name}&size=200&background=random` }}
                  style={styles.avatar}
                />
                {child.id === childId && (
                  <View style={styles.activeBadge}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                )}
              </View>
              <Text style={[styles.profileName, { color: darkMode ? '#fff' : '#000' }]}>
                {child.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#fff" 
  },
  loading: { 
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: "center", 
    alignItems: "center" 
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
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
  },
  activeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
