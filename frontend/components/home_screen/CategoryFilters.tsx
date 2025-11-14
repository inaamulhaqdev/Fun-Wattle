import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import FilteredView from "./FilteredView";

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
  time: number;
  status?: string;
};

interface FiltersProps {
  assignedUnits: AssignedLearningUnit[];
}

const Filters = ({ assignedUnits }: FiltersProps) => {
  const [selected, setSelected] = useState("total");

  const renderContent = () => {
    return <FilteredView units={assignedUnits} category={selected} />;
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
            buttonColor={selected === seg.value ? "#fDD652" : ""}
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
