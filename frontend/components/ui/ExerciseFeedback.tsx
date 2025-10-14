import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ExerciseFeedbackProps {
  type: "correct" | "incorrect";
}

export const FeedbackIndicator: React.FC<ExerciseFeedbackProps> = ({ type }) => {
  const isCorrect = type === "correct";

  return (
    <View style={[
        styles.overlay,
        { backgroundColor: isCorrect ? "#fff7de" : "#fff7de" },
    ]}>
      <View
        style={[
          styles.circle,
          { backgroundColor: isCorrect ? "#4CAF50" : "#F44336" },
        ]}
      >
        <MaterialCommunityIcons
          name={isCorrect ? "check" : "close"}
          color="#fff"
          size={64}
        />
      </View>
      <Text
        style={[
          styles.text,
          { color: isCorrect ? "#2E7D32" : "#C62828" },
        ]}
      >
        {isCorrect ? "Correct!" : "Try again"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0, 
    bottom: 0,
    left: 0, 
    right: 0, 
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  text: {
    fontSize: 20,
    fontWeight: "700",
  },
});
