import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

interface AssignButtonProps {
  onPress?: () => void;
}

const AssignButton = ({ onPress }: AssignButtonProps) => (
  <View style={styles.container}>
    <Button
      textColor="white"
      buttonColor="#fd9029"
      mode="contained"
      onPress={onPress}
      contentStyle={{ paddingVertical: 10, paddingHorizontal: 20 }}
      labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
    >
      Assign Learning Unit
    </Button>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: "80%",
  },
});

export default AssignButton;
