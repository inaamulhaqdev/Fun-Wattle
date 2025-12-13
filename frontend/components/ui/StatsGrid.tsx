import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Text } from "react-native-paper";

type Stat = {
  label: string;
  value: number | string;
};

type StatsGridProps = {
  stats: Stat[];
  fetchingStats: boolean;
};

export default function StatsGrid({ stats, fetchingStats }: StatsGridProps) {

  const formatValue = (value: number) => {
    if (value >= 60) {
      const mins = Math.floor(value / 60);
      const secs = value % 60;
      return `${mins} min ${secs.toString().padStart(2, "0")} sec`;
    } else {
      return `${value} secs`;
    }
  };

  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: fetchingStats ? 0.3 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fetchingStats]);

  return (
    <View style={styles.grid}>
      {stats.map(({ label, value }, index) => {
        let displayValue;

        if (label === "Total Activities Done") {
          displayValue = value;
        } else if (typeof value === "number") {
          displayValue = formatValue(value);
        }

        return (
          <View key={index} style={styles.gridItem}>
            <Text style={styles.label}>{label}</Text>
            <Animated.Text style={[styles.stat, { opacity }]}>
              {displayValue}
            </Animated.Text>
          </View>
        );
      })}
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
    flexBasis: "48%",
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
    color: 'black',
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
