import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, ProgressBar, Chip, useTheme, Button } from "react-native-paper";

interface UnitCardProps {
  title: string;
  duration: string;
  progress: number;
  accuracy: string;
}

export const UnitCard: React.FC<UnitCardProps> = ({ title, duration, progress, accuracy }) => {
    const theme = useTheme();

    return (
        <Card style={styles.unitCard} mode='elevated'>
            <Card.Content style={{ flex:1, justifyContent: "space-between"}}>
            <Text variant="titleLarge" style={styles.title}>{title}</Text>

            <Chip icon="clock-outline" style={styles.timeIcon} textStyle={{ color: theme.colors.primary}}>{duration}</Chip>

            <View style={styles.progressContainer} >
                <ProgressBar progress={progress} color={theme.colors.primary} style={styles.progressBar} />
                <Text variant="labelMedium" style={styles.progressText}>
                    {accuracy}
                </Text>
            </View>
            </Card.Content>
      </Card>
    );
};                 

export default UnitCard;

const styles = StyleSheet.create({
  unitCard: {
    marginBottom: 20,
    height: "25%",
    borderRadius: 16,
  },
  title: {
    marginBottom: 10,
    fontWeight: "600",
  }, 
  timeIcon: {
    alignSelf: "flex-start",
    marginBottom: 10,
    backgroundColor: "rgb(0,0,0,0.05)",
  },
  progressContainer: {
    position: "relative",
    justifyContent: "center",
  },

  progressBar: {
    height: 8,
    borderRadius: 4
  }, 
  progressText: {
    position: "absolute", 
    right: 0, 
    top: -22,
    fontWeight: "600",
  }
});                             