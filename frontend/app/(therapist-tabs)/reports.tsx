import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';

// TODO: replace hardcoded values with dynamic
const reports = [
  { id: '1', title: 'Report 1' },
  { id: '2', title: 'Report 2' },
  { id: '3', title: 'Special Assessment Report' },
];

export default function Reports() {
  const renderReportCard = ({ item }: { item: { id: string; title: string } }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.arrow}>➡️</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderReportCard}
        contentContainerStyle={{ paddingVertical: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', 
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#fd9029',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fd9029', // orange cards
    paddingHorizontal: 16,
    height: 60,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  arrow: {
    fontSize: 18,
    color: 'white',
  },
});
