import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { Card, IconButton, Divider, Text } from 'react-native-paper';
import AssignButton from '../ui/AssignButton';
import AssignmentStatus from '../ui/AssignmentOverlay';
import { router } from 'expo-router';
import { LearningUnit, Exercise } from '../../types/learningUnitTypes';
import { API_URL } from '@/config/api';
import { useApp } from '../../context/AppContext';

const { session } = useApp();

type DetailProps = {
  selectedItem: LearningUnit;
  assignedUnitIds: Set<string>;
  setAssignedUnitIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onBack: () => void;
};

const assignLearningUnit = async (
  learningUnitId: string,
  childId: string,
  userId: string,
  participationType: 'required' | 'recommended'
) => {
  if (!session?.access_token) {
    Alert.alert('Error', 'You must be authorized to perform this action');
    return;
  }

  const response = await fetch(`${API_URL}/api/assignments/`, {
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
  userId: string
) => {
  if (!session?.access_token) {
    Alert.alert('Error', 'You must be authorized to perform this action');
    return;
  }

  const response = await fetch(`${API_URL}/api/assignments/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({
      learning_unit_id: learningUnitId,
      child_id: childId,
      user_id: userId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to unassign learning unit (${response.status})`);
  }

  return await response.json();
};

export default function DetailView({
  selectedItem,
  assignedUnitIds,
  setAssignedUnitIds,
  onBack,
}: DetailProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const { childId, session } = useApp();
  const userId = session.user.id;

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch(`${API_URL}/api/exercises/${selectedItem.id}/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`Failed to fetch exercises (${response.status})`);

        const data = await response.json();
        setExercises(data);
      } catch (err) {
        console.error('Error fetching exercises:', err);
        Alert.alert('Error', 'Failed to load exercises.');
      }
    };

    fetchExercises();
  }, [selectedItem.id]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.backButton}>
        <IconButton icon="arrow-left" size={30} onPress={onBack} />
      </View>

      <Text variant="headlineMedium" style={styles.title}>{selectedItem.title}</Text>
      <Text variant="titleMedium" style={styles.category}>{selectedItem.category}</Text>
      <Text variant="bodyMedium" style={styles.description}>{selectedItem.description}</Text>

      <Text variant="titleMedium" style={styles.heading}>Activities</Text>
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
                await unassignLearningUnit(selectedItem.id, childId, userId);
                setAssignedUnitIds(prev => new Set([...prev].filter(id => id !== selectedItem.id)));
              } else if (newStatus === 'Assigned as Required') {
                await assignLearningUnit(selectedItem.id, childId, userId, 'required');
                setAssignedUnitIds(prev => new Set([...prev, selectedItem.id]));
              } else if (newStatus === 'Assigned as Recommended') {
                await assignLearningUnit(selectedItem.id, childId, userId, 'recommended');
                setAssignedUnitIds(prev => new Set([...prev, selectedItem.id]));
              }

              selectedItem.status = newStatus;

              Alert.alert('Success', `Learning unit ${newStatus.toLowerCase()} successfully!`);
            } catch (error) {
              console.error('Error updating assignment:', error);
              Alert.alert('Error', 'Failed to update assignment. Please try again.');
            }
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#fff' 
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
    flex: 1 
  },
  scrollContent: { 
    paddingBottom: 50 
  },
  buttonWrapper: { 
    marginBottom: 50, 
    alignItems: 'center' 
  },
});
