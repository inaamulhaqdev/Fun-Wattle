import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";

type Stat = {
  label: string;
  value: number | string;
  unit?: string;
};

type StatsGridProps = {
  stats: Stat[];
  loading?: boolean;
};

export default function StatsGrid({ stats, loading }: StatsGridProps) {
  return (
    <View style={styles.grid}>
      {stats.map(({ label, value, unit }, index) => (
        <View key={index} style={styles.gridItem}>
          <Text style={styles.label}>{label}</Text>
          {label === "Total Activities Done" && loading ? (
            <ActivityIndicator size="small" color="orange" style={{ marginTop: 5 }} />
          ) : (
            <Text style={styles.stat}>{value}{unit ? ` ${unit}` : ""}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 1, 
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
