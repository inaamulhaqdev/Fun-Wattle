import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Menu, DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import Filters from "../../components/parent/Filters";
import { supabase } from '@/config/supabase';
import { API_URL } from '@/config/api';
import { Account } from '@/components/AccountSelectionPage';

export default function TherapistDashboard() {
  const [loading, setLoading] = useState(true);
  const [therapistName, setTherapistName] = useState('');
  const [childList, setChildList] = useState<string[]>([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [menuVisible, setMenuVisible] = React.useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          Alert.alert('No active session', 'Please log in again.');
          return;
        }

        const user = session.user;
        const response = await fetch(`${API_URL}/api/profiles/${user.id}/`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });
        if (!response.ok) throw new Error(`Failed to fetch profiles (${response.status})`);

        const data = await response.json();

        // Transform API data to match frontend Account type
        const transformedData: Account[] = data.map((profile: any) => ({
          id: profile.id.toString(),
          name: profile.name,
          type: profile.profile_type,
          isLocked: !!profile.pin_hash,
        }));

        const therapistProfile = transformedData.find(profile => profile.type === 'therapist');
        if (therapistProfile) setTherapistName(therapistProfile.name);

        const children = transformedData.filter(p => p.type === 'child').map(p => p.name);
        setChildList(children);

        if (children.length > 0) setSelectedChild(children[0]);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        Alert.alert('Error', 'Failed to load profiles. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#FD902B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <PaperProvider theme={DefaultTheme}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Good evening, {therapistName}!</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.subtitleRow}>
            {childList.length > 0 ? (
              <>
                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={
                    <TouchableOpacity style={styles.childButton} onPress={() => setMenuVisible(true)}>
                      <Text style={styles.childText}>{selectedChild}</Text>
                    </TouchableOpacity>
                  }
                  style={styles.menuContainer}
                >
                  {childList.map((child) => (
                    <Menu.Item
                      key={child}
                      onPress={() => {
                        setSelectedChild(child);
                        setMenuVisible(false);
                      }}
                      title={child}
                      titleStyle={{ color: "#000000ff", fontWeight: "500" }}
                      style={{ backgroundColor: "#f7f7f7", borderRadius: 10 }}
                    />
                  ))}
                </Menu>

                <Text variant="bodyMedium" style={styles.subtitle}>&apos;s progress this week.</Text>
              </>
            ) : (
              <Text variant="bodyMedium" style={styles.subtitle}>No children assigned yet.</Text>
            )}
          </View>
          {childList.length > 0 && <Filters />}
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffff",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  subtitleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 5,
  },
  childText: {
    fontWeight: "600",
    color: "black",
  },
  childButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  subtitle: {
    fontWeight: "400",
    color: "black",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  header: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  }
});