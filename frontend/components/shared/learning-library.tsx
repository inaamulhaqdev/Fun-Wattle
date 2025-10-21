import React, { useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView } from 'react-native';
import { Card, IconButton, Divider, Text, Searchbar, Snackbar } from 'react-native-paper';
import AssignButton from '../ui/AssignButton';
import AssignmentStatus from '../ui/AssignmentOverlay';

interface Exercise {
  id: string;
  title: string;
  component: React.ComponentType<any>;
}

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

export default function LearningLibrary({ data }: LibraryProps) {
  const [selectedItem, setSelectedItem] = useState<LearningUnit | null>(null);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const filteredData = data.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    marginBottom: 20,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
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
