import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import TotalView from "./Total_View";
import RequiredView from "./Required_View";
import RecommendedView from "./Recommended_View";

export const segments = [
  { value: "total", label: "Total" },
  { value: "required", label: "Required" },
  { value: "recommended", label: "Recommended" },
];

export type AssignedLearningUnit = {
  assignmentId: string;
  learningUnitId: string;
  title: string;
  category: string;
  participationType: "required" | "recommended";
  time?: number;
  status?: string;
};

interface FiltersProps {
  assignedUnits: AssignedLearningUnit[];
}

const Filters = ({ assignedUnits }: FiltersProps) => {
  const [selected, setSelected] = useState("total");

  const renderContent = () => {
    const required = assignedUnits.filter((u) => u.participationType === "required");
    const recommended = assignedUnits.filter((u) => u.participationType === "recommended");

    switch (selected) {
      case "total":
        return <TotalView units={assignedUnits} />;
      case "required":
        return <RequiredView units={required} />;
      case "recommended":
        return <RecommendedView units={recommended} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.segmentContainer}>
        {segments.map((seg) => (
          <Button
            key={seg.value}
            mode={selected === seg.value ? "contained" : "outlined"}
            onPress={() => setSelected(seg.value)}
            style={styles.segment}
            buttonColor={selected === seg.value ? "#fd9029" : ""}
            textColor="#000"
            labelStyle={{ fontSize: 12 }}
          >
            {seg.label}
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
