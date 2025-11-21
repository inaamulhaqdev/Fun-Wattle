import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, FlatList } from "react-native";
import { API_URL } from "@/config/api";
import { useApp } from "@/context/AppContext";
import { router } from "expo-router";

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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FD902B" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#000' : '#fff' }]}>
      <Text style={[styles.header, { color: darkMode ? '#fff' : '#000' }]}>Your Child Profiles</Text>

      <FlatList
        data={children}
        keyExtractor={(child) => child.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.childOption,
              item.id === childId && styles.activeChild
            ]}
            onPress={() => 
              handleSelect(item)
            }
          >
            <Text style={styles.childName}>{item.name}</Text>
            {item.id === childId && <Text style={styles.currentLabel}>Current</Text>}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#fff" 
  },
  center: { 
    flex: 1,
    justifyContent: "center", 
    alignItems: "center" 
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
  },
  childOption: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activeChild: {
    backgroundColor: "#FFE6D4",
    borderWidth: 1,
    borderColor: "#fd9029",
  },
  childName: {
    fontSize: 17,
  },
  currentLabel: {
    fontSize: 14,
    color: "#ff8819ff",
    fontWeight: "600",
  },
});
