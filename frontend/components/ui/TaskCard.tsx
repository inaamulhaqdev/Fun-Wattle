import React from "react";
import { StyleSheet, Dimensions, View, TouchableOpacity } from "react-native";
import { Card, Text } from "react-native-paper";

const screenWidth = Dimensions.get("window").width;

export interface TaskCardProps {
  title: string;
  status: string;
  category: string;
  time?: string;
  assigned_date: string;
  onPress?: () => void;
}

export default function TaskCard({
  title,
  status,
  category,
  time,
  assigned_date,
  onPress,
}: TaskCardProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
            <Text variant="titleMedium" style={{ fontSize: 12 }}>{title}</Text>
            <Text variant="titleSmall" style={styles.status}>{status}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.details}>{category}</Text>
            {time != null && (<Text variant="bodySmall" style={styles.details}>{time}</Text>)}
          </View>

          <View style={styles.row}>
            <Text style={styles.details}>Date assigned {assigned_date}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    marginVertical: 6,
    borderRadius: 12,
    width: screenWidth * 0.8,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#000000",
  },
  status: {
    fontWeight: "bold",
    fontSize: 12,
  },
  details: {
    paddingVertical: 5,
    fontSize: 13,
    color: "#555",
  },
});
