import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert, Image } from "react-native";
import { Text, DefaultTheme, Provider as PaperProvider, ActivityIndicator, Card } from "react-native-paper";
import { useLocalSearchParams, router } from "expo-router";
import { useApp } from "@/context/AppContext";
import { API_URL } from "../config/api";
import { Asset } from 'expo-asset';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Exercise {
  id: string;
  title: string;
  order: number;
  time_spent: number;
  completed: boolean;
  accuracy: number;
  num_correct: number;
  num_incorrect: number;
  last_practiced: string | null;
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
                num_incorrect: first.num_incorrect,
                last_practiced: first.completed_at || null
              };
            }
            return { 
              time_spent: 0, 
              completed: false, 
              accuracy: 0, 
              num_correct: 0, 
              num_incorrect: 0,
              last_practiced: null
            };
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
    if (seconds === undefined) return "0 min total";
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min total`;
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not practiced yet';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).replace(/\//g, '/') + ' | ' + 
    date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }).toLowerCase();
  };

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

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContainer}>
          {/* Main Learning Unit Card */}
          <Card style={[styles.mainCard, darkMode && styles.mainCardDark]} mode="elevated">
            <Card.Content>
              <Text variant="titleLarge" style={[styles.mainTitle, darkMode && styles.textDark]}>
                {title}
              </Text>
              <Text variant="bodyMedium" style={[styles.categoryText, darkMode && styles.textSecondaryDark]}>
                {category}
              </Text>
              
              <View style={styles.headerRow}>
                <View style={styles.timeContainer}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={darkMode ? '#aaa' : '#666'} />
                  <Text style={[styles.timeText, darkMode && styles.textDark]}>
                    {formatTime(totalDuration)}
                  </Text>
                </View>
                
                <Text style={[styles.accuracyText, darkMode && styles.textDark]}>
                  {unitAccuracy.toFixed(0)}% correct
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Exercises Section */}
          <Text style={[styles.exercisesHeader, darkMode && styles.textDark]}>
            Exercises
          </Text>

          {/* Individual Exercise Cards */}
          {exercises.map((exercise, index) => {
            const total = exercise.num_correct + exercise.num_incorrect;
            const accuracy = total > 0 ? Math.round((exercise.num_correct / total) * 100) : 0;
            const completedCount = exercises.filter(e => e.completed).length;

            return (
              <Card 
                key={exercise.id} 
                style={[styles.activityCard, darkMode && styles.activityCardDark]} 
                mode="outlined"
              >
                <Card.Content>
                  <Text style={[styles.lastPracticed, darkMode && styles.textSecondaryDark]}>
                    Last practised: {formatDate(exercise.last_practiced)}
                  </Text>
                  
                  <View style={styles.activityTitleRow}>
                    <Text style={[styles.activityTitle, darkMode && styles.textDark]}>
                      {exercise.title}
                    </Text>
                    <Text style={[styles.completionStatus, darkMode && styles.textDark]}>
                      {exercise.completed ? 'Completed' : 'Not started'}
                    </Text>
                  </View>

                  <View style={styles.divider} />

                  {/* Stats Table */}
                  <View style={styles.statsTable}>
                    <View style={styles.statsColumn}>
                      <Text style={[styles.statsLabel, darkMode && styles.textDark]}>Correct</Text>
                      <Text style={[styles.statsValue, darkMode && styles.textDark]}>
                        {exercise.num_correct}
                      </Text>
                    </View>

                    <View style={[styles.statsColumn, styles.statsColumnMiddle]}>
                      <Text style={[styles.statsLabel, darkMode && styles.textDark]}>Incorrect</Text>
                      <Text style={[styles.statsValue, darkMode && styles.textDark]}>
                        {exercise.num_incorrect}
                      </Text>
                    </View>

                    <View style={styles.statsColumn}>
                      <Text style={[styles.statsLabel, darkMode && styles.textDark]}>Accuracy</Text>
                      <Text style={[styles.statsValue, darkMode && styles.textDark]}>
                        {accuracy}%
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            );
          })}
        </ScrollView>
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
  mainCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 4,
    marginBottom: 16,
    marginTop: 8,
  },
  mainCardDark: {
    backgroundColor: '#2a2a2a',
  },
  mainTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 14,
    marginBottom: 12,
    color: '#666',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  accuracyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#666',
    borderRadius: 4,
  },
  exercisesHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  activityCard: {
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activityCardDark: {
    backgroundColor: '#1a1a1a',
    borderColor: '#444',
  },
  lastPracticed: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  activityTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  completionStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  statsTable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statsColumnMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e0e0e0',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  textDark: {
    color: '#fff',
  },
  textSecondaryDark: {
    color: '#aaa',
  },
});