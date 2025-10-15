import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { IconButton, Card, Button, Text } from 'react-native-paper';

export default function AddChildSummary() {

  const handleNext = () => {
    router.push('./parent/child-added');
  };

  const cardDetails = [
    { label: 'Child Details', description: 'Alex \nAugust, 2021' },
    { label: "Alex's Top Goal", description: 'Increase Vocabulary' },
    { label: 'Starting point for Alex', description: 'Articulation (Sound Production)' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Summary of child profile</Text>

      <View style={styles.cardsContainer}>
        {cardDetails.map(({ label, description }, index) => (
          <Card key={index} mode="outlined" style={styles.card}>
            <Card.Content style={styles.cardHeader}>
              <Text style={styles.cardLabel}>{label}</Text>
              <Button
                mode="text"
                icon="pencil"
                compact
                labelStyle={styles.editButtonLabel}
                contentStyle={styles.editButtonContent}
              >
                Edit
              </Button>
            </Card.Content>

            <Card.Content>
              <Text style={styles.cardDescription}>{description}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>


      <Button
          mode="contained"
          style={styles.nextButton}
          onPress={handleNext}
          contentStyle={{ paddingVertical: 8 }}
          textColor="black"
        >
          Continue
        </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 25,
    marginTop: 30,
    paddingBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  nextButton: {
    marginTop: 30,
    borderRadius: 8,
    backgroundColor: "#FDD652",
  },
  cardsContainer: {
    gap: 10,
  },
  card: {
    borderWidth: 1,
    backgroundColor: "white",
    borderColor: '#ccc',
    elevation: 0,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  cardLabel: {
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 22,
  },
  cardDescription: {
    fontSize: 18,
    color: '#555',
    marginTop: 4,
  },
  editButtonLabel: {
    fontSize: 14,
    color: 'black',
  },
  editButtonContent: {
    alignSelf: 'flex-end',
  },
});
