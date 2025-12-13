import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, ActivityIndicator, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { API_URL } from '@/config/api';

interface LearningUnit {
  id: string;
  title: string;
  category: string;
  description: string;
  progress?: number;
  assignedAt?: string;
}

export default function ChildLearningUnits() {
  const { childId, session } = useApp();
  const [learningUnits, setLearningUnits] = useState<LearningUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignedUnits = async () => {
      if (!childId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch assignments for this child
        const response = await fetch(`${API_URL}/assignment/${childId}/assigned_to/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch assignments');
        }

        const assignments = await response.json();
        console.log('Child assignments:', assignments);

        // Transform to LearningUnit format
        const units: LearningUnit[] = assignments.map((assignment: any) => ({
          id: assignment.learning_unit.id,
          title: assignment.learning_unit.title,
          category: assignment.learning_unit.category,
          description: assignment.learning_unit.description || '',
          assignedAt: assignment.assigned_at,
          progress: 0, // Can be calculated from results later
        }));

        // Remove duplicates (in case same unit is assigned multiple times)
        const uniqueUnits = units.filter(
          (unit, index, self) => index === self.findIndex((u) => u.id === unit.id)
        );

        setLearningUnits(uniqueUnits);
      } catch (error) {
        console.error('Error fetching assigned learning units:', error);
        Alert.alert('Error', 'Failed to load your learning units');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedUnits();
  }, [childId]);

  const handleUnitPress = (unit: LearningUnit) => {
    router.push({
      pathname: '/learning-unit-details',
      params: {
        id: unit.id,
        title: unit.title,
        category: unit.category,
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FD902B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={30} onPress={handleBack} iconColor="#fff" />
        <Text style={styles.headerTitle}>My Learning Units</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {learningUnits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No learning units assigned yet!</Text>
            <Text style={styles.emptySubtext}>
              Ask your parent or therapist to assign some activities for you
            </Text>
          </View>
        ) : (
          learningUnits.map((unit) => (
            <TouchableOpacity key={unit.id} onPress={() => handleUnitPress(unit)}>
              <Card style={styles.unitCard}>
                <Card.Content>
                  <Text variant="titleLarge" style={styles.unitTitle}>
                    {unit.title}
                  </Text>
                  <Text variant="labelLarge" style={styles.unitCategory}>
                    {unit.category}
                  </Text>
                  {unit.description && (
                    <Text variant="bodyMedium" style={styles.unitDescription}>
                      {unit.description}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#FD902B',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
    color: '#333',
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  unitCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#FFF7DE',
  },
  unitTitle: {
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  unitCategory: {
    color: '#FD902B',
    marginBottom: 8,
  },
  unitDescription: {
    color: '#555',
    marginTop: 4,
  },
});
