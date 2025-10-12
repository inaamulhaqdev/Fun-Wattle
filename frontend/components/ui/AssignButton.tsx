import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

const AssignButton = () => (
  <View style={styles.container}>
    <Button
      textColor="black"
      buttonColor="#FDD652"
      mode="contained"
      onPress={() => console.log('Pressed')}
      contentStyle={{ paddingVertical: 10, paddingHorizontal: 20 }}
      labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
    >
      Assign Activity
    </Button>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: "80%",
  },
});

export default AssignButton;
