import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Exercise {
  id: string;
  title: string;
  completed: boolean;
  accuracy: number;
  num_correct: number;
  num_incorrect: number;
  time_spent: number;
  last_practiced: string | null;
  order: number;
}

interface LearningUnitCardProps {
  title: string;
  totalTime: number;
  overallAccuracy: number;
  exercises: Exercise[];
  darkMode?: boolean;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min total`;
};

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

export const LearningUnitCard: React.FC<LearningUnitCardProps> = ({ 
  title, 
  totalTime, 
  overallAccuracy, 
  exercises,
  darkMode = false
}) => {
  const completedExercises = exercises.filter(e => e.completed).length;
  const totalExercises = exercises.length;
  const progressPercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Main Learning Unit Card */}
      <Card style={[styles.mainCard, darkMode && styles.mainCardDark]} mode="elevated">
        <Card.Content>
          <Text variant="titleLarge" style={[styles.mainTitle, darkMode && styles.textDark]}>
            {title}
          </Text>
          
          <View style={styles.headerRow}>
            <View style={styles.timeContainer}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={darkMode ? '#aaa' : '#666'} />
              <Text style={[styles.timeText, darkMode && styles.textDark]}>
                {formatTime(totalTime)}
              </Text>
            </View>
            
            <Text style={[styles.accuracyText, darkMode && styles.textDark]}>
              {overallAccuracy}% correct
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Activities Section */}
      <Text style={[styles.activitiesHeader, darkMode && styles.textDark]}>Activities:</Text>

      {/* Individual Activity Cards */}
      {exercises.map((exercise, index) => {
        const total = exercise.num_correct + exercise.num_incorrect;
        const accuracy = total > 0 ? Math.round((exercise.num_correct / total) * 100) : 0;

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
                  {index + 1}. {exercise.title}
                </Text>
                <Text style={[styles.completionStatus, darkMode && styles.textDark]}>
                  {completedExercises}/{totalExercises} completed
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  mainCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 4,
    marginBottom: 16,
  },
  mainCardDark: {
    backgroundColor: '#2a2a2a',
  },
  mainTitle: {
    fontWeight: '600',
    marginBottom: 12,
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
  activitiesHeader: {
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
  // Legacy styles
  legacyActivityCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#fff",
  },
  legacyTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legacyTitle: {
    fontWeight: "600",
    flexShrink: 1,
  },
  legacyCompleted: {
    fontWeight: "600",
  },
  legacyDivider: {
    marginVertical: 8,
  },
  legacyStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  legacyStatsCol: {
    alignItems: "center",
    flex: 1,
  },
  legacyStatNumber: {
    fontWeight: "600",
    marginTop: 4,
  },
});

// Legacy ActivityCards component for backward compatibility
interface ActivityCardsProps {
  title: string;
  completed: string;
  correct: number;
  incorrect: number;
  accuracy: string;
}

export const ActivityCards: React.FC<ActivityCardsProps> = ({ title, completed, correct, incorrect, accuracy }) => {
  return (
    <Card style={styles.legacyActivityCard} mode='elevated'>
      <Card.Content>
        <View style={styles.legacyTitleRow}>
          <Text variant="titleMedium" style={styles.legacyTitle}>
            {title}
          </Text>
          <Text variant="titleMedium" style={styles.legacyCompleted}>
            {completed}
          </Text>
        </View>
        <View style={styles.legacyDivider} />
        <View style={styles.legacyStatsRow}>
          <View style={styles.legacyStatsCol}>
            <Text variant="labelMedium">Correct</Text>
            <Text variant="bodyMedium" style={styles.legacyStatNumber}>
              {correct}
            </Text>
          </View>
          <View style={styles.legacyStatsCol}>
            <Text variant="labelMedium">Incorrect</Text>
            <Text variant="bodyMedium" style={styles.legacyStatNumber}>
              {incorrect}
            </Text>
          </View>
          <View style={styles.legacyStatsCol}>
            <Text variant="labelMedium">Accuracy</Text>
            <Text variant="bodyMedium" style={styles.legacyStatNumber}>
              {accuracy}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

export default LearningUnitCard;