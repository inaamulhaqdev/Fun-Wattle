import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Alert, Platform } from 'react-native';
import { Card, IconButton, Divider, Text, Snackbar } from 'react-native-paper';
import AssignButton from '../ui/AssignButton';
import AssignmentStatus from '../ui/AssignmentOverlay';
import { router } from 'expo-router';
import { LearningUnit, Exercise } from '../../types/learningUnitTypes';
import { API_URL } from '@/config/api';
import { useApp } from '../../context/AppContext';

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

  const { childId, session, exercisesCache, setExercisesForUnit } = useApp();
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
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to assign learning unit (${response.status})`);
    }

    return await response.json();
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
      throw new Error(`Failed to unassign learning unit (${response.status})`);
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
      <ScrollView style={styles.container}>
        <View style={styles.backButton}>
          <IconButton icon="arrow-left" size={30} onPress={onBack} />
        </View>

        <Text variant="headlineMedium" style={styles.title}>{selectedItem.title}</Text>
        <Text variant="titleMedium" style={styles.category}>{selectedItem.category}</Text>
        <Text variant="bodyMedium" style={styles.description}>{selectedItem.description}</Text>

      <Text variant="titleMedium" style={styles.heading}>Exercises</Text>
      <Divider style={styles.divider} />

        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          {exercises.map((exercise, index) => (
            <Card
              key={index}
              onPress={() =>
                router.push({
                  pathname: '/exercise-screen',
                  params: { title: exercise.title, component: exercise.title?.replace(" ", "") },
                })
              }
            >
              <Card.Title title={exercise.title} />
              <Card.Content>
                <Text variant="bodyMedium" style={styles.description}>{exercise.description}</Text>
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
            onSelect={async (newStatus) => {
              try {
                if (!childId || !userId) {
                  Alert.alert('Error', 'Missing user or child information');
                  return;
                }

                if (newStatus === 'Unassigned') {
                  await unassignLearningUnit(selectedItem.id, childId);
                  setAssignedUnitIds(prev => new Set([...prev].filter(id => id !== selectedItem.id)));
                } else if (newStatus === 'Assigned as Required') {
                  console.log("Unit id:", selectedItem.id);
                  console.log("Child id:", childId);
                  console.log("userId", userId);
                  await assignLearningUnit(selectedItem.id, childId, userId, 'required');
                  setAssignedUnitIds(prev => new Set([...prev, selectedItem.id]));
                } else if (newStatus === 'Assigned as Recommended') {
                  await assignLearningUnit(selectedItem.id, childId, userId, 'recommended');
                  setAssignedUnitIds(prev => new Set([...prev, selectedItem.id]));
                }

                selectedItem.status = newStatus;

                showMessage(`Learning unit ${newStatus.toLowerCase()} successfully!`, 'success');
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
  backButton: {
    marginTop: 40,
    alignSelf: 'flex-start'
  },
  title: {
    fontSize: 25,
    marginTop: 30,
    fontWeight: '600',
    color: '#000'
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
