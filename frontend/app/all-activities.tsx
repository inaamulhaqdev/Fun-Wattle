import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { API_URL } from '@/config/api';
import { LearningUnitCard } from '@/components/ui/ActivityCards';

interface Exercise {
  id: string;
  title: string;
  learning_unit_title: string;
  learning_unit_category: string;
  completed: boolean;
  accuracy: number;
  num_correct: number;
  num_incorrect: number;
  time_spent: number;
  last_practiced: string | null;
  order: number;
}

interface LearningUnit {
  title: string;
  category: string;
  exercises: Exercise[];
  totalTimeSpent: number;
  overallAccuracy: number;
}

export default function AllActivitiesPage() {
  const { childId, darkMode } = useApp();
  const [learningUnits, setLearningUnits] = useState<LearningUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllActivities = async () => {
      if (!childId) return;

      setLoading(true);
      try {
        // Fetch all assignments for the child
        const assignmentsResponse = await fetch(
          `${API_URL}/assignment/${childId}/assigned_to/`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!assignmentsResponse.ok) {
          throw new Error('Failed to fetch assignments');
        }

        const assignments = await assignmentsResponse.json();
        const allExercises: Exercise[] = [];

        // For each assignment, fetch its exercises
        for (const assignment of assignments) {
          const exercisesResponse = await fetch(
            `${API_URL}/content/${assignment.learning_unit.id}/exercises/`,
            {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            }
          );

          if (exercisesResponse.ok) {
            const unitExercises = await exercisesResponse.json();

            // For each exercise, fetch its results
            for (const exercise of unitExercises) {
              const resultsResponse = await fetch(
                `${API_URL}/result/${childId}/exercise/${exercise.id}/`,
                {
                  method: 'GET',
                  headers: { 'Content-Type': 'application/json' },
                }
              );

              let exerciseData: Exercise = {
                id: exercise.id,
                title: exercise.title,
                learning_unit_title: assignment.learning_unit.title,
                learning_unit_category: assignment.learning_unit.category,
                completed: false,
                accuracy: 0,
                num_correct: 0,
                num_incorrect: 0,
                time_spent: 0,
                last_practiced: null,
                order: exercise.order || 0,
              };

              if (resultsResponse.ok) {
                const results = await resultsResponse.json();
                if (Array.isArray(results) && results.length > 0) {
                  const latestResult = results[0];
                  exerciseData = {
                    ...exerciseData,
                    completed: latestResult.completed_at !== null,
                    accuracy: latestResult.accuracy || 0,
                    num_correct: latestResult.num_correct || 0,
                    num_incorrect: latestResult.num_incorrect || 0,
                    time_spent: latestResult.time_spent || 0,
                    last_practiced: latestResult.completed_at,
                  };
                }
              }

              allExercises.push(exerciseData);
            }
          }
        }

        // Group exercises by learning unit
        const groupedUnits = allExercises.reduce((acc, exercise) => {
          const unitTitle = exercise.learning_unit_title;
          if (!acc[unitTitle]) {
            acc[unitTitle] = {
              title: unitTitle,
              category: exercise.learning_unit_category,
              exercises: [],
              totalTimeSpent: 0,
              overallAccuracy: 0,
            };
          }
          acc[unitTitle].exercises.push(exercise);
          acc[unitTitle].totalTimeSpent += exercise.time_spent;
          return acc;
        }, {} as Record<string, LearningUnit>);

        // Calculate overall accuracy for each unit
        const units = Object.values(groupedUnits).map(unit => {
          const totalCorrect = unit.exercises.reduce((sum, ex) => sum + ex.num_correct, 0);
          const totalIncorrect = unit.exercises.reduce((sum, ex) => sum + ex.num_incorrect, 0);
          const total = totalCorrect + totalIncorrect;
          unit.overallAccuracy = total > 0 ? Math.round((totalCorrect / total) * 100) : 0;
          unit.exercises.sort((a, b) => a.order - b.order);
          return unit;
        });

        setLearningUnits(units);
      } catch (error) {
        console.error('Error fetching all activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllActivities();
  }, [childId]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: darkMode ? '#000' : '#fff' }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.header, { backgroundColor: darkMode ? '#333' : '#fd9029' }]}>
          <IconButton icon="arrow-left" size={30} onPress={handleBack} iconColor="#fff" />
          <Text style={styles.headerTitle}>All Activities</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD902B" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#000' : '#fff' }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { backgroundColor: darkMode ? '#333' : '#fd9029' }]}>
        <IconButton icon="arrow-left" size={30} onPress={handleBack} iconColor="#fff" />
        <Text style={styles.headerTitle}>All Activities</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {learningUnits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: darkMode ? '#fff' : '#000' }]}>
              No activities assigned yet
            </Text>
            <Text style={[styles.emptySubtext, { color: darkMode ? '#aaa' : '#666' }]}>
              Assign learning units to see activities here
            </Text>
          </View>
        ) : (
          <>
            {learningUnits.map((unit, index) => (
              <LearningUnitCard
                key={`${unit.title}-${index}`}
                title={unit.title}
                totalTime={unit.totalTimeSpent}
                overallAccuracy={unit.overallAccuracy}
                exercises={unit.exercises}
                darkMode={darkMode}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  exerciseContainer: {
    marginBottom: 20,
  },
  learningUnitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 14,
    marginBottom: 4,
  },
  lastPracticed: {
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
});
