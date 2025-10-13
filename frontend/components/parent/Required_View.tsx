import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import TaskCard from "../ui/TaskCard";
import { TaskCardProps } from "../ui/TaskCard";
import { Text } from "react-native-paper";
import AssignButton from "@/components/ui/AssignButton";
import StatsGrid from "../ui/StatsGrid";
import { calculateTaskStats } from "../util/calculateTaskStats";

const tasks: TaskCardProps[] = [
  { key: 1, title: "M sound", status: "Completed", progress: "5/5", time: "12" },
  { key: 2, title: "R sound", status: "In Progress", progress: "3/5", time: "10" },
];

const { activitiesDone, overallTime } = calculateTaskStats(tasks);

const stats: [string, string | number][] = [
  ["Total Activities Done", activitiesDone],
  ["Total Practice Time", overallTime],
];

export default function RequiredView() {
  return (
    <View style={styles.container}>
      <StatsGrid stats={stats} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {tasks.length === 0 ? (
          <Text>No tasks available</Text>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.key}
              title={task.title}
              status={task.status}
              progress={task.progress}
              time={task.time}
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
