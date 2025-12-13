import React, { useState, useEffect } from "react";
import { StyleSheet, Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, ActivityIndicator } from "react-native-paper";
import Filters from "@/components/home_screen/CategoryFilters";
import AddChild from '@/components/ui/AddChildCard';
import { API_URL } from '@/config/api';
import { useApp } from '@/context/AppContext';
import { router, useFocusEffect } from "expo-router";
import { AssignedLearningUnit } from "@/types/learningUnitTypes";
import { fetchUnitStats } from "@/components/util/fetchUnitStats";
import { supabase } from "@/config/supabase";

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

export default function ParentDashboard() {
  const { profileId, childId, session, selectChild } = useApp();
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [parentName, setParentName] = useState('');
  const [selectedChildName, setSelectedChildName] = useState('');
  const [data, setData] = useState<AssignedLearningUnit[]>([]);

  const [greeting, setGreeting] = useState(getGreeting());

  const { darkMode } = useApp();

  // Redirect to welcome if no session
  useEffect(() => {
    if (!session) {
      router.replace('/welcome');
    }
  }, [session]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60 * 1000); 

    return () => clearInterval(interval); 
  }, []);

  const loading = loadingProfiles || loadingAssignments;

  const userId = session?.user?.id;

  // Get profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!userId) return;
      
      try {
        if (!session) {
          Alert.alert('No active session', 'Please log in again.');
          router.replace('/login');
          return;
        }

        // Get parent profile
        const parentProfileResponse = await fetch(`${API_URL}/profile/${profileId}/data/`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });
        if (!parentProfileResponse.ok) {
          throw new Error(`Failed to fetch parent profile (${parentProfileResponse.status})`);
        }
        const parentProfileData = await parentProfileResponse.json();
        setParentName(parentProfileData.name);

        // Get list of profiles
        const response = await fetch(`${API_URL}/profile/${userId}/list/`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch profiles');

        const profiles = await response.json();
      
        // Filter for child profiles
        const childProfiles = profiles.filter((p: any) => p.profile_type === 'child');

        if (childProfiles.length === 0) {
          setSelectedChildName('');
          return;
        }

        let currentChild: any = null;

        if (childId) {
          currentChild = childProfiles.find((c: any) => c.id === childId) || null;
        }

        if (!currentChild && childProfiles.length > 0) {
          currentChild = childProfiles[0];
        }

        if (currentChild) {
          selectChild(currentChild);
          setSelectedChildName(currentChild.name);
        }

      } catch (error: any) {
        Alert.alert('Error', error.message);
      } finally {
        setLoadingProfiles(false);
      }
    };

    fetchProfiles();
  }, [childId, profileId, session, userId]);

  const fetchAssignments = React.useCallback(async () => {
    if (!userId) return;
    
    try {

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
      setLoadingAssignments(false);
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

  // Guard: return early if no session after all hooks
  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#000' : '#f8f9fa' }]}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#FD902B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <View style={[styles.container, { backgroundColor: darkMode ? '#000' : '#f8f9fa' }]}>
        {!selectedChildName ? (
          <>
            <View style={styles.header}>
              <Text variant='titleLarge' style={styles.title}>Welcome, {parentName}!</Text>
            </View>
            <View style={styles.content}>
              <AddChild />
            </View>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text variant='titleLarge' style={styles.title}>{getGreeting()}, {parentName}!</Text>
            </View>
            <View style={styles.content}>
              <Text variant="bodyMedium" style={[styles.subtitle, { color: darkMode ? '#f8f9fa' : '#000' }]}>{selectedChildName}&apos;s progress this week.</Text>
              <Filters assignedUnits={data} />
            </View>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: '#fd9029',
    paddingHorizontal: 20,
    paddingTop: 100,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    paddingLeft: 8,
    paddingBottom: 20,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    color: "black",
    paddingTop: 5,
    paddingLeft: 6,
    fontSize: 15,
  }
});
