import React, { useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ActivityIndicator, IconButton } from 'react-native-paper';
import { Card, Text, Searchbar } from 'react-native-paper';
import DetailView from './UnitDetails';
import AssignmentStatus from '../ui/AssignmentOverlay';
import { useFocusEffect } from 'expo-router';
import { LearningUnit, LibraryProps } from '../../types/learningUnitTypes';
import { useApp } from '../../context/AppContext';
import { API_URL } from '@/config/api';

const categories = ['Articulation', 'Language Building', 'Comprehension'];

function matchesFilters(
  item: LearningUnit,
  searchQuery: string,
  statusFilter: 'All Units' | 'Assigned' | 'Completed',
  categoryFilters: Set<string>,
  assignedUnitIds: Set<string>,
  completedUnitIds: Set<string>,
) {
  const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesCategory = categoryFilters.size === 0 || categoryFilters.has(item.category);

  if (statusFilter === 'All Units') return matchesSearch && matchesCategory;

  if (statusFilter === 'Assigned') {
    return matchesSearch && matchesCategory && assignedUnitIds.has(item.id);
  }

  if (statusFilter === 'Completed') {
    return matchesSearch && matchesCategory && completedUnitIds.has(item.id);
  }

  return false;
}

export default function LearningLibrary({ data, loading = false }: LibraryProps) {
  const { childId, session, darkMode } = useApp();
  const userId = session?.user?.id;

  const [selectedItem, setSelectedItem] = useState<LearningUnit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [statusFilter, setStatusFilter] = useState<'All Units' | 'Assigned' | 'Completed'>('All Units');
  const [categoryFilters, setCategoryFilters] = useState<Set<string>>(new Set());

  const [assignedUnitIds, setAssignedUnitIds] = useState<Set<string>>(new Set());
  const [completedUnitIds, setCompletedUnitIds] = useState<Set<string>>(new Set());
  
  const [menuOpenForUnit, setMenuOpenForUnit] = useState<string | null>(null);
  const [currentUnitStatus, setCurrentUnitStatus] = useState<string>('Unassign');

  useFocusEffect(
    React.useCallback(() => {
      const fetchAssignments = async () => {
        try {
          const response = await fetch(`${API_URL}/assignment/${userId}/assigned_by/`, { method: 'GET' });
          
          // If user not found (404), just set empty assignments - not an error
          if (response.status === 404) {
            setAssignedUnitIds(new Set());
            setCompletedUnitIds(new Set());
            return;
          }
          
          if (!response.ok) throw new Error(`Failed to fetch assignments (${response.status})`);

          const assignments = await response.json();

          const childAssignments = assignments.filter((a: any) => a.assigned_to.id === childId);

          const assignedIds = childAssignments.map((a: any) => a.learning_unit.id);
          setAssignedUnitIds(new Set(assignedIds));

          const completedIds = childAssignments
            .filter((a: any) => a.completed_at !== null)
            .map((a: any) => a.learning_unit.id);
          setCompletedUnitIds(new Set(completedIds));
        } catch (err) {
          console.error('Error fetching assignments:', err);
          // Only show alert for real errors, not for "no user" or "no assignments"
          Alert.alert('Error', 'Failed to load assigned learning units.');
        }
      };
      fetchAssignments();
    }, [childId, userId])
  );

  const filteredData = data.filter(item =>
    matchesFilters(item, searchQuery, statusFilter, categoryFilters, assignedUnitIds, completedUnitIds)
  );

  const toggleCategory = (category: string) => {
    setCategoryFilters(currentFilters => {
      const newFilters = new Set(currentFilters);
      if (newFilters.has(category)) {
        newFilters.delete(category);
      } else {
        newFilters.add(category);
      }
      return newFilters;
    });
  };

  const assignLearningUnit = async (
    learningUnitId: string,
    childId: string,
    userId: string,
    retries: number,
    participationType: 'required' | 'recommended',
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
        num_question_attempts: retries
      }),
    });

    const res = await response.json();

    if (!response.ok) {
      if (res.error) {
        Alert.alert('Error', res.error);
      } else {
        Alert.alert('Error', 'Failed to assign learning unit');
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
      Alert.alert('Error', 'You must be authorized to perform this action');
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
      Alert.alert('Error', 'Failed to unassign learning unit');
      return;
    }

    return true;
  };

  const handleAssignmentChange = async (unitId: string, newStatus: string, retries: number) => {
    try {
      if (!childId || !userId) {
        Alert.alert('Error', 'Child or user information is missing');
        return;
      }

      const isAssigned = assignedUnitIds.has(unitId);

      if (newStatus === 'Unassign') {
        if (!isAssigned) {
          Alert.alert('Error', 'This learning unit is not assigned');
          setMenuOpenForUnit(null);
          return;
        }
        const result = await unassignLearningUnit(unitId, childId);
        if (result) {
          setAssignedUnitIds(prev => {
            const updated = new Set(prev);
            updated.delete(unitId);
            return updated;
          });
          Alert.alert('Success', 'Learning unit unassigned successfully');
        }
      } else {
        const participationType = newStatus === 'Assign as Required' ? 'required' : 'recommended';
        const result = await assignLearningUnit(unitId, childId, userId, retries, participationType);
        if (result) {
          setAssignedUnitIds(prev => new Set([...prev, unitId]));
          Alert.alert('Success', `Learning unit assigned as ${participationType}`);
        }
      }

      setCurrentUnitStatus(newStatus);
      setMenuOpenForUnit(null);
    } catch (error) {
      console.error('Error updating assignment:', error);
      Alert.alert('Error', 'Failed to update assignment status');
    }
  };

  // Detail view
  if (selectedItem) {
    return (
      <DetailView
        selectedItem={selectedItem}
        assignedUnitIds={assignedUnitIds}
        setAssignedUnitIds={setAssignedUnitIds}
        onBack={() => setSelectedItem(null)}
      />
    );
  }

  // Library view
  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#000' : '#fff' }]}>
      <View style={styles.header}><Text style={styles.headerTitle}>Unit Library</Text></View>
      
      <View style={styles.contentContainer}> 

        <Searchbar
          placeholder="Search learning units..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchbar, { backgroundColor: darkMode ? '#404040ff' : '#fff' }]}
        />

        {/* Filter by Status */}
        <View style={styles.statusRow}>
          {['All Units', 'Assigned', 'Completed'].map(label => (
            <TouchableOpacity key={label} onPress={() => setStatusFilter(label as any)}>
              <Text style={[styles.statusText, statusFilter === label && styles.statusActive, { color: darkMode ? '#ffa550ff' : '#000' }]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filter by Learning Skill (Category) */}
        <View style={{ height: 40, marginBottom: 20 }}>
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
                  { backgroundColor: darkMode ? '#404040ff' : '#fff' },
                  categoryFilters.has(category) && styles.categoryButtonActive,
                ]}
                onPress={() => toggleCategory(category)}
              >
                <Text
                  style={[
                    categoryFilters.has(category)
                      ? styles.categorySelected
                      : { color: darkMode ? '#fff' : '#000' }
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FD902B" />
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.scrollContent}
            columnWrapperStyle={{ justifyContent: 'space-between'}}
            renderItem={({ item }) => {
            const imageUrl = item.image ? `${item.image}` : null;

            const isAssigned = assignedUnitIds.has(item.id);
            // If assigned, default to showing unassign option. If not assigned, default to assign as recommended
            const unitStatus = isAssigned ? 'Unassign' : 'Assign as Recommended';

            // Use the status from the item props (set by LearningUnitsPage) for badge display
            const showAssignedBadge = item.isAssigned || false;
            const showCompletedBadge = item.isCompleted || false;
            
            return (
              <Card style={[styles.card, { backgroundColor: darkMode ? "#3d3d3dff" : 'white' }]}>
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => setSelectedItem(item)}
                >
                  {imageUrl && (
                     <Card.Cover source={{ uri: imageUrl }} />
                  )}
                  
                  {/* Status Badge */}
                  {(showAssignedBadge || showCompletedBadge) && (
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: showCompletedBadge ? '#4CAF50' : '#FD902B' }
                    ]}>
                      <Text style={styles.statusBadgeText}>
                        {showCompletedBadge ? 'Completed' : 'Assigned'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                <View style={styles.cardHeader}>
                  <TouchableOpacity 
                    style={{ flex: 1 }} 
                    onPress={() => setSelectedItem(item)}
                  >
                    <Card.Title title={item.title} titleStyle={styles.cardTitleText} />
                  </TouchableOpacity>
                  <IconButton
                    icon="dots-vertical"
                    size={20}
                    onPress={(e) => {
                      e.stopPropagation();
                      setCurrentUnitStatus(unitStatus);
                      setMenuOpenForUnit(item.id);
                    }}
                    style={styles.menuButton}
                  />
                </View>
                <TouchableOpacity onPress={() => setSelectedItem(item)}>
                  <Card.Content>
                    <Text>{item.category}</Text>
                    <Text style={styles.timeText}>⏱️ 15 min</Text>
                  </Card.Content>
                </TouchableOpacity>
              </Card>
            );
          }}
          />
        )}

        {/* Assignment Status Overlay */}
        <AssignmentStatus
          visible={menuOpenForUnit !== null}
          status={currentUnitStatus}
          onClose={() => setMenuOpenForUnit(null)}
          onSelect={(newStatus, retries) => {
            if (menuOpenForUnit) {
              handleAssignmentChange(menuOpenForUnit, newStatus, retries);
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    paddingBottom: 15,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#fd9029',
    paddingHorizontal: 20,
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchbar: {
    marginTop: 5,
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
    backgroundColor: '#fd9029',
    borderColor: '#fd9029',
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
    width: '48%',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 0,
  },
  cardTitleText: {
    fontSize: 14,
  },
  menuButton: {
    margin: 0,
    marginTop: -4,
  },
  timeText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    marginTop: '50%',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingBottom: 250,
  },
});