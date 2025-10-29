import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, ProgressBar, Chip, useTheme} from "react-native-paper";

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
            <Card.Content style={{ justifyContent: "space-between"}}>
            <Text variant="titleLarge" style={styles.title}>{title}</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Chip icon="clock-outline" style={{ backgroundColor: "#fff" }} textStyle={{ color: theme.colors.primary }}>
                    {duration}
                </Chip>
                <Text variant="labelLarge" style={{ fontWeight: "600" }}>
                    {accuracy}
                </Text>
                
            </View>
            <ProgressBar progress={progress} color="#FDD652" style={styles.progressBar} />

            </Card.Content>
      </Card>
    );
};                 

export default UnitCard;

const styles = StyleSheet.create({
  unitCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#fff",
    width: "100%",
  },
  title: {
    marginBottom: 10,
    fontWeight: "600",
    textAlign: "center",
  }, 
  timeIcon: {
    alignSelf: "flex-start",
    backgroundColor: "rgb(0,0,0,0.05)",
  },
  progressContainer: {
    marginTop: 10,
    alignItems: "flex-start",
  },
  progressBar: {
    height: 8,
    borderRadius: 4, 
    width: "100%",
    marginTop: 4,
  }, 
  progressText: {
    alignSelf: "flex-end",
    marginTop: 4,
    fontWeight: "600",
  }
});                             