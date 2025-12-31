import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Text, DefaultTheme, Provider as PaperProvider, Avatar } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import Filters from "../../components/home_screen/CategoryFilters";
import { supabase } from '@/config/supabase';
import { API_URL } from '@/config/api';
import { Account } from '@/components/AccountSelectionPage';
import { useApp } from '@/context/AppContext';
import { useFocusEffect, router } from "expo-router";
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
  const [therapistAvatar, setTherapistAvatar] = useState('');
  const [childList, setChildList] = useState<Account[]>([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [data, setData] = useState<AssignedLearningUnit[]>([]);
  const [firstLoad, setFirstLoad] = useState(true);
  const [switchChild, setSwitchChild] = useState(false);

  const [greeting, setGreeting] = useState(getGreeting());

  // Redirect to welcome if no session
  useEffect(() => {
    if (!session) {
      router.replace('/welcome');
    }
  }, [session]);

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
        console.log('Fetching profiles for therapist user ID:', user.id);
        
        const response = await fetch(`${API_URL}/profile/${user.id}/list/`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });
        if (!response.ok) throw new Error(`Failed to fetch profiles (${response.status})`);

        const data = await response.json();
        console.log('Therapist profiles response:', data);

        // Transform API data to match frontend Account type
        const transformedData: Account[] = data.map((profile: any) => ({
          id: profile.id.toString(),
          name: profile.name,
          type: profile.profile_type,
          isLocked: !!profile.pin_hash,
        }));

        console.log('Transformed data:', transformedData);

        const therapistProfile = transformedData.find(profile => profile.type === 'therapist');
        if (therapistProfile) {
          setTherapistName(therapistProfile.name);
          // Fetch full therapist profile data for avatar
          const therapistDataResp = await fetch(`${API_URL}/profile/${therapistProfile.id}/data/`, {
            headers: { 'Authorization': `Bearer ${session?.access_token}` }
          });
          if (therapistDataResp.ok) {
            const therapistData = await therapistDataResp.json();
            setTherapistAvatar(therapistData.profile_picture || '');
          }
        }

        const childrenFull = transformedData.filter(p => p.type === 'child');
        console.log('Children assigned to therapist:', childrenFull);
        setChildList(childrenFull);
        if (childrenFull.length > 0) {
          const initialChild = childrenFull[0];
          selectChild({
            id: initialChild.id,
            name: initialChild.name,
            type: initialChild.type,
          });
          setSelectedChild(initialChild.name);
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

  const userId = session?.user?.id;
  const fetchAssignments = React.useCallback(async () => {
    if (!childId) {
      // No child selected - clear data and stop loading
      setData([]);
      if (firstLoad) setFirstLoad(false);
      setLoadingAssignments(false);
      return;
    }
    
    try {
      if (!firstLoad) setLoadingAssignments(true);

      // Fetch assignments directly for the child instead of filtering therapist's assignments
      const assignmentsResp = await fetch(`${API_URL}/assignment/${childId}/assigned_to/`);

      if (!assignmentsResp.ok) throw new Error('Failed to fetch data');

      const assignments = await assignmentsResp.json();
      console.log('Child assignments:', assignments);

      const assignedUnitsDetails: AssignedLearningUnit[] = assignments.map((assignment: any) => ({
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

  // Guard: return early if no session after all hooks
  if (!session) {
    return null;
  }

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
        <View style={styles.headerRow}>
          <Text variant='titleLarge' style={styles.headerTitle}>
            {getGreeting()}, {therapistName}!
          </Text>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => router.push('/account-selection')}
          >
            {therapistAvatar ? (
              <Avatar.Image size={50} source={{ uri: therapistAvatar }} />
            ) : (
              <Avatar.Text 
                size={50} 
                label={therapistName.substring(0, 2).toUpperCase()} 
                style={styles.therapistAvatar}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.container, { backgroundColor: darkMode ? '#000' : '#f8f9fa' }]}>
        <View style={styles.body}>
          {childList.length > 0 ? (
            <>
              {childList.length > 1 ? (
                <View style={{ width: 220, marginBottom: 12 }}>
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
                <View style={[styles.childButton, { marginBottom: 12 }]}>
                  <Text style={styles.childText}>{selectedChild}</Text>
                </View>
              )}
              <Text variant="bodyMedium" style={[styles.subtitle, { color: darkMode ? '#fff' : '#000', marginBottom: 12 }]}>{selectedChild}&apos;s progress this week.</Text>
            </>
          ) : (
            <Text variant="bodyMedium" style={styles.subtitle}>No children assigned yet.</Text>
          )}
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
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarContainer: {
    marginLeft: 12,
  },
  therapistAvatar: {
    backgroundColor: '#E74C3C',
  },
  headerTitle: {
    paddingLeft: 8,
    fontWeight: "bold",
    color: "white",
    flex: 1,
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
