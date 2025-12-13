import React, { useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Card, Text, Searchbar } from 'react-native-paper';
import DetailView from './UnitDetails';
import { useFocusEffect } from 'expo-router';
import { LearningUnit, LibraryProps } from '../../types/learningUnitTypes';
import { useApp } from '../../context/AppContext';
import { API_URL } from '@/config/api';

const categories = ['Articulation', 'Language Building', 'Comprehension'];

function matchesFilters(
  item: LearningUnit,
  searchQuery: string,
  statusFilter: 'All Units' | 'Assigned' | 'Completed',
  categoryFilter: string | null,
  assignedUnitIds: Set<string>,
  completedUnitIds: Set<string>,
) {
  const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesCategory = !categoryFilter || item.category === categoryFilter;

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
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const [assignedUnitIds, setAssignedUnitIds] = useState<Set<string>>(new Set());
  const [completedUnitIds, setCompletedUnitIds] = useState<Set<string>>(new Set());

  useFocusEffect(
    React.useCallback(() => {
      const fetchAssignments = async () => {
        try {
          const response = await fetch(`${API_URL}/assignment/${userId}/assigned_by/`, { method: 'GET' });
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
          Alert.alert('Error', 'Failed to load assigned learning units.');
        }
      };
      fetchAssignments();
    }, [childId, userId])
  );

  const filteredData = data.filter(item =>
    matchesFilters(item, searchQuery, statusFilter, categoryFilter, assignedUnitIds, completedUnitIds)
  );

  const toggleCategory = (category: string) => {
    setCategoryFilter(currentCategory => {
      if (currentCategory === category) {
        return null;
      }
      return category;
    });
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
      
      <View style={{ padding: 16 }}> 

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
                  categoryFilter === category && styles.categoryButtonActive,
                ]}
                onPress={() => toggleCategory(category)}
              >
                <Text
                  style={[
                    categoryFilter === category
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

            return (
              <Card style={[styles.card, { backgroundColor: darkMode ? "#3d3d3dff" : 'white' }]} onPress={() => setSelectedItem(item)}>
                {imageUrl && (
                   <Card.Cover source={{ uri: imageUrl }} />
                )}
                <Card.Title title={item.title} />
                <Card.Content>
                  <Text>{item.category}</Text>
                </Card.Content>
              </Card>
            );
          }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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