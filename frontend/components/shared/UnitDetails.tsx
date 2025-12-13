import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Alert, Platform, TouchableOpacity } from 'react-native';
import { Card, IconButton, Divider, Text, Snackbar, Button } from 'react-native-paper';
import AssignButton from '../ui/AssignButton';
import AssignmentStatus from '../ui/AssignmentOverlay';
import { LearningUnit, Exercise } from '../../types/learningUnitTypes';
import { API_URL } from '@/config/api';
import { useApp } from '../../context/AppContext';
import { router } from 'expo-router';

type DetailProps = {
  selectedItem: LearningUnit;
  assignedUnitIds: Set<string>;
  setAssignedUnitIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onBack: () => void;
};

export default function DetailView({
  selectedItem,
  assignedUnitIds,
  setAssignedUnitIds,
  onBack,
}: DetailProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const { darkMode, childId, session, exercisesCache, setExercisesForUnit } = useApp();
  const userId = session.user.id;

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'error' | 'success'>('success');

  const showMessage = (message: string, type: 'error' | 'success' = 'success') => {
    if (Platform.OS === 'web') {
      setSnackbarMessage(message);
      setSnackbarType(type);
      setSnackbarVisible(true);
    } else {
      Alert.alert(type === 'error' ? 'Error' : 'Success', message);
    }
  };

  const assignLearningUnit = async (
    learningUnitId: string,
    childId: string,
    userId: string,
    retries: number,
    participationType: 'required' | 'recommended',
  ) => {
    if (!session?.access_token) {
      showMessage('You must be authorized to perform this action', 'error');
      return;
    }

    const response = await fetch(`${API_URL}/assignment/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        learning_unit_id: learningUnitId,
        child_id: childId,
        user_id: userId,
        participation_type: participationType,
        num_question_attempts: retries
      }),
    });

    const res = await response.json();

    if (!response.ok) {
      if (res.error) {
        showMessage(res.error, 'error');
      } else {
        showMessage('Failed to assign learning unit', 'error');
      }
      return null;
    }

    return res;
  };

  const unassignLearningUnit = async (
    learningUnitId: string,
    childId: string,
  ) => {
    if (!session?.access_token) {
      showMessage('You must be authorized to perform this action', 'error');
      return;
    }

    const response = await fetch(`${API_URL}/assignment/${childId}/unassign/${learningUnitId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
    });

    if (!response.ok) {
      showMessage(`Failed to unassign learning unit (${response.status})`, 'error');
    }

    return await response.json();
  };

  useEffect(() => {
    const fetchExercises = async () => {
      if (exercisesCache[selectedItem.id]) {
        setExercises(exercisesCache[selectedItem.id]);
        return;
      }

      if (!session?.access_token) {
        Alert.alert('Error', 'You must be authorized to perform this action');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/content/${selectedItem.id}/exercises/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
        });

        if (!response.ok) throw new Error(`Failed to fetch exercises (${response.status})`);

        const data = await response.json();
        setExercises(data);
        
        await setExercisesForUnit(selectedItem.id, data);
      } catch (err) {
        console.error('Error fetching exercises:', err);
        Alert.alert('Error', 'Failed to load exercises.');
      }
    };

    fetchExercises();
  }, [selectedItem.id, session]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <View style={styles.backButton}>
          <IconButton icon="arrow-left" size={30} onPress={onBack} />
        </View>
      </View> 
      <ScrollView style={[styles.container, { backgroundColor: darkMode ? '#232323ff' : '#fff' }]}>


        <Text variant="headlineMedium" style={[styles.title, { color: darkMode ? '#fff' : '#000' }]}>{selectedItem.title}</Text>
        <Text variant="titleMedium" style={[styles.category, { color: darkMode ? '#fff' : '#000' }]}>{selectedItem.category}</Text>
        <Text variant="bodyMedium" style={[styles.description, { color: darkMode ? '#fff' : '#000' }]}>{selectedItem.description}</Text>

      {/* View Full Details Button */}
      <Button
        mode="contained"
        icon="eye"
        style={styles.viewDetailsButton}
        onPress={() =>
          router.push({
            pathname: "/learning-unit-details",
            params: {
              id: selectedItem.id,
              title: selectedItem.title,
              category: selectedItem.category,
            },
          })
        }
      >
        View Full Details
      </Button>

      <Text variant="titleMedium" style={[styles.heading, { color: darkMode ? '#fff' : '#000' }]}>Exercises</Text>
      <Divider style={styles.divider} />

        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          {exercises.map((exercise, index) => (
            <Card
              key={index}
            >
              <Card.Title title={exercise.title} />
              <Card.Content>
                <Text variant="bodyMedium" style={[styles.description, { color: darkMode ? '#fff' : '#000' }]}>{exercise.description}</Text>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        <View style={styles.buttonWrapper}>
          <AssignButton onPress={() => setShowOverlay(true)} />
          <AssignmentStatus
            visible={showOverlay}
            status={selectedItem.status}
            onClose={() => setShowOverlay(false)}
            onSelect={async (newStatus, retries) => {
              try {
                if (!childId || !userId) {
                  Alert.alert('Error', 'Missing user or child information');
                  return;
                }

                let result;
                let message = '';

                switch (newStatus) {
                  case "Unassign": {

                    result = await unassignLearningUnit(selectedItem.id, childId);
                    message = "Unassigned";

                    setAssignedUnitIds(prev =>
                      new Set([...prev].filter(id => id !== selectedItem.id))
                    );
                    break;
                  }

                  case "Assign as Required": {
                    result = await assignLearningUnit(
                      selectedItem.id,
                      childId,
                      userId,
                      retries,
                      "required"
                    );
                    message = "Assigned as Required";

                    setAssignedUnitIds(prev => new Set([...prev, selectedItem.id]));
                    break;
                  }

                  case "Assign as Recommended": {
                    result = await assignLearningUnit(
                      selectedItem.id,
                      childId,
                      userId,
                      retries,
                      "recommended"
                    );
                    message = "Assigned as Recommended";

                    setAssignedUnitIds(prev => new Set([...prev, selectedItem.id]));
                    break;
                  }

                  default:
                    console.warn("Unknown status:", newStatus);
                    return;
                }

                if (!result) return;

                selectedItem.status = newStatus;

                showMessage(`Learning unit successfully ${message.toLowerCase()}`, 'success');
              } catch (error) {
                console.error('Error updating assignment:', error);
                showMessage('Failed to update assignment. Please try again.', 'error');
              }
            }}
          />
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={5000}
        style={{
          backgroundColor: snackbarType === 'error' ? '#e77f7fff' : '#a0e2a3ff',
          borderRadius: 8,
          margin: 16,
        }}
        action={{
          label: 'Close',
          textColor: 'black',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        <Text style={{ color: 'black' }}>{snackbarMessage}</Text>
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    minHeight: 0,
  },
  header: {
    backgroundColor: '#fd9029',
    paddingHorizontal: 20,
    paddingTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 25,
    marginTop: 30,
    paddingLeft: 6,
    fontWeight: '600',
    color: '#000'
  },
  viewDetailsButton: {
    backgroundColor: '#FD902B',
    marginVertical: 20,
    marginHorizontal: 6,
    borderRadius: 8,
  },
  category: {
    fontSize: 20,
    padding: 10,
    color: '#000'
  },
  heading: {
    fontSize: 20,
    padding: 10,
    color: '#000',
    paddingBottom: 20 },
  description: {
    fontSize: 15,
    padding: 10,
    color: '#000',
    paddingBottom: 15 },
  divider: {
    height: 1,
    backgroundColor: 'black',
    marginVertical: 2 },
  scrollArea: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    paddingBottom: 50
  },
  buttonWrapper: {
    marginBottom: 50,
    alignItems: 'center'
  },
});
