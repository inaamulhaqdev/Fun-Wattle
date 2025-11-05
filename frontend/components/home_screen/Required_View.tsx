import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import TaskCard from "../ui/TaskCard";
import StatsGrid from "../ui/StatsGrid";
import { router } from "expo-router";
import { AssignedLearningUnit } from "@/types/learningUnitTypes";
import { fetchUnitStats } from "@/components/util/fetchUnitStats";
import { useApp } from "@/context/AppContext";

interface RequiredViewProps {
  units: AssignedLearningUnit[];
}

export default function RequiredView({ units }: RequiredViewProps) {
  const { childId } = useApp();
  const [totalActivitiesDone, setTotalActivitiesDone] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Calculate number of completed required exercises
  useEffect(() => {
    const fetchTotals = async () => {
      if (!childId) return;

      setLoading(true);

      try {
        if (units.length === 0) {
          setTotalActivitiesDone(0);
          return;
        }

        const unitsStats = await Promise.all(
          units.map((unit) => fetchUnitStats(unit.learningUnitId, childId))
        );

        const totalDone = unitsStats.reduce(
          (sum, stats) => sum + stats.completedCount,
          0
        );

        setTotalActivitiesDone(totalDone);
      } catch (err) {
        console.error("Failed to fetch unit stats:", err);
        setTotalActivitiesDone(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTotals();
  }, [units, childId]);

  const overallTime = units.reduce((sum, unit) => sum + (unit.time || 0), 0);

  const stats = [
    { label: "Total Activities Done", value: totalActivitiesDone ?? "-", unit: "" },
    { label: "Total Practice Time", value: overallTime, unit: "mins" },
  ];

  // Map unit to TaskCard
  const tasks = units.map((unit) => ({
    key: unit.learningUnitId,
    title: unit.title,
    category: unit.category,
    status: unit.status || "Not started",
    time: unit.time !== undefined ? `${unit.time} minutes` : "0 minutes",
    assigned_date: unit.assignedDate || ""
  }));

  return (
    <View style={styles.container}>
      <StatsGrid stats={stats} loading={loading} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {tasks.length === 0 ? (
          <Text>No required tasks</Text>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.key}
              title={task.title}
              status={task.status}
              category={task.category}
              assigned_date={task.assigned_date}
              time={task.time}
              onPress={() =>
                router.push({
                  pathname: "/learning-unit-details",
                  params: { id: task.key as string, title: task.title as string, category: task.category as string},
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
