import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import TotalView from "./Total_View";
import RequiredView from "./Required_View";
import RecommendedView from "./Recommended_View";

const segments = [
  { value: "total", label: "Total" },
  { value: "required", label: "Required" },
  { value: "recommended", label: "Recommended" },
];

const Filters = () => {
  const [selected, setSelected] = useState("total");

  const renderContent = () => {
    switch (selected) {
      case "total":
        return <TotalView />;
      case "required":
        return <RequiredView />;
      case "recommended":
        return <RecommendedView />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.segmentContainer}>
        {segments.map((segment) => (
          <Button
            key={segment.value}
            mode={selected === segment.value ? "contained" : "outlined"}
            onPress={() => setSelected(segment.value)}
            style={styles.segment}
            buttonColor={selected === segment.value ? "#FDD652" : ""}
            textColor="#000000"
            labelStyle={{ fontSize: 13 }}
          >
            {segment.label}
          </Button>
        ))}
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  segmentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
  },
  segment: {
    marginHorizontal: 2,
  },
  content: {
    alignItems: "center",
  },
});

export default Filters;
