import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert } from "react-native";
import { Text, DefaultTheme, Provider as PaperProvider, ActivityIndicator } from "react-native-paper";
import { ActivityCards } from "@/components/ui/ActivityCards";
import { UnitCard } from "@/components/ui/UnitCard";
import { useLocalSearchParams } from "expo-router";
import { useApp } from "@/context/AppContext";
import { API_URL } from "../config/api";

interface Exercise {
  id: string;
  title: string;
  order: number;
  time_spent?: number;
  completed_at?: string | null;
  accuracy: number;
}

const calculateAccuracy = (exercises: Exercise[]) => {
  const accuracies: number[] = [];
  for (const ex of exercises) {
    accuracies.push(ex.accuracy);
  }

  if (accuracies.length === 0) return 0;

  let total = 0;
  for (const a of accuracies) {
    total += a;
  }

  return total / accuracies.length;
};

export default function LearningUnitDetails() {
  const { id, title, category } = useLocalSearchParams<{ id: string; title: string; category: string }>();
  const { childId } = useApp();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [unitAccuracy, setUnitAccuracy] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      if (!id || !childId) return;

      setLoading(true);
      try {
        // Fetch all exercises for this unit and their respective results
        const resp = await fetch(`${API_URL}/api/exercises/${id}/`);
        if (!resp.ok) throw new Error("Failed to fetch exercises");

        const data = await resp.json();
        const sorted = (data as { id: string; title: string; order: number }[]).sort(
          (a, b) => a.order - b.order
        );

        const results = await Promise.all(
          sorted.map(async (ex) => {
            const resResp = await fetch(`${API_URL}/api/results/${childId}/exercise/${ex.id}/`);
            if (!resResp.ok) return { time_spent: 0, completed_at: null, accuracy: 0 };

            const resJson = await resResp.json();
            if (Array.isArray(resJson) && resJson.length > 0) {
              const first = resJson[0];
              return {
                time_spent: first.time_spent || 0,
                completed_at: first.completed_at || null,
                accuracy: first.accuracy ?? 0,
              };
            }
            return { time_spent: 0, completed_at: null, accuracy: 0 };
          })
        );

        // Calculate total time spent and number of completed exercises
        let totalTime = 0;
        let completedCount = 0;
        const exercisesWithResults = sorted.map((ex, i) => {
          const r = results[i];
          totalTime += r.time_spent;
          if (r.completed_at) completedCount++;

          return { ...ex, ...r };
        });

        setExercises(exercisesWithResults);
        setTotalDuration(totalTime);
        setProgress(sorted.length ? completedCount / sorted.length : 0);
        setUnitAccuracy(calculateAccuracy(exercisesWithResults));
      } catch (err) {
        console.error("Fetch error:", err);
        Alert.alert("Error", "Failed to load exercises");
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [id, childId]);

  return (
    <PaperProvider theme={DefaultTheme}>
      <View style={styles.container}>
        <TouchableOpacity>
          <UnitCard
            title={`${title} \n ${category}`}
            duration={`${totalDuration} mins`}
            progress={progress}
            accuracy={`${(unitAccuracy * 100).toFixed(0)}%`}
          />
        </TouchableOpacity>

        <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: "600", fontSize: 20, marginLeft: 13 }}>
          Activities
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FD902B" />
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContainer}>
            {exercises.map((exercise) => (
              <ActivityCards
                key={exercise.id}
                title={exercise.title}
                completed={exercise.completed_at ? "Completed" : "Not started"}
                correct={0}
                incorrect={0}
                accuracy={exercise.accuracy != null ? `${(exercise.accuracy * 100).toFixed(0)}%` : ""}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#fff7de",
  },
  scrollContainer: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 150
  },
});