import React, { useState, useEffect } from "react";
import { StyleSheet, Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, ActivityIndicator } from "react-native-paper";
import Filters from "@/components/home_screen/CategoryFilters";
import AddChild from '@/components/AddChildCard';
import { API_URL } from '@/config/api';
import { useApp } from '@/context/AppContext';
import { router, useFocusEffect } from "expo-router";
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

export default function ParentDashboard() {
  const { profileId, childId, session } = useApp();
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [parentName, setParentName] = useState('');
  const [selectedChildName, setSelectedChildName] = useState('');
  const [data, setData] = useState<AssignedLearningUnit[]>([]);

  const loading = loadingProfiles || loadingAssignments;

  const userId = session.user.id;

  // Get profiles
  useEffect(() => {
    const fetchProfiles = async () => {
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

        // Get selected child profile
        const selectedChildResponse = await fetch(`${API_URL}/profile/${childId}/data/`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });
        if (!selectedChildResponse.ok) {
          throw new Error(`Failed to fetch child profile (${selectedChildResponse.status})`);
        }
        const selectedChildData = await selectedChildResponse.json();
        setSelectedChildName(selectedChildData.name);

      } catch (error: any) {
        Alert.alert('Error', error.message);
      } finally {
        setLoadingProfiles(false);
      }
    };

    fetchProfiles();
  }, [childId]);

  // Get assignments
  useFocusEffect(
    React.useCallback(() => {
      const fetchAssignments = async () => {
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
      };

      fetchAssignments();
    }, [childId, userId])
  );

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
    <SafeAreaView style={styles.container}>
      {!selectedChildName ? (
        <>
          <Text variant='titleLarge' style={styles.title}>Welcome, {parentName}!</Text>
          <AddChild />
        </>
      ) : (
        <>
          <Text variant='titleLarge' style={styles.title}>Good evening, {parentName}!</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>{selectedChildName}&apos;s progress this week.</Text>
          <Filters assignedUnits={data} />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#ffff",
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    paddingTop: "20%",
    fontWeight: "bold",
    color: "black",
  },
  subtitle: {
    color: "black",
    paddingTop: 5,
    fontSize: 15,
  }
});
