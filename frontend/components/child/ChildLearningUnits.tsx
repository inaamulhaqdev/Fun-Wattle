import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Text, Card, ActivityIndicator, IconButton, Searchbar } from 'react-native-paper';
import { router } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { API_URL } from '@/config/api';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface LearningUnit {
  id: string;
  title: string;
  category: string;
  description: string;
  progress?: number;
  assignedAt?: string;
  image?: string;
  estimated_time?: number; // in minutes
  isAssigned?: boolean;
  isCompleted?: boolean;
}

export default function ChildLearningUnits() {
  const { childId, session } = useApp();
  const [activeTab, setActiveTab] = useState<'assigned' | 'all'>('assigned');
  const [assignedUnits, setAssignedUnits] = useState<LearningUnit[]>([]);
  const [allUnits, setAllUnits] = useState<LearningUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const categories = ['Articulation', 'Language Building', 'Comprehension'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch all learning units
        const allUnitsResponse = await fetch(`${API_URL}/content/learning_units/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        let assignedUnitIds: string[] = [];
        let completedUnitIds: string[] = [];

        // First fetch assigned units to get their IDs
        if (childId) {
          const assignedResponse = await fetch(`${API_URL}/assignment/${childId}/assigned_to/`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });

          if (assignedResponse.ok) {
            const assignments = await assignedResponse.json();
            assignedUnitIds = assignments.map((a: any) => a.learning_unit.id);
            console.log('Assigned Unit IDs:', assignedUnitIds);

            // Check completion status for each assigned unit
            for (const assignment of assignments) {
              const unitId = assignment.learning_unit.id;
              
              // Fetch exercises for this unit
              const exercisesResponse = await fetch(`${API_URL}/content/${unitId}/exercises/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
              });

              if (exercisesResponse.ok) {
                const exercises = await exercisesResponse.json();
                let allCompleted = exercises.length > 0;

                // Check if all exercises are completed
                for (const exercise of exercises) {
                  const resultsResponse = await fetch(`${API_URL}/result/${childId}/exercise/${exercise.id}/`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                  });

                  if (resultsResponse.ok) {
                    const results = await resultsResponse.json();
                    if (!Array.isArray(results) || results.length === 0) {
                      allCompleted = false;
                      break;
                    }
                  } else {
                    allCompleted = false;
                    break;
                  }
                }

                if (allCompleted && exercises.length > 0) {
                  completedUnitIds.push(unitId);
                }
              }
            }
            
            console.log('Completed Unit IDs:', completedUnitIds);
          }
        }

        if (allUnitsResponse.ok) {
          const allUnitsData = await allUnitsResponse.json();
          
          // Fetch exercises for each unit to calculate estimated time
          const unitsWithTime = await Promise.all(
            allUnitsData.map(async (unit: any) => {
              try {
                const exercisesResponse = await fetch(`${API_URL}/content/${unit.id}/exercises/`, {
                  method: 'GET',
                  headers: { 'Content-Type': 'application/json' },
                });
                
                let exerciseCount = 0;
                if (exercisesResponse.ok) {
                  const exercises = await exercisesResponse.json();
                  exerciseCount = exercises.length;
                }
                
                // Estimate 3 minutes per exercise, minimum 10 minutes
                const estimatedTime = Math.max(exerciseCount * 3, 10);
                
                return {
                  id: unit.id,
                  title: unit.title,
                  category: unit.category,
                  description: unit.description || '',
                  image: unit.image,
                  estimated_time: estimatedTime,
                  isAssigned: assignedUnitIds.includes(unit.id),
                  isCompleted: completedUnitIds.includes(unit.id),
                };
              } catch (error) {
                console.error(`Error fetching exercises for unit ${unit.id}:`, error);
                return {
                  id: unit.id,
                  title: unit.title,
                  category: unit.category,
                  description: unit.description || '',
                  image: unit.image,
                  estimated_time: 15, // Default fallback
                  isAssigned: assignedUnitIds.includes(unit.id),
                  isCompleted: completedUnitIds.includes(unit.id),
                };
              }
            })
          );
          
          console.log('All units with status:', unitsWithTime.map(u => ({ 
            id: u.id, 
            title: u.title, 
            isAssigned: u.isAssigned, 
            isCompleted: u.isCompleted 
          })));
          
          setAllUnits(unitsWithTime);
        }

        // Fetch assigned units for this child
        if (childId) {
          const assignedResponse = await fetch(`${API_URL}/assignment/${childId}/assigned_to/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (assignedResponse.ok) {
            const assignments = await assignedResponse.json();
            console.log('Child assignments:', assignments);

            // Transform to LearningUnit format and fetch exercise count
            const unitsWithTime = await Promise.all(
              assignments.map(async (assignment: any) => {
                try {
                  const exercisesResponse = await fetch(`${API_URL}/content/${assignment.learning_unit.id}/exercises/`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                  });
                  
                  let exerciseCount = 0;
                  if (exercisesResponse.ok) {
                    const exercises = await exercisesResponse.json();
                    exerciseCount = exercises.length;
                  }
                  
                  const estimatedTime = Math.max(exerciseCount * 3, 10);
                  
                  return {
                    id: assignment.learning_unit.id,
                    title: assignment.learning_unit.title,
                    category: assignment.learning_unit.category,
                    description: assignment.learning_unit.description || '',
                    assignedAt: assignment.assigned_at,
                    progress: 0,
                    estimated_time: estimatedTime,
                  };
                } catch (error) {
                  return {
                    id: assignment.learning_unit.id,
                    title: assignment.learning_unit.title,
                    category: assignment.learning_unit.category,
                    description: assignment.learning_unit.description || '',
                    assignedAt: assignment.assigned_at,
                    progress: 0,
                    estimated_time: 15,
                  };
                }
              })
            );
            
            const units = unitsWithTime;

            // Remove duplicates
            const uniqueUnits = units.filter(
              (unit, index, self) => index === self.findIndex((u) => u.id === unit.id)
            );

            setAssignedUnits(uniqueUnits);
          }
        }
      } catch (error) {
        console.error('Error fetching learning units:', error);
        Alert.alert('Error', 'Failed to load learning units');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const handleHome = () => {
    router.push('/child-dashboard');
  };

  const handleStats = () => {
    router.push('/child-stats');
  };

  const handleMascotCustomization = () => {
    router.push('/mascot-customization');
  };

  const handleSettings = () => {
    router.push('/child-settings');
  };

  const currentUnits = activeTab === 'assigned' ? assignedUnits : allUnits;

  // Filter units based on search and category
  const filteredUnits = currentUnits.filter(unit => {
    const matchesSearch = unit.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || unit.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleCategory = (category: string) => {
    setCategoryFilter(currentCategory => {
      if (currentCategory === category) {
        return null;
      }
      return category;
    });
  };

  // Animated Navigation Button Component
  const AnimatedNavButton = ({ children, style, onPress = () => {} }: {
    children: React.ReactNode;
    style: any;
    onPress?: () => void;
  }) => {
    return (
      <TouchableOpacity
        style={style}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={30} onPress={handleBack} iconColor="#fff" />
          <Text style={styles.headerTitle}>My Learning Units</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD902B" />
        </View>
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

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assigned' && styles.activeTab]}
          onPress={() => setActiveTab('assigned')}
        >
          <Text style={[styles.tabText, activeTab === 'assigned' && styles.activeTabText]}>
            Assigned
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Learning Units
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters - Only show for "All" tab */}
      {activeTab === 'all' && (
        <View style={styles.filtersContainer}>
          <Searchbar
            placeholder="Search learning units..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchbar}
          />

          {/* Category Filter */}
          <View style={styles.categoryScrollContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScrollContent}
            >
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    categoryFilter === category && styles.categoryButtonActive,
                  ]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      categoryFilter === category && styles.categoryTextActive
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Content - Different rendering for assigned vs all */}
      {activeTab === 'assigned' ? (
        <ScrollView style={styles.content}>
          {filteredUnits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No learning units assigned yet!</Text>
              <Text style={styles.emptySubtext}>
                Ask your parent or therapist to assign some activities for you
              </Text>
            </View>
          ) : (
            filteredUnits.map((unit) => (
              <TouchableOpacity key={unit.id} onPress={() => handleUnitPress(unit)}>
                <Card style={styles.unitCard}>
                  <Card.Content>
                    <Text variant="titleLarge" style={styles.unitTitle}>
                      {unit.title}
                    </Text>
                    <View style={styles.unitMeta}>
                      <Text variant="labelLarge" style={styles.unitCategory}>
                        {unit.category}
                      </Text>
                      {unit.estimated_time && (
                        <Text variant="labelMedium" style={styles.unitTime}>
                          ⏱️ {unit.estimated_time} min
                        </Text>
                      )}
                    </View>
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
      ) : (
        <View style={styles.gridContainer}>
          {filteredUnits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No learning units found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredUnits}
              keyExtractor={item => item.id}
              numColumns={2}
              contentContainerStyle={styles.gridContent}
              columnWrapperStyle={styles.gridRow}
              renderItem={({ item }) => {
                const imageUrl = item.image ? `${item.image}` : null;
                console.log(`Rendering unit ${item.title}:`, { 
                  isAssigned: item.isAssigned, 
                  isCompleted: item.isCompleted,
                  hasImage: !!imageUrl 
                });
                return (
                  <Card style={styles.gridCard} onPress={() => handleUnitPress(item)}>
                    {imageUrl && (
                      <View style={styles.cardImageContainer}>
                        <Card.Cover source={{ uri: imageUrl }} style={styles.cardImage} />
                        {/* Status Badge */}
                        {item.isCompleted && (
                          <View style={[styles.statusBadge, styles.completedBadge]}>
                            <Text style={styles.statusText}>Completed</Text>
                          </View>
                        )}
                        {!item.isCompleted && item.isAssigned && (
                          <View style={[styles.statusBadge, styles.assignedBadge]}>
                            <Text style={styles.statusText}>Assigned</Text>
                          </View>
                        )}
                      </View>
                    )}
                    {!imageUrl && (
                      <View style={styles.noImageContainer}>
                        {/* Status Badge for cards without images */}
                        {item.isCompleted && (
                          <View style={[styles.statusBadge, styles.completedBadge, styles.statusBadgeNoImage]}>
                            <Text style={styles.statusText}>Completed</Text>
                          </View>
                        )}
                        {!item.isCompleted && item.isAssigned && (
                          <View style={[styles.statusBadge, styles.assignedBadge, styles.statusBadgeNoImage]}>
                            <Text style={styles.statusText}>Assigned</Text>
                          </View>
                        )}
                      </View>
                    )}
                    <Card.Title title={item.title} titleStyle={styles.gridCardTitle} />
                    <Card.Content>
                      <Text style={styles.gridCardCategory}>{item.category}</Text>
                      {item.estimated_time && (
                        <Text style={styles.gridCardTime}>⏱️ {item.estimated_time} min</Text>
                      )}
                    </Card.Content>
                  </Card>
                );
              }}
            />
          )}
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <AnimatedNavButton style={styles.navButton} onPress={handleHome}>
          <FontAwesome6 name="house-chimney-window" size={40} color="white" />
        </AnimatedNavButton>

        <AnimatedNavButton style={styles.navButton}>
          <FontAwesome5 name="book" size={40} color="#FFD700" />
        </AnimatedNavButton>

        <AnimatedNavButton style={styles.navButton} onPress={handleStats}>
          <FontAwesome5 name="trophy" size={40} color="white" />
        </AnimatedNavButton>

        <AnimatedNavButton style={styles.navButton} onPress={handleMascotCustomization}>
          <MaterialCommunityIcons name="koala" size={60} color="white" />
        </AnimatedNavButton>

        <AnimatedNavButton style={styles.navButton} onPress={handleSettings}>
          <FontAwesome5 name="cog" size={40} color="white" />
        </AnimatedNavButton>
      </View>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FD902B',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#FD902B',
    fontWeight: 'bold',
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
  filtersContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchbar: {
    backgroundColor: '#fff',
    marginBottom: 16,
    elevation: 2,
  },
  categoryScrollContainer: {
    height: 50,
    marginBottom: 10,
  },
  categoryScrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonActive: {
    backgroundColor: '#FD902B',
    borderColor: '#FD902B',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  gridContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gridContent: {
    padding: 8,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  gridCard: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    height: 120,
  },
  noImageContainer: {
    height: 120,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  statusBadgeNoImage: {
    top: 8,
    right: 8,
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
  },
  assignedBadge: {
    backgroundColor: '#FD902B',
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  gridCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  gridCardCategory: {
    fontSize: 12,
    color: '#666',
  },
  gridCardTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
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
  unitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  unitCategory: {
    color: '#FD902B',
  },
  unitTime: {
    color: '#666',
    fontSize: 12,
  },
  unitDescription: {
    color: '#555',
    marginTop: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fd9029',
    paddingVertical: 10,
    paddingBottom: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
});