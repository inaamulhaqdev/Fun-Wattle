import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '@/context/AppContext';

interface CounterProps {
  value: number;
  onChange: (newValue: number) => void;
}

export default function Counter({ value, onChange }: CounterProps) {
  const { darkMode } = useApp();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: darkMode ? '#fff' : '#000' }]}>Number of question retries</Text>
      <View style={[styles.counter, { backgroundColor: darkMode ? '#545454ff' : '#fff' }]}>

        {/* Decrement */}
        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => onChange(Math.max(1, value - 1))}
        >
          <Text style={styles.counterText}>−</Text>
        </TouchableOpacity>

        {/* Increment */}
        <Text style={[styles.counterValue, { color: darkMode ? '#fff' : '#000' }]}>{value}</Text>
        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => onChange(value + 1)}
        >
          <Text style={styles.counterText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 10,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 14,
    marginBottom: 10,
    color: '#555',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#ccc',
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  counterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eee',
  },
  counterText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  counterValue: {
    paddingHorizontal: 15,
    fontSize: 16,
    textAlign: 'center',
  },
});
