import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert, Image } from "react-native";
import { Text, DefaultTheme, Provider as PaperProvider, ActivityIndicator } from "react-native-paper";
import { ActivityCards } from "@/components/ui/ActivityCards";
import { UnitCard } from "@/components/ui/UnitCard";
import { useLocalSearchParams } from "expo-router";
import { useApp } from "@/context/AppContext";
import { API_URL } from "../config/api";
import { Asset } from 'expo-asset';

interface Exercise {
  id: string;
  title: string;
  order: number;
  time_spent: number;
  completed: boolean;
  accuracy: number;
  num_correct: number;
  num_incorrect: number;
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

  const [bgLoaded, setBgLoaded] = useState(false);

  const { darkMode } = useApp();

  useEffect(() => {
    const fetchExercises = async () => {
      if (!id || !childId) return;

      setLoading(true);
      try {
        const resp = await fetch(`${API_URL}/content/${id}/exercises/`);
        if (!resp.ok) throw new Error("Failed to fetch exercises");

        const data = await resp.json();
        const sorted = (data as { id: string; title: string; order: number }[]).sort(
          (a, b) => a.order - b.order
        );

        const results = await Promise.all(
          sorted.map(async (ex) => {
            const resResp = await fetch(`${API_URL}/result/${childId}/exercise/${ex.id}/`);
            if (!resResp.ok) throw new Error('Failed to fetch result details.');

            const resJson = await resResp.json();
            if (Array.isArray(resJson) && resJson.length > 0) {
              const first = resJson[0];
              return {
                time_spent: first.time_spent || 0,
                completed: true,
                accuracy: first.accuracy,
                num_correct: first.num_correct,
                num_incorrect: first.num_incorrect
              };
            }
            return { time_spent: 0, completed: false, accuracy: 0, num_correct: 0, num_incorrect: 0 };
          })
        );

        // Calculate total time spent and number of completed exercises
        let totalTime = 0;
        let completedCount = 0;
        const exercisesWithResults = sorted.map((ex, i) => {
          const r = results[i];
          totalTime += r.time_spent;
          if (r.completed) completedCount++;

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

  useEffect(() => {
    async function loadBackground() {
      try {
        const asset = Asset.fromModule(
          darkMode
            ? require('@/assets/images/child-dashboard-background-dark.jpg')
            : require('@/assets/images/child-dashboard-background.jpg')
        );
        await asset.downloadAsync();
        setBgLoaded(true);
      } catch (err) {
        console.error("Image preload failed", err);
        setBgLoaded(true);
      }
    }

    loadBackground();
  }, [darkMode]);

  function formatTime(seconds: number) {
    if (seconds === undefined) return "0";
    if (seconds >= 60) return `${Math.floor(seconds / 60)} min ${seconds % 60} sec`;
    return `${seconds} sec`;
  }

  if (loading || !bgLoaded) {
    return (
      <PaperProvider>
        <View style={[styles.loadingContainer, { backgroundColor: darkMode ? '#000' : '#fff' }]}>
          <ActivityIndicator size="large" color="#FD902B" />
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={DefaultTheme}>
      <View style={styles.container}>
        {/* Background Image */}
        <Image
          source={
            darkMode
              ? require('@/assets/images/child-dashboard-background-dark.jpg')
              : require('@/assets/images/child-dashboard-background.jpg')
          }
          style={styles.backgroundImage}
          resizeMode="cover"
          onLoad={() => {
            console.log('Background image loaded');
          }}
        />

        <TouchableOpacity>
          <UnitCard
            title={`${title} \n ${category}`}
            duration={formatTime(totalDuration)}
            progress={progress}
            accuracy={`${(unitAccuracy * 100).toFixed(0)}%`}
          />
        </TouchableOpacity>

        <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: "600", fontSize: 20, marginLeft: 13, color: darkMode ? "white" : "black" }}>
          Exercises
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
                completed={exercise.completed ? "Completed" : "Not started"}
                correct={exercise.num_correct}
                incorrect={exercise.num_incorrect}
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
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '120%',
    height: '120%',
    objectFit: "cover",
    opacity: 0.5
  },
  scrollContainer: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});