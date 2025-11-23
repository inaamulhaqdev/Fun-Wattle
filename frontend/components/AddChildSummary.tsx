import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { IconButton, Card, Button, Text } from 'react-native-paper';

import { useChild } from '@/context/ChildContext';

export default function AddChildSummary() {

  const { childName, dateOfBirth, childTopGoal, childCommunicationNeeds, childMotivations } = useChild();

  const handleNext = () => {
    router.push('/child-onboarding/invite-therapist');
  };

  const handleEdit = (label: string) => {
    
    switch (label) {
    case 'Child Details':
      router.push(`/child-onboarding/add-child-details?returnTo=summary`);
      break;
    case 'Focus areas':
      router.push(`/child-onboarding/child-communication-needs?returnTo=summary`);
      break;
    case 'Motivations':
      router.push(`/child-onboarding/child-learning-style?returnTo=summary`);
      break;
    case `${childName}'s Top Goal`:
      router.push(`/child-onboarding/child-goal?returnTo=summary`);
      break;
    default:
      return;
    }
  };

  const cardDetails = [
    { label: 'Child Details', description: `Name: ${childName} \nDate of Birth: ${dateOfBirth}` },
    { label: `Focus areas`, description: `${childCommunicationNeeds.map(item => item.speechArea).join(', ')}` },
    { label: `Motivations`, description: `${childMotivations.map(item => item).join('\n')}` },
    { label: `${childName}'s Top Goal`, description: `${childTopGoal}` },
  ];

  return (
    <>
    <View style={styles.header}></View>
    <ScrollView contentContainerStyle={styles.container}>
      
      <Text variant="titleLarge" style={styles.title}>Summary of child profile</Text>

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
                onPress={() => handleEdit(label)}
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fd9029',
    paddingHorizontal: 20,
    paddingTop: 80,
    alignItems: 'flex-start'
  },
  title: {
    fontSize: 23,
    paddingVertical: 20,
    fontWeight: 'bold',
    alignSelf: 'center'
  },
  nextButton: {
    marginTop: 30,
    borderRadius: 8,
    marginBottom: 30,
    backgroundColor: "#fd9029",
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
    paddingBottom: 10,
  },
  cardLabel: {
    fontSize: 15,
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
