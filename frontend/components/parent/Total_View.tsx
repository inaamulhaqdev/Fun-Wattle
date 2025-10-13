import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import TaskCard, { TaskCardProps } from "../ui/TaskCard";
import { Text } from "react-native-paper";
import StatsGrid from "../ui/StatsGrid";
import { calculateTaskStats } from "../util/calculateTaskStats";
import { router } from "expo-router";

const tasks: TaskCardProps[] = [
  { key: 1, title: "M sound", status: "Completed", progress: "5/5", time: "12" },
  { key: 2, title: "R sound", status: "In Progress", progress: "3/5", time: "10" },
];

const { activitiesDone, overallTime } = calculateTaskStats(tasks);

const stats: [string, string | number][] = [
  ["Total Activities Done", activitiesDone],
  ["Total Practice Time", overallTime],
  ["Number of AI Chats", 3],
  ["Total Chat Time", 5],
];

export default function TotalView() {
  return (
    <View style={styles.container}>
      <StatsGrid stats={stats} />

      <ScrollView contentContainerStyle={styles.taskScroll}>
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
               onPress={() => router.push({
                pathname: "/learning-unit-details",
                params: { 
                id: task.key.toString() 
              },
            })}
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
  taskScroll: {
    marginBottom: 100,
  },
});
