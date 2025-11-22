import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Feather, FontAwesome5, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../config/api';
import { useApp } from "@/context/AppContext";

// Task data structure
interface Task {
  id: string;
  name: string;
  completed: boolean;
  description: string;
}

const StatsPage = () => {
  const { childId } = useApp();
  const [allExerciseResults, setAllExerciseResults] = useState<any[]>([]);
  const [completedThisWeek, setCompletedThisWeek] = useState<number>(0);
  // Fetch all exercise results for the child
  useEffect(() => {
    const fetchAllExerciseResults = async () => {
      if (!childId) return;
      try {
        const res = await fetch(`${API_URL}/result/${childId}/all/`);
        const data = res.ok ? await res.json() : [];
        setAllExerciseResults(Array.isArray(data) ? data : []);
        // Calculate how many exercises completed this week
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
        const completed = (Array.isArray(data) ? data : []).filter((result) => {
          if (!result.completed_at) return false;
          const completedDate = new Date(result.completed_at);
          return completedDate >= startOfWeek && completedDate <= now;
        }).length;
        setCompletedThisWeek(completed);
      } catch (err) {
        console.error('Error fetching all exercise results:', err);
        setAllExerciseResults([]);
        setCompletedThisWeek(0);
      }
    };
    fetchAllExerciseResults();
  }, [childId]);
  const [exerciseResults, setExerciseResults] = useState<any[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  // Fetch results for a specific exercise for the child
  useEffect(() => {
    const fetchExerciseResults = async () => {
      if (!childId || !selectedExerciseId) return;
      try {
        const res = await fetch(`${API_URL}/result/${childId}/exercise/${selectedExerciseId}/`);
        const data = res.ok ? await res.json() : [];
        setExerciseResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching exercise results:', err);
        setExerciseResults([]);
      }
    };
    fetchExerciseResults();
  }, [childId, selectedExerciseId]);
  const [streakCount, setStreakCount] = useState<number>(0);
  // Fetch streak count for child
  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await fetch(`${API_URL}/profile/${childId}/streak/`);
        const data = res.ok ? await res.json() : { streak: 0 };
        setStreakCount(data.streak || 0);
      } catch (err) {
        console.error('Error fetching streak count:', err);
        setStreakCount(0);
      }
    };
    if (childId) fetchStreak();
  }, [childId]);
  const [coinCount, setCoinCount] = useState<number>(0);
  // Fetch coin count for child
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const res = await fetch(`${API_URL}/profile/${childId}/coins`);
        const data = res.ok ? await res.json() : { coins: 0 };
        setCoinCount(data.coins || 0);
      } catch (err) {
        console.error('Error fetching coin count:', err);
        setCoinCount(0);
      }
    };
    if (childId) fetchCoins();
  }, [childId]);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      // Hide tab bar when this screen is focused
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'none' }
      });

      // Show tab bar when leaving this screen
      return () => {
        navigation.getParent()?.setOptions({
          tabBarStyle: undefined
        });
      };
    }, [navigation])
  );

  const handleMascotCustomization = () => {
    router.push('/mascot-customization');
  };

  const handleHome = () => {
    router.push('/child-dashboard');
  };

  const handleSettings = () => {
    router.push('/child-settings');
  };

  const [tasks, setTasks] = useState<Task[]>([]);

  // Fetch recommended tasks assigned to the child
  useEffect(() => {
    const fetchAssignedTasks = async () => {
      try {
        const [unitsResp, assignmentsResp] = await Promise.all([
          fetch(`${API_URL}/content/learning_units/`),
          fetch(`${API_URL}/assignment/${childId}`)
        ]);

        if (!unitsResp.ok || !assignmentsResp.ok) {
          throw new Error('Failed to fetch data');
        }

        const allUnits = await unitsResp.json();
        const childAssignments = await assignmentsResp.json();

        const unitMap: Record<string, any> = {};
        allUnits.forEach((unit: any) => {
          unitMap[unit.id] = unit;
        });

        // Filter for recommended units and format accordingly
        const requiredAssignments = childAssignments.filter(
          (a: any) => a.participation_type === 'recommended'
        );

        const formattedTasks: Task[] = requiredAssignments.map((assignment: any) => {
          const unit = unitMap[assignment.learning_unit];
          return {
            id: unit.id,
            name: unit.title,
            completed: assignment.completed_at !== null,
            description: unit.description
          };
        });

        setTasks(formattedTasks);

      } catch (err) {
        console.log('Error fetching recommended tasks:', err);
      }
    };

    fetchAssignedTasks();
  }, [childId]);

  const StatCard = ({ title, value, subtitle, icon, backgroundColor }: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ReactNode;
    backgroundColor: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor }]}>
      <View style={styles.statIcon}>
        {icon}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const RecommendedExercise = ({ title, description, difficulty, onPress }: {
    title: string;
    description: string;
    difficulty: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.exerciseCard} onPress={onPress}>
      <View style={styles.exerciseContent}>
        <Text style={styles.exerciseTitle}>{title}</Text>
        <Text style={styles.exerciseDescription}>{description}</Text>
        <View style={styles.exerciseFooter}>
          <View style={[styles.difficultyBadge,
            { backgroundColor: difficulty === 'Easy' ? '#4CAF50' :
              difficulty === 'Medium' ? '#FF9800' : '#F44336' }
          ]}>
            <Text style={styles.difficultyText}>{difficulty}</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#666" />
        </View>
      </View>
    </TouchableOpacity>
  );

  // Animated Navigation Button Component (same as ChildDashboard)
  const AnimatedNavButton = ({ children, style, onPress = () => {} }: {
    children: React.ReactNode;
    style: any;
    onPress?: () => void;
  }) => {
    return (
      <TouchableOpacity
        style={style}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Progress</Text>
      </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Stats Grid */}
          <View style={styles.statsGrid}>
            {/* Example: Exercise Results Section */}
            {selectedExerciseId ? (
              <View style={{ marginVertical: 12 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Exercise Results</Text>
                {exerciseResults.length > 0 ? (
                  exerciseResults.map((result) => (
                    <View key={result.id} style={{ marginVertical: 8, padding: 8, backgroundColor: '#F0F8FF', borderRadius: 8 }}>
                      <Text>Exercise: {result.exercise?.title || 'N/A'}</Text>
                      <Text>Accuracy: {result.accuracy ?? 'N/A'}%</Text>
                      <Text>Correct: {result.num_correct ?? 'N/A'}</Text>
                      <Text>Incorrect: {result.num_incorrect ?? 'N/A'}</Text>
                      <Text>Time Spent: {result.time_spent ?? 'N/A'}s</Text>
                      <Text>Completed At: {result.completed_at ? new Date(result.completed_at).toLocaleString() : 'N/A'}</Text>
                    </View>
                  ))
                ) : (
                  <Text>No results found for this exercise.</Text>
                )}
              </View>
            ) : null}
            <StatCard
              title="Coins Collected"
              value={coinCount.toString()}
              subtitle="Total earned"
              icon={<FontAwesome5 name="coins" size={32} color="#FFD700" />}
              backgroundColor="#FFF9E6"
            />
            <StatCard
              title="Current Streak"
              value={streakCount + ' days'}
              subtitle="Keep it up!"
              icon={<FontAwesome6 name="fire" size={32} color="#FF4500" />}
              backgroundColor="#FFF2E6"
            />
            <StatCard
              title="Accuracy Rate"
              value="87%"
              subtitle="Questions correct"
              icon={<FontAwesome5 name="bullseye" size={32} color="#4CAF50" />}
              backgroundColor="#E8F5E8"
            />
            <StatCard
              title="Exercises Completed"
              value={completedThisWeek + " this week"}
              subtitle="Good job!"
              icon={<FontAwesome5 name="book" size={32} color="#9C27B0" />}
              backgroundColor="#F3E5F5"
            />
          </View>

          {/* Weekly Progress Chart Placeholder */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Weekly Progress</Text>
            <View style={styles.chartPlaceholder}>
              <View style={styles.chartBars}>
                <View style={[styles.bar, { height: 40 }]} />
                <View style={[styles.bar, { height: 65 }]} />
                <View style={[styles.bar, { height: 30 }]} />
                <View style={[styles.bar, { height: 80 }]} />
                <View style={[styles.bar, { height: 55 }]} />
                <View style={[styles.bar, { height: 90 }]} />
                <View style={[styles.bar, { height: 75 }]} />
              </View>
              <View style={styles.chartLabels}>
                <Text style={styles.chartLabel}>Mon</Text>
                <Text style={styles.chartLabel}>Tue</Text>
                <Text style={styles.chartLabel}>Wed</Text>
                <Text style={styles.chartLabel}>Thu</Text>
                <Text style={styles.chartLabel}>Fri</Text>
                <Text style={styles.chartLabel}>Sat</Text>
                <Text style={styles.chartLabel}>Sun</Text>
              </View>
            </View>
          </View>

          {/* Recommended Exercises */}
          <View style={styles.recommendedSection}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
            {tasks.map((task) => (
              <RecommendedExercise
                key={task.id}
                title={task.name}
                description={task.description}
                difficulty={"Medium"}
                onPress={() => console.log(task.name)}
              />
            ))}
          </View>
          {/* <View style={styles.recommendedSection}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>

            <RecommendedExercise
              title="Advanced Phonics"
              description="Practice complex letter sounds and word building"
              difficulty="Medium"
              onPress={() => console.log('Navigate to Advanced Phonics')}
            />

            <RecommendedExercise
              title="Story Comprehension"
              description="Read short stories and answer questions"
              difficulty="Easy"
              onPress={() => console.log('Navigate to Story Comprehension')}
            />

            <RecommendedExercise
              title="Grammar Fundamentals"
              description="Learn about nouns, verbs, and sentence structure"
              difficulty="Hard"
              onPress={() => console.log('Navigate to Grammar Fundamentals')}
            />

            <RecommendedExercise
              title="Creative Writing"
              description="Express yourself through guided writing prompts"
              difficulty="Medium"
              onPress={() => console.log('Navigate to Creative Writing')}
            />
          </View> */}

          {/* Bottom padding for scroll */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Navigation (same as ChildDashboard) */}
        <View style={styles.bottomNav}>
          <AnimatedNavButton style={styles.navButton} onPress={handleHome}>
            <FontAwesome6 name="house-chimney-window" size={40} color="white" />
          </AnimatedNavButton>

          <AnimatedNavButton style={styles.navButton}>
            <FontAwesome5 name="trophy" size={40} color="#FFD700" />
          </AnimatedNavButton>

          <AnimatedNavButton style={styles.navButton} onPress={handleMascotCustomization}>
            <MaterialCommunityIcons name="koala" size={60} color="white" />
          </AnimatedNavButton>

          <AnimatedNavButton style={styles.navButton} onPress={handleSettings}>
            <FontAwesome5 name="cog" size={40} color="white" />
          </AnimatedNavButton>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fd9029',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  chartSection: {
    marginTop: 10,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chartPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    marginBottom: 10,
  },
  bar: {
    width: 30,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    width: 30,
  },
  recommendedSection: {
    marginBottom: 20,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  exerciseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFB366',
    paddingVertical: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navButton: {
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default StatsPage;