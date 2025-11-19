import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, DefaultTheme, Provider as PaperProvider } from "react-native-paper";
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
  const { childId, session } = useApp();
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [therapistName, setTherapistName] = useState('');
  const [childList, setChildList] = useState<Account[]>([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [data, setData] = useState<AssignedLearningUnit[]>([]);
  const [childLoading, setChildLoading] = useState(false);
  const loading = loadingProfiles || loadingAssignments;

  const [greeting, setGreeting] = useState(getGreeting());

  // every 60 seconds, checks if the greeting should be changed according to time (eg. app left open, time switches from morning to midday; greeting changes to 'Good afternoon' without reload)
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60 * 1000); 

    return () => clearInterval(interval); 
  }, []);

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
          setSelectedChild(childrenFull[0].name);
          setSelectedChildId(childrenFull[0].id);
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
      setLoadingAssignments(true);

      const [unitsResp, assignmentsResp] = await Promise.all([
        fetch(`${API_URL}/content/learning_units/`),
        fetch(`${API_URL}/assignment/${userId}/assigned_by/`)
      ]);

      if (!assignmentsResp.ok) throw new Error('Failed to fetch data');

      const assignments = await assignmentsResp.json();

      const childAssignments = assignments.filter((a: any) => a.assigned_to === childId);



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
      setLoadingAssignments(false);
    }
  }, [childId, userId]);

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Assignment'
        },
        () => {
          fetchAssignments();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [fetchAssignments]);

  // Get assignments on focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchAssignments = async () => {
        try {
          const assignmentsResp = await fetch(`${API_URL}/assignment/${userId}/assigned_by/`);

          if (!assignmentsResp.ok) throw new Error('Failed to fetch data');

          const assignments = await assignmentsResp.json();

          const childAssignments = assignments.filter((a: any) => a.assigned_to.id === selectedChildId);

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
              const { totalDuration, status } = await fetchUnitStats(unit.learningUnitId, selectedChildId);
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
          setLoadingAssignments(false);
        }
      };

      if (selectedChildId) fetchAssignments();
    }, [selectedChildId, userId])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#fd9029" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <PaperProvider theme={DefaultTheme}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {getGreeting()}, {therapistName}!
              </Text>
        </View>

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
                  }}
                  placeholder="Select child"
                  value={selectedChildId}
                  data={childList.map((child) => ({
                    label: child.name,
                    value: child.id,
                  }))}
                  labelField="label"
                  valueField="value"
                  onChange={(item) => {
                    setSelectedChildId(item.value);
                    setSelectedChild(item.label);
                  }}
                />
              </View>
            ) : (
              <View style={styles.childButton}>
                <Text style={styles.childText}>{selectedChild}</Text>
              </View>
            )}


                <Text variant="bodyMedium" style={styles.subtitle}>&apos; progress this week.</Text>
              </>
            ) : (
              <Text variant="bodyMedium" style={styles.subtitle}>No children assigned yet.</Text>
            )}
          </View>
          {childList.length > 0 && (
            loadingAssignments ? (
              <View style={{ marginTop: 40, alignItems: "center" }}>
                <ActivityIndicator size="large" color="#fd9029"/>
                <Text style={{ marginTop: 10, color: "#555" }}>Loading learning units...</Text>
              </View>
            ) : (
              <Filters assignedUnits={data} selectedChildId={selectedChildId}/>
            )
          )}
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fd9029",
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
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
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
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: -33,
  }
});
