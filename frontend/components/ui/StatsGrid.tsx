import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

type StatsGridProps = {
  stats: [string, string | number][];
};

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <View style={styles.grid}>
      {stats.map(([label, stat], index) => (
        <View key={index} style={styles.gridItem}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.stat}>
            {typeof stat === "number" ? `${stat} min` : stat}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default StatsGrid;

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 0,
  },
  gridItem: {
    width: "48%",
    height: 80,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 8,
  },
  label: {
    fontSize: 11,
    paddingHorizontal: 5,
    textAlign: "center",
    fontWeight: "bold",
  },
  stat: {
    fontSize: 20,
    paddingTop: 5,
    textAlign: "center",
  },
});
