import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { IconButton, Divider } from 'react-native-paper';
import RepetitionCounter from './RepeatAssignmentPillButton';

interface AssignmentStatusProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (status: string) => void;
  options?: string[];
  status: string;
  repetitions?: number;
}

export default function AssignmentStatus({
  visible,
  onClose,
  onSelect,
  options = ['Unassigned', 'Assigned as Recommended', 'Assigned as Required'],
  status,
  repetitions: initialReps = 1,
}: AssignmentStatusProps) {
  const [selected, setSelected] = useState(status || null);
  const [repetitions, setRepetitions] = useState(initialReps);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <IconButton
            icon="close"
            size={25}
            onPress={onClose}
            style={styles.closeButton}
          />

          <Text style={styles.title}>Assignment Status</Text>

          {options.map((option) => (
            <View key={option}>
              <Divider />
              <TouchableOpacity
                style={styles.optionContainer}
                onPress={() => {
                  setSelected(option);
                  onSelect(option);
                }}
              >
                <Text style={styles.optionText}>{option}</Text>
                {selected === option && <Text style={styles.tick}>✓</Text>}
              </TouchableOpacity>

              {option === 'Assigned as Required' && selected === 'Assigned as Required' && (
                <RepetitionCounter value={repetitions} onChange={setRepetitions} />
              )}
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    alignItems: "flex-start",
    top: 10,
    left: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 40,
    marginBottom: 15,
    textAlign: 'left',
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  optionText: {
    fontSize: 16,
  },
  tick: {
    fontSize: 16,
    color: 'grey',
    fontWeight: 'bold',
  },
  repetitionContainer: {
    marginLeft: 10,
    marginTop: 40,
    alignSelf: "flex-start",
  },
  repetitionLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
    alignSelf: "flex-start",
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "grey",
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  counterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'grey',
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
