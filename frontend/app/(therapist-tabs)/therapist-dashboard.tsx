import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Text, DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import Filters from "../../components/home_screen/CategoryFilters";
import { supabase } from '@/config/supabase';
import { API_URL } from '@/config/api';
import { Account } from '@/components/AccountSelectionPage';
import { useApp } from '@/context/AppContext';
import { useFocusEffect } from "expo-router";
import { AssignedLearningUnit } from "@/types/learningUnitTypes";
import { fetchUnitStats } from "@/components/util/fetchUnitStats";

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);

  return date.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning"; 
  if (hour < 18) return "Good afternoon"; 
  return "Good evening"; 
}

export default function TherapistDashboard() {
  const { childId, session, selectChild } = useApp();
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [therapistName, setTherapistName] = useState('');
  const [childList, setChildList] = useState<Account[]>([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [data, setData] = useState<AssignedLearningUnit[]>([]);
  const [firstLoad, setFirstLoad] = useState(true);
  const [switchChild, setSwitchChild] = useState(false);

  const [greeting, setGreeting] = useState(getGreeting());

  // every 60 seconds, checks if the greeting should be changed according to time (eg. app left open, time switches from morning to midday; greeting changes to 'Good afternoon' without reload)
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60 * 1000); 

    return () => clearInterval(interval); 
  }, []);

  const { darkMode } = useApp();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          Alert.alert('No active session', 'Please log in again.');
          return;
        }

        const user = session.user;
        const response = await fetch(`${API_URL}/profile/${user.id}/list/`, {
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

        const childrenFull = transformedData.filter(p => p.type === 'child');
        setChildList(childrenFull);
        if (childrenFull.length > 0) {
          const initialChild = childrenFull[0];
          selectChild({
            id: initialChild.id,
            name: initialChild.name,
            type: initialChild.type,
          });
        }

      } catch (error) {
        console.error('Error fetching profiles:', error);
        Alert.alert('Error', 'Failed to load profiles. Please try again.');
      } finally {
        setLoadingProfiles(false);
      }
    };

    fetchProfiles();
  }, []);

  const userId = session.user.id
  const fetchAssignments = React.useCallback(async () => {
    try {
      if (!firstLoad) setLoadingAssignments(true);

      const assignmentsResp = await fetch(`${API_URL}/assignment/${userId}/assigned_by/`);

      if (!assignmentsResp.ok) throw new Error('Failed to fetch data');

      const assignments = await assignmentsResp.json();

      const childAssignments = assignments.filter((a: any) => a.assigned_to.id === childId);

      const assignedUnitsDetails: AssignedLearningUnit[] = childAssignments.map((assignment: any) => ({
        assignmentId: assignment.id,
        learningUnitId: assignment.learning_unit.id,
        title: assignment.learning_unit.title || '',
        category: assignment.learning_unit.category || '',
        participationType: assignment.participation_type,
        assignedDate: formatDate(assignment.assigned_at),
      }));

      const assignedUnitsWithStats: AssignedLearningUnit[] = await Promise.all(
        assignedUnitsDetails.map(async (unit) => {
          const { totalDuration, status } = await fetchUnitStats(unit.learningUnitId, childId);
          return {
            ...unit,
            time: totalDuration,
            status,
          };
        })
      );

      setData(assignedUnitsWithStats);

    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load learning units.');
    } finally {
      if (firstLoad) {
        setFirstLoad(false);
      } else {
        setLoadingAssignments(false);
      }
    }
  }, [childId, userId]);

  // Subscribe to Supabase changes
  useEffect(() => {
    const channelResults = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (insert, update, delete)
          schema: 'public',
          table: 'Assignment'
        },
        () => {
          // Refresh assignments when Exercise_Result table changes
          fetchAssignments();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      channelResults.unsubscribe();
    };
  }, [fetchAssignments]);

  // Get assignments on focus
  useFocusEffect(
    React.useCallback(() => {
      fetchAssignments();
    }, [fetchAssignments])
  );

  const handleSwitchChild = async (item: any) => {
    setSwitchChild(true);
    selectChild({ id: item.value, name: item.label, type: 'child' });
    setSelectedChild(item.label);
    try {
      await fetchAssignments();
    } finally {
      setTimeout(() => setSwitchChild(false), 5000);
    }
  };

  if (firstLoad || loadingProfiles) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#000' : '#f8f9fa' }]}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#fd9029" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <PaperProvider theme={DefaultTheme}>
      <View style={styles.header}>
        <Text variant='titleLarge' style={styles.headerTitle}>
          {getGreeting()}, {therapistName}!
        </Text>
      </View>
      <View style={[styles.container, { backgroundColor: darkMode ? '#000' : '#f8f9fa' }]}>
        <View style={styles.body}>
          <View style={styles.subtitleRow}>
            {childList.length > 0 ? (
              <>
              {childList.length > 1 ? (
              <View style={{ width: 160 }}>
                <Dropdown
                  style={{
                    height: 40,
                    borderColor: "#ccc",
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    backgroundColor: "#fff"  
                  }}
                  placeholderStyle={{ color: "#555" }}
                  selectedTextStyle={{ color: "#000" }}
                  containerStyle={{ backgroundColor: "#fff" }}   
                  itemTextStyle={{ color: "#000" }}              
                  activeColor="#f2f2f2"          
                  placeholder="Select child"
                  value={childId}
                  data={childList.map((child: any) => ({
                    label: child.name,
                    value: child.id,
                  }))}
                  labelField="label"
                  valueField="value"
                  onChange={(item: any) => {handleSwitchChild(item)}}
                />
              </View>
            ) : (
              <View style={styles.childButton}>
                <Text style={styles.childText}>{selectedChild}</Text>
              </View>
            )}
              <Text variant="bodyMedium" style={[styles.subtitle, { color: darkMode ? '#fff' : '#000' }]}>&apos;s progress this week.</Text>
              </>
            ) : (
              <Text variant="bodyMedium" style={styles.subtitle}>No children assigned yet.</Text>
            )}
          </View>
          {childList.length > 0 && (<Filters assignedUnits={data} />)}
        </View>
        {switchChild && (
          <View style={styles.overlay}>
            <Text style={{ color: "#fff", marginBottom: 10 }}>Loading…</Text>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    position: 'relative'
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
    elevation: 4, 
    paddingVertical: 4,
  },
  menuItem: {
    backgroundColor: "#ffffff", 
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 6,
    borderRadius: 0,
  },
  header: {
    backgroundColor: '#fd9029',
    paddingHorizontal: 20,
    paddingTop: 100,
    justifyContent: 'center',
  },
  headerTitle: {
    paddingLeft: 8,
    paddingBottom: 20,
    fontWeight: "bold",
    color: "white",
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: -33,
  },
  overlay: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    height: "70%",
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  }
});
