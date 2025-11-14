import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Divider, Text } from "react-native-paper";

interface ActivityCardsProps {
  title: string;
  completed: string;
  correct: number;
  incorrect: number;
  accuracy: string;
}

export const ActivityCards: React.FC<ActivityCardsProps> = ({ title, completed, correct, incorrect, accuracy }) => {

    return (
        <Card style={styles.activityCard} mode='elevated'>
            <Card.Content>
              <View style={styles.titleRow}>
                <Text variant="titleMedium" style={styles.title}>
                  {title}
                </Text>

                <Text variant="titleMedium" style={styles.completed}>
                  {completed}
                </Text>
              </View>

              <Divider style={{ marginVertical: 8 }} />
            <View style={styles.statsRow}>
              <View style={styles.statsCol}>
                 <Text variant="labelMedium">
                Correct
                </Text>
                 <Text variant="bodyMedium" style={styles.statNumber}>
                {correct}
                </Text>
              </View>

              <View style={styles.statsCol}>
                 <Text variant="labelMedium">
                Incorrect
                </Text>
                 <Text variant="bodyMedium" style={styles.statNumber}>
                {incorrect}
                </Text>
              </View>

              <View style={styles.statsCol}>
                 <Text variant="labelMedium">
                Accuracy
                </Text>
                 <Text variant="bodyMedium" style={styles.statNumber}>
                {accuracy}
                </Text>
              </View>
            </View>
          </Card.Content>
      </Card>
    );
};                 

export default ActivityCards;

const styles = StyleSheet.create({
  activityCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#fff",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  }, 
  title: {
    fontWeight: "600",
    flexShrink: 1
  },
  completed: {
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statsCol: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontWeight: "600",
    marginTop: 4,
  }
});                             