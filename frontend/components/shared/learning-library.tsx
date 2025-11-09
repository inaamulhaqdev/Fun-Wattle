import React, { useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card, IconButton, Divider, Text, Searchbar, Snackbar } from 'react-native-paper';
import AssignButton from '../ui/AssignButton';
import AssignmentStatus from '../ui/AssignmentOverlay';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { LearningUnit, Exercise, LibraryProps } from '../../types/learningUnitTypes';
import { useApp } from '../../context/AppContext';
import { API_URL } from '@/config/api';

const categories = ['Articulation', 'Language Building', 'Comprehension'];

function matchesFilters(
  item: LearningUnit,
  searchQuery: string,
  statusFilter: 'All Units' | 'Assigned' | 'Completed',
  categoryFilter: string | null
) {
  const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesCategory = !categoryFilter || item.category === categoryFilter;

  if (statusFilter === 'All Units') return matchesSearch && matchesCategory;
  if (statusFilter === 'Assigned')
    return matchesSearch && matchesCategory && /^assigned/i.test(item.status);
  if (statusFilter === 'Completed')
    return matchesSearch && matchesCategory && item.status.toLowerCase().includes('completed');

  return false;
}

export default function LearningLibrary({ data }: LibraryProps) {
  const { childId, session } = useApp();
  const userId = session?.user?.id;

  const [selectedItem, setSelectedItem] = useState<LearningUnit | null>(null);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [statusFilter, setStatusFilter] = useState<'All Units' | 'Assigned' | 'Completed'>('All Units');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filteredData = data.filter(item =>
    matchesFilters(item, searchQuery, statusFilter, categoryFilter)
  );

  const toggleCategory = (category: string) => {
    setCategoryFilter(currentCategory => {
      if (currentCategory === category) {
        return null;
      }
      return category;
    });
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
    userId: string
  ) => {
    if (!session?.access_token) {
      Alert.alert('Error', 'You must be authorized to perform this action');
      return;
    }

    const response = await fetch(`${API_URL}/assignment/${childId}/unassign/${learningUnitId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to unassign learning unit (${response.status})`);
    }

    return await response.json();
  };

  const navigation = useNavigation();

  // Detail view
  if (selectedItem) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.backButton}>
          <IconButton
            icon="arrow-left"
            size={30}
            onPress={() => {
              setSelectedItem(null);
              setCurrentExercise(null);
              setSnackbarVisible(false);
            }}
          />
        </View>

        <Text variant="headlineMedium" style={styles.title}>{selectedItem.title}</Text>
        <Text variant="titleMedium" style={styles.category}>{selectedItem.category}</Text>

        <Text variant="bodyMedium" style={styles.description}>
          {selectedItem.description}
        </Text>

        <Text variant="titleMedium" style={styles.heading}>Activities</Text>
        <Divider style={styles.divider} />

        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          {selectedItem.exercises?.map((exercise, index) => (
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
                <Text variant="bodyMedium" style={styles.description}>
                  {exercise.description}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        <View style={styles.buttonWrapper}>
          <AssignButton onPress={() => setShowOverlay(true)} />
          <AssignmentStatus
            visible={showOverlay}
            status={selectedItem.status}
            onClose={() => {
              setShowOverlay(false);
              if (selectedItem.status === 'Assigned as Required' || selectedItem.status === 'Assigned as Recommended') {
                setSnackbarMessage(`"${selectedItem.title}" ${selectedItem.status.toLowerCase()}`);
                setSnackbarVisible(true);
              }
            }}
            onSelect={async (newStatus) => {
              try {
                if (!childId || !userId) {
                  Alert.alert('Error', 'Missing user or child information');
                  return;
                }

                if (newStatus === 'Unassigned') {
                  await unassignLearningUnit(selectedItem.id, childId, userId);
                } else if (newStatus === 'Assigned as Required') {
                  await assignLearningUnit(selectedItem.id, childId, userId, 'required');
                } else if (newStatus === 'Assigned as Recommended') {
                  await assignLearningUnit(selectedItem.id, childId, userId, 'recommended');
                }

                setSelectedItem(prev => prev ? { ...prev, status: newStatus } : prev);

                Alert.alert('Success', `Learning unit ${newStatus.toLowerCase()} successfully!`);

              } catch (error) {
                console.error('Error updating assignment:', error);
                Alert.alert('Error', 'Failed to update assignment. Please try again.');
              }
            }}
          />

          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={3000}
            action={{
              label: '✓',
              onPress: () => setSnackbarVisible(false),
            }}
          >
            {snackbarMessage}
          </Snackbar>
        </View>
      </ScrollView>
    );
  }

  // Library view
  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search learning units..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchbar}
      />

      {/* Filter by Status */}
      <View style={styles.statusRow}>
        {['All Units', 'Assigned', 'Completed'].map(label => (
          <TouchableOpacity key={label} onPress={() => setStatusFilter(label as any)}>
            <Text style={[styles.statusText, statusFilter === label && styles.statusActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter by Learning Skill (Category) */}
      <View style={{ height: 40, marginBottom: 10 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 8, alignItems: 'center' }}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                categoryFilter === category && styles.categoryButtonActive
              ]}
              onPress={() => toggleCategory(category)}
            >
              <Text
                style={[
                  styles.categoryUnselected,
                  categoryFilter === category && styles.categorySelected
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => setSelectedItem(item)}>
            <Card.Title title={item.title} />
            <Card.Content>
              <Text>{item.category}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  searchbar: {
    marginTop: 40,
    marginBottom: 10,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 16,
    color: '#444',
  },
  statusActive: {
    fontWeight: 'bold',
    color: '#000',
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    marginRight: 10,
    alignSelf: 'flex-start',
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryUnselected: {
    color: '#000',
    fontSize: 14,
  },
  categorySelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 25,
    marginTop: 30,
    fontWeight: '600',
    color: '#000',
  },
  category: {
    fontSize: 20,
    padding: 10,
    color: '#000',
  },
  heading: {
    fontSize: 20,
    padding: 10,
    color: '#000',
    paddingBottom: 20,
  },
  description: {
    fontSize: 15,
    padding: 10,
    color: '#000',
    paddingBottom: 15,
  },
  exercise_heading: {
    fontSize: 18,
    padding: 10,
    color: '#000',
  },
  backButton: {
    marginTop: 40,
    alignSelf: 'flex-start',
  },
  buttonWrapper: {
    marginTop: 20,
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'black',
    marginVertical: 2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150,
  },
});
