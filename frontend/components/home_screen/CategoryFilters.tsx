import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, ActivityIndicator } from "react-native-paper";
import FilteredView from "./FilteredView";
import { API_URL } from '@/config/api';
import { useApp } from "@/context/AppContext";

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

interface LUStatistics {
  total_exercises: number;
  completed_exercises: number;
  total_time_spent: number;
}

const Filters = ({ assignedUnits }: FiltersProps) => {
  const [selected, setSelected] = useState("total");
  const [statistics, setStats] = useState<LUStatistics>({
    total_exercises: 0,
    completed_exercises: 0,
    total_time_spent: 0,
  });
  const [fetchingStats, setFetchingStats] = useState(false);

  const { session, childId } = useApp();

  useEffect(() => {
    const fetchTotals = async () => {
      if (!childId) return;

      setFetchingStats(true);

      try {
        const response = await fetch(`${API_URL}/result/${childId}/learning_unit_overall/${selected}`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
        });

        if (!response.ok) throw new Error(`Failed to fetch exercises (${response.status})`);

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch unit stats:", err);
      } finally {
        setFetchingStats(false);
      }
    };
    fetchTotals();
  }, [childId, selected]);

  const renderContent = () => {
    return <FilteredView units={assignedUnits} category={selected} statistics={statistics} fetchingStats={fetchingStats}/>;
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
