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
  const [loading, setLoading] = useState(true);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isInProgress, setIsInProgress] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

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
      setLoading(true);
      
      if (!session?.access_token) {
        Alert.alert('Error', 'You must be authorized to perform this action');
        setLoading(false);
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
        const sorted = data.sort((a: Exercise, b: Exercise) => a.order - b.order);

        // Fetch result details for each exercise
        const results = await Promise.all(
          sorted.map(async (ex: Exercise) => {
            try {
              const resResp = await fetch(`${API_URL}/result/${childId}/exercise/${ex.id}/`, {
                headers: {
                  'Authorization': `Bearer ${session?.access_token}`,
                },
              });
              
              if (!resResp.ok) {
                return {
                  ...ex,
                  time_spent: 0,
                  completed: false,
                  accuracy: 0,
                  num_correct: 0,
                  num_incorrect: 0,
                  last_practiced: null,
                };
              }

              const resJson = await resResp.json();
              if (Array.isArray(resJson) && resJson.length > 0) {
                const first = resJson[0];
                return {
                  ...ex,
                  time_spent: first.time_spent || 0,
                  completed: true,
                  accuracy: first.accuracy || 0,
                  num_correct: first.num_correct || 0,
                  num_incorrect: first.num_incorrect || 0,
                  last_practiced: first.completed_at || null,
                };
              }
              
              return {
                ...ex,
                time_spent: 0,
                completed: false,
                accuracy: 0,
                num_correct: 0,
                num_incorrect: 0,
                last_practiced: null,
              };
            } catch (err) {
              console.error(`Error fetching results for exercise ${ex.id}:`, err);
              return {
                ...ex,
                time_spent: 0,
                completed: false,
                accuracy: 0,
                num_correct: 0,
                num_incorrect: 0,
                last_practiced: null,
              };
            }
          })
        );

        // Calculate stats
        let totalTime = 0;
        let completed = 0;
        let totalCorrect = 0;
        let totalIncorrect = 0;

        results.forEach((ex: any) => {
          totalTime += ex.time_spent || 0;
          if (ex.completed) completed++;
          totalCorrect += ex.num_correct || 0;
          totalIncorrect += ex.num_incorrect || 0;
        });

        const total = totalCorrect + totalIncorrect;
        const accuracy = total > 0 ? Math.round((totalCorrect / total) * 100) : 0;

        setExercises(results);
        setTotalTimeSpent(totalTime);
        setOverallAccuracy(accuracy);
        setCompletedCount(completed);
        setIsCompleted(completed === sorted.length && sorted.length > 0);
        setIsInProgress(completed > 0 && completed < sorted.length);
        
        await setExercisesForUnit(selectedItem.id, results);
      } catch (err) {
        console.error('Error fetching exercises:', err);
        Alert.alert('Error', 'Failed to load exercises.');
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [selectedItem.id, session, childId]);

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

        {/* Status Badge */}
        {(isCompleted || isInProgress) && (
          <View style={[styles.statusBadgeContainer, { backgroundColor: isCompleted ? '#4CAF50' : '#FD902B' }]}>
            <Text style={styles.statusBadgeText}>
              {isCompleted ? '✓ Completed' : '⏳ In Progress'}
            </Text>
          </View>
        )}

        {/* Stats Card */}
        <Card style={[styles.statsCard, darkMode && styles.statsCardDark]} mode="elevated">
          <Card.Content>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, darkMode && styles.textSecondaryDark]}>Time Spent</Text>
                <Text style={[styles.statValue, darkMode && styles.textDark]}>
                  {Math.floor(totalTimeSpent / 60)} min
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, darkMode && styles.textSecondaryDark]}>Accuracy</Text>
                <Text style={[styles.statValue, darkMode && styles.textDark]}>
                  {overallAccuracy}%
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, darkMode && styles.textSecondaryDark]}>Progress</Text>
                <Text style={[styles.statValue, darkMode && styles.textDark]}>
                  {completedCount}/{exercises.length}
                </Text>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${exercises.length > 0 ? (completedCount / exercises.length) * 100 : 0}%` }]} />
              </View>
            </View>
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={[styles.heading, { color: darkMode ? '#fff' : '#000' }]}>Exercises</Text>
        <Divider style={styles.divider} />

        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: darkMode ? '#fff' : '#000' }]}>Loading exercises...</Text>
            </View>
          ) : (
            exercises.map((exercise: any, index) => {
              const total = (exercise.num_correct || 0) + (exercise.num_incorrect || 0);
              const accuracy = total > 0 ? Math.round(((exercise.num_correct || 0) / total) * 100) : 0;

              return (
                <Card
                  key={exercise.id}
                  style={[styles.exerciseCard, darkMode && styles.exerciseCardDark]}
                >
                  <Card.Content>
                    <View style={styles.exerciseHeader}>
                      <Text variant="titleMedium" style={[styles.exerciseTitle, { color: darkMode ? '#fff' : '#000' }]}>
                        {index + 1}. {exercise.title}
                      </Text>
                      {exercise.completed && (
                        <Text style={styles.completedBadge}>✓ Completed</Text>
                      )}
                    </View>
                    
                    {exercise.description && (
                      <Text variant="bodyMedium" style={[styles.exerciseDescription, { color: darkMode ? '#aaa' : '#666' }]}>
                        {exercise.description}
                      </Text>
                    )}

                    {exercise.completed && (
                      <View style={styles.exerciseStatsTable}>
                        <View style={styles.exerciseStatColumn}>
                          <Text style={[styles.exerciseStatLabel, { color: darkMode ? '#aaa' : '#666' }]}>Correct</Text>
                          <Text style={[styles.exerciseStatValue, { color: darkMode ? '#fff' : '#000' }]}>
                            {exercise.num_correct || 0}
                          </Text>
                        </View>
                        <View style={[styles.exerciseStatColumn, styles.exerciseStatColumnMiddle]}>
                          <Text style={[styles.exerciseStatLabel, { color: darkMode ? '#aaa' : '#666' }]}>Incorrect</Text>
                          <Text style={[styles.exerciseStatValue, { color: darkMode ? '#fff' : '#000' }]}>
                            {exercise.num_incorrect || 0}
                          </Text>
                        </View>
                        <View style={styles.exerciseStatColumn}>
                          <Text style={[styles.exerciseStatLabel, { color: darkMode ? '#aaa' : '#666' }]}>Accuracy</Text>
                          <Text style={[styles.exerciseStatValue, { color: darkMode ? '#fff' : '#000' }]}>
                            {accuracy}%
                          </Text>
                        </View>
                      </View>
                    )}
                  </Card.Content>
                </Card>
              );
            })
          )}
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
  statusBadgeContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 6,
    marginVertical: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsCard: {
    marginHorizontal: 6,
    marginVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  statsCardDark: {
    backgroundColor: '#2a2a2a',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  textDark: {
    color: '#fff',
  },
  textSecondaryDark: {
    color: '#aaa',
  },
  category: {
    fontSize: 20,
    padding: 10,
    color: '#000'
  },
  exerciseCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
  },
  exerciseCardDark: {
    backgroundColor: '#1a1a1a',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseTitle: {
    flex: 1,
    fontWeight: '600',
  },
  completedBadge: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  exerciseDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  exerciseStatsTable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  exerciseStatColumn: {
    flex: 1,
    alignItems: 'center',
  },
  exerciseStatColumnMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e0e0e0',
  },
  exerciseStatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  exerciseStatValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
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
