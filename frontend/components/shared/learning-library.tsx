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
  exercises?: Exercise[];
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

        <Text variant="titleMedium" style={styles.heading}>Activities</Text>
        <Divider style={styles.divider} />

        {selectedItem.exercises?.map(ex => (
          <Card
            key={ex.id}
            style={styles.exerciseCard}
            onPress={() => setCurrentExercise(ex)}
          >
            <Card.Content>
              <Text>{ex.title}</Text>
            </Card.Content>
          </Card>
        ))}

        {currentExercise && <currentExercise.component />}

        <View style={styles.buttonWrapper}>
          <AssignButton onPress={() => setShowOverlay(true)} />
          <AssignmentStatus
            visible={showOverlay}
            status={selectedItem.status}
            onClose={() => setShowOverlay(false)}
            onSelect={(newStatus) => {
              setSelectedItem(prev => prev ? { ...prev, status: newStatus } : prev);
              setSnackbarMessage(`"${selectedItem.title}" ${newStatus.toLowerCase()}`);
              setSnackbarVisible(true);
            }}
          />
        </View>

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
    paddingBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: 'black',
    marginVertical: 2,
  },
  exerciseCard: {
    marginVertical: 8,
    backgroundColor: '#f0e5c9',
  },
  backButton: {
    marginTop: 40,
    alignSelf: 'flex-start',
  },
  buttonWrapper: {
    marginTop: 20,
    alignItems: 'center',
  },
});
