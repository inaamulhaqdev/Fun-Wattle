import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useApp } from "@/context/AppContext";

const AddChild = () => {
  const { darkMode } = useApp();

  const handleAddChild = () => {
    router.push('/child-onboarding/add-child-details'); 
  };

  return (
      <View style={[styles.card, { backgroundColor: darkMode ? '#404040ff' : '#e6e6e6ff' }]}>
        <Text style={[styles.cardText, { color: darkMode ? '#fff' : '#000' }]}>
          To get started, please add your child
        </Text>

        <TouchableOpacity style={styles.addButton} onPress={handleAddChild}>
          <Text style={styles.addButtonText}>Add Child</Text>
        </TouchableOpacity>
      </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '90%',  
    marginTop: 100,
    paddingHorizontal: 10,
    paddingVertical: 100,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 20,
    alignSelf: "center",
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#fd9029',
    borderColor: '#864406ff',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddChild;
