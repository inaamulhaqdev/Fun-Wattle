import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const AddChild = () => {
  const handleAddChild = () => {
    router.push('/parent/add-child-details'); 
  };

  return (
      <View style={styles.card}>
        <Text style={styles.cardText}>
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
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    alignSelf: "center",
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#FDD652',
    borderColor: 'black',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  addButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddChild;
