import React, { useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, IconButton, Divider, Text, Searchbar, Snackbar } from 'react-native-paper';
import AssignButton from '../ui/AssignButton';
import AssignmentStatus from '../ui/AssignmentOverlay';

interface LearningUnit {
  id: string;
  title: string;
  category: string;
  status: string;
  description: string;
  exercises: Exercise[];
  repetitions?: number;
}

interface Exercise {
  name?: string;
  description: string;
}

interface LibraryProps {
  data: LearningUnit[];
}

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
  const [selectedItem, setSelectedItem] = useState<LearningUnit | null>(null);
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

  // View Details
  if (selectedItem) {
    return (
      <View style={styles.container}>
        <View style={styles.backButton}>
          <IconButton
            icon="arrow-left"
            size={30}
            onPress={() => {
              setSelectedItem(null);
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
            <View key={index} style={{ marginBottom: 16 }}>
              <Text variant="bodyLarge" style={styles.exercise_heading}>
                Exercise {index + 1}{exercise.name ? `: ${exercise.name}` : ''}
              </Text>
              <Divider style={styles.divider} />
              <Text variant="bodyMedium" style={styles.description}>
                {exercise.description}
              </Text>
            </View>
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
            onSelect={(newStatus) => {
              setSelectedItem(prev => prev ? { ...prev, status: newStatus } : prev);
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
      </View>
    );
  }

  // View Library
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
    backgroundColor: '#fff7de',
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
    backgroundColor: '#000',
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
    position: 'absolute',
    marginTop: '160%',
    left: 0,
    right: 0,
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
