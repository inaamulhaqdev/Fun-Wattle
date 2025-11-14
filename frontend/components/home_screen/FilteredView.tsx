import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import TaskCard from "../ui/TaskCard";
import StatsGrid from "../ui/StatsGrid";
import { router } from "expo-router";
import { AssignedLearningUnit } from "@/types/learningUnitTypes";
import { API_URL } from '@/config/api';
import { useApp } from "@/context/AppContext";

interface FilterViewProps {
  units: AssignedLearningUnit[];
  category: string;
}

interface LUStatistics {
  total_exercises: number;
  completed_exercises: number;
  total_time_spent: number;
}

export default function FilteredView({ units, category }: FilterViewProps) {
  const { session, childId } = useApp();
  const [statistics, setStats] = useState<LUStatistics>({
    total_exercises: 0,
    completed_exercises: 0,
    total_time_spent: 0
  });
  const [loading, setLoading] = useState(true);

  /* useEffect(() => {
    const fetchTotals = async () => {
      if (!childId) return;

      setLoading(true);

      try {
        const response = await fetch(`${API_URL}/result/${childId}/learning_unit_overall/${category}`, {
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
        setLoading(false);
      }
    };
    fetchTotals();
  });

  const stats = [
    { label: "Total Activities Done", value: `${statistics.completed_exercises} / ${statistics.total_exercises}` },
    { label: "Total Practice Time", value: statistics.total_time_spent },
  ]; */

  const filteredUnits = category === "total"
  ? units
  : units.filter((u) => u.participationType === category);

  function formatTime(seconds: number) {
    if (seconds === undefined) return "0";
    if (seconds >= 60) return `${Math.floor(seconds / 60)} min ${seconds % 60} sec`;
    return `${seconds} sec`;
  }

  // Map unit to TaskCard
  const tasks = filteredUnits.map((unit) => ({
    key: unit.learningUnitId,
    title: unit.title,
    category: unit.category,
    status: unit.status || "Not started",
    time: formatTime(unit.time),
    assigned_date: unit.assignedDate || ""
  }));       

  return (
    <View style={styles.container}>
      {/* <StatsGrid stats={stats} loading={loading} /> */}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {tasks.length === 0 ? (
          <View>
            <Text>No tasks assigned</Text>
            <Text style={{ paddingTop: 50, alignSelf: "center" }}>Assign tasks over at</Text>
            <Text variant={"titleSmall"} style={{ paddingTop: 15, alignSelf: "center", fontSize: 20 }}>Learning Units</Text>
          </View>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.key}
              title={task.title}
              category={task.category}
              status={task.status}
              time={task.time}
              assigned_date={task.assigned_date}
              onPress={() =>
                router.push({
                  pathname: "/learning-unit-details",
                  params: {
                    id: task.key as string,
                    title: task.title as string,
                    category: task.category as string,
                  },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 120,
  },
});
