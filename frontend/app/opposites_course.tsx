import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';

const { width, height } = Dimensions.get('window');

interface Exercise {
  id: number;
  question: string;
  correctAnswer: string;
  options: string[];
}

interface ExerciseData {
  title: string;
  exercises: Exercise[];
}

// Static exercise data for opposites
const OPPOSITES_EXERCISES: ExerciseData = {
  title: "Opposite Words",
  exercises: [
    {
      id: 1,
      question: "What is the opposite of 'hot'?",
      correctAnswer: "cold",
      options: ["warm", "cold", "cool", "fire"]
    },
    {
      id: 2,
      question: "What is the opposite of 'big'?",
      correctAnswer: "small",
      options: ["huge", "large", "small", "tiny"]
    },
    {
      id: 3,
      question: "What is the opposite of 'happy'?",
      correctAnswer: "sad",
      options: ["sad", "young", "sweet", "bright"]
    },
    {
      id: 4,
      question: "What is the opposite of 'up'?",
      correctAnswer: "down",
      options: ["top", "high", "down", "above"]
    },
    {
      id: 5,
      question: "What is the opposite of 'light'?",
      correctAnswer: "dark",
      options: ["bright", "shine", "dark", "glow"]
    }
  ]
};

interface DraggableOptionProps {
  text: string;
  isCorrect: boolean;
  onDrop: (isCorrect: boolean) => void;
  disabled: boolean;
  isSelected: boolean;
}

const DraggableOption: React.FC<DraggableOptionProps> = ({
  text,
  isCorrect,
  onDrop,
  disabled,
  isSelected
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => !disabled && !isSelected,
    onPanResponderGrant: () => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1.1,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: false,
        })
      ]).start();
    },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (evt, gestureState) => {
      const dropZoneY = height * 0.35;
      const dropZoneHeight = 120;

      if (
        gestureState.moveY > dropZoneY &&
        gestureState.moveY < dropZoneY + dropZoneHeight &&
        gestureState.moveX > width * 0.1 &&
        gestureState.moveX < width * 0.9
      ) {
        onDrop(isCorrect);

        if (isCorrect) {
          // Animate to center of drop zone
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: 0, y: dropZoneY - gestureState.y0 + 20 },
              useNativeDriver: false,
            }),
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: false,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            })
          ]).start();
        } else {
          // Shake animation for wrong answer
          Animated.sequence([
            Animated.timing(pan, {
              toValue: { x: 20, y: 0 },
              duration: 100,
              useNativeDriver: false,
            }),
            Animated.timing(pan, {
              toValue: { x: -20, y: 0 },
              duration: 100,
              useNativeDriver: false,
            }),
            Animated.timing(pan, {
              toValue: { x: 10, y: 0 },
              duration: 100,
              useNativeDriver: false,
            }),
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            })
          ]).start();


          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              tension: 100,
              friction: 8,
              useNativeDriver: false,
            }),
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: false,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            })
          ]).start();
        }
      } else {
        // Return to original position with bounce
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            tension: 100,
            friction: 8,
            useNativeDriver: false,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          })
        ]).start();
      }
    },
  });

  return (
    <Animated.View
      style={[
        styles.draggableOption,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: scale }
          ],
          opacity: opacity
        },
        disabled && styles.disabledOption,
        isSelected && styles.selectedOption,
        isCorrect && isSelected && styles.correctOption
      ]}
      {...panResponder.panHandlers}
    >
      <Text style={[
        styles.optionText,
        isSelected && styles.selectedOptionText,
        isCorrect && isSelected && styles.correctOptionText
      ]}>
        {text}
      </Text>
      {isSelected && isCorrect && (
        <Text style={styles.checkMark}>✓</Text>
      )}
    </Animated.View>
  );
};

export default function OppositesExercise() {
  const router = useRouter();
  const [currentExercise, setCurrentExercise] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const { session } = useApp();

  // Track all exercise data for submission at the end
  const [exerciseResults, setExerciseResults] = useState<{
    questionId: number;
    question: string;
    correctAnswer: string;
    answerGiven: string | null;
    isCorrect: boolean;
    timeSpent: number;
    startTime: number;
    skipped?: boolean;
  }[]>([]);

  const [sessionStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const exercise = OPPOSITES_EXERCISES.exercises[currentExercise];

  // Initialize session and handle cleanup
  useEffect(() => {
    // Initialize question timer
    setQuestionStartTime(Date.now());

    // Try to retry any failed submissions from previous sessions
    retryFailedSubmissions();

    return () => {
      // Cleanup: Save current progress if user exits mid-exercise
      if (exerciseResults.length > 0 && exerciseResults.length < OPPOSITES_EXERCISES.exercises.length) {
        const partialSubmission = {
          exerciseType: 'opposites',
          activityId: 8,
          childId: 'current-child-id',
          partialResults: exerciseResults,
          completed: false,
          exitedAt: Date.now()
        };

        const partialSubmissions = JSON.parse(
          localStorage.getItem('partialExerciseSubmissions') || '[]'
        );
        partialSubmissions.push(partialSubmission);
        localStorage.setItem('partialExerciseSubmissions', JSON.stringify(partialSubmissions));
      }
    };
  }, []);

  // Retry mechanism for failed submissions
  const retryFailedSubmissions = async () => {
    const failedSubmissions = JSON.parse(
      localStorage.getItem('pendingExerciseSubmissions') || '[]'
    );

    if (failedSubmissions.length === 0) return;

    const successfulRetries: number[] = [];
    const userToken = 'dummy-token'; // Would come from auth context

    for (let i = 0; i < failedSubmissions.length; i++) {
      try {
        if (!session?.access_token) {
          Alert.alert('Error', 'You must be authorized to perform this action');
          return;
        }
        const response = await fetch('/api/exercise-completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(failedSubmissions[i])
        });

        if (response.ok) {
          successfulRetries.push(i);
          console.log(`Successfully retried submission ${i}`);
        }
      } catch (error) {
        console.log(`Retry ${i} failed, will try again later`);
      }
    }

    // Remove successful retries from pending list
    const remainingSubmissions = failedSubmissions.filter((_: any, index: number) =>
      !successfulRetries.includes(index)
    );
    localStorage.setItem('pendingExerciseSubmissions', JSON.stringify(remainingSubmissions));
  };

  const handleDrop = (isCorrect: boolean) => {
    if (answered) return;

    const droppedOption = exercise.options.find(opt =>
      isCorrect ? opt === exercise.correctAnswer : opt !== exercise.correctAnswer
    );

    setSelectedOption(droppedOption || null);
    setAnswered(true);

    // Record this answer for later submission
    const questionEndTime = Date.now();
    const timeSpent = questionEndTime - questionStartTime;

    const resultEntry = {
      questionId: exercise.id,
      question: exercise.question,
      correctAnswer: exercise.correctAnswer,
      answerGiven: droppedOption || null,
      isCorrect: isCorrect,
      timeSpent: timeSpent,
      startTime: questionStartTime
    };

    setExerciseResults(prev => [...prev, resultEntry]);

    if (isCorrect) {
      setScore(score + 10);
      setShowCelebration(true);

      setTimeout(() => {
        setShowCelebration(false);
        handleNextExercise();
      }, 2500);
    } else {
      // Show feedback for wrong answer
      setTimeout(() => {
        Alert.alert(
          "Try Again!",
          "That's not quite right. Give it another try!",
          [{
            text: "Try Again",
            onPress: () => {
              setAnswered(false);
              setSelectedOption(null);
              // Reset question start time for retry
              setQuestionStartTime(Date.now());
            }
          }]
        );
      }, 1000);
    }
  };

  const handleNextExercise = () => {
    if (currentExercise < OPPOSITES_EXERCISES.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setAnswered(false);
      setSelectedOption(null);

      //Reset question timer for next question
      setQuestionStartTime(Date.now());
    } else {
      completeActivity();
    }
  };

  // Submit all exercise data to backend
  const submitExerciseResults = async () => {
    const sessionEndTime = Date.now();
    const totalSessionTime = sessionEndTime - sessionStartTime;

    const exerciseSubmission = {
      exerciseType: 'opposites',
      activityId: 8, // From learning unit data - "Find the Opposite"
      childId: 'current-child-id', // Would come from auth/context
      sessionStartTime: sessionStartTime,
      sessionEndTime: sessionEndTime,
      totalTimeSpent: totalSessionTime,
      totalQuestions: OPPOSITES_EXERCISES.exercises.length,
      correctAnswers: score,
      incorrectAnswers: OPPOSITES_EXERCISES.exercises.length - score,
      accuracy: Math.round((score / OPPOSITES_EXERCISES.exercises.length) * 100),
      individualResults: exerciseResults,
      completed: true
    };

    // *** Remove this navigation after backend is complete. ***
    // temporary navigation to simulate completion
    router.push({
      pathname: '/child-dashboard',
      params: { completedTaskId: 2 }
    });

    // Submit all exercise data to backend after completion
    /*

    if (!session?.access_token) {
      Alert.alert('Error', 'You must be authorized to perform this action');
      return;
    }
    try {
      const response = await fetch('/api/exercise-completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(exerciseSubmission)
      });

      if (!response.ok) {
        throw new Error('Failed to submit exercise results');
      }

      const result = await response.json();
      console.log('Exercise submitted successfully:', result);

      // Navigate back to dashboard after successful submission
      router.push('/child-dashboard');

    } catch (error) {
      console.error('Error submitting exercise:', error);

      // Store locally for retry later
      const failedSubmissions = JSON.parse(
        localStorage.getItem('pendingExerciseSubmissions') || '[]'
      );
      failedSubmissions.push(exerciseSubmission);
      localStorage.setItem('pendingExerciseSubmissions', JSON.stringify(failedSubmissions));

      // Still allow navigation but show retry option
      Alert.alert(
        'Exercise Completed!',
        'Your progress has been saved locally and will sync when connection is restored.',
        [{ text: 'OK', onPress: () => router.push('/child-dashboard') }]
      );
    }
    */
  };

  const completeActivity = () => {
    // Submit results to backend
    submitExerciseResults();
  };


  const skipQuestion = () => {
    Alert.alert(
      "Skip this question?",
      "You can move to the next question, but you won't get points for this one.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Skip",
          onPress: () => {
            // Record skip as incorrect answer
            const questionEndTime = Date.now();
            const timeSpent = questionEndTime - questionStartTime;

            const resultEntry = {
              questionId: exercise.id,
              question: exercise.question,
              correctAnswer: exercise.correctAnswer,
              answerGiven: null,
              isCorrect: false,
              timeSpent: timeSpent,
              startTime: questionStartTime,
              skipped: true
            };

            setExerciseResults(prev => [...prev, resultEntry]);

            handleNextExercise();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentExercise + 1} of {OPPOSITES_EXERCISES.exercises.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentExercise + 1) / OPPOSITES_EXERCISES.exercises.length) * 100}%` }
              ]}
            />
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>⭐ {score}</Text>
        </View>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionNumber}>Question {currentExercise + 1}</Text>
        <Text style={styles.questionText}>{exercise.question}</Text>
      </View>

      {/* Drop Zone */}
      <View style={[
        styles.dropZone,
        answered && styles.dropZoneAnswered,
        selectedOption === exercise.correctAnswer && styles.dropZoneCorrect
      ]}>
        {selectedOption ? (
          <View style={styles.droppedAnswer}>
            <Text style={styles.droppedAnswerText}>{selectedOption}</Text>
            {selectedOption === exercise.correctAnswer && (
              <Text style={styles.correctIcon}>✓</Text>
            )}
          </View>
        ) : (
          <View style={styles.dropZoneContent}>
            <Text style={styles.dropZoneText}>Drag your answer here</Text>
          </View>
        )}
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {exercise.options.map((option, index) => (
          <DraggableOption
            key={`${currentExercise}-${index}`} // <-- add currentExercise to key
            text={option}
            isCorrect={option === exercise.correctAnswer}
            onDrop={handleDrop}
            disabled={answered}
            isSelected={selectedOption === option}
          />
        ))}
      </View>

      {/* Skip Button */}
      {!answered && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={skipQuestion}
        >
          <Text style={styles.skipButtonText}>Skip Question</Text>
        </TouchableOpacity>
      )}

      {/* Celebration Overlay */}
      {showCelebration && (
        <View style={styles.celebrationOverlay}>
          <Animated.View style={styles.celebrationContent}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationText}>Correct!</Text>
            <Text style={styles.celebrationSubtext}>You found the opposite!</Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#667eea', // Purple background instead of gradient
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  scoreContainer: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  scoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionContainer: {
    padding: 24,
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    lineHeight: 28,
  },
  dropZone: {
    marginHorizontal: 20,
    marginVertical: 24,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  dropZoneAnswered: {
    borderStyle: 'solid',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  dropZoneCorrect: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderColor: '#4CAF50',
  },
  dropZoneContent: {
    alignItems: 'center',
  },
  dropZoneIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  dropZoneText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  droppedAnswer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  droppedAnswerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  correctIcon: {
    fontSize: 24,
    color: '#4CAF50',
    marginLeft: 12,
    fontWeight: 'bold',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  draggableOption: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 16,
    margin: 8,
    minWidth: 130,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  disabledOption: {
    opacity: 0.5,
  },
  selectedOption: {
    backgroundColor: '#f0f0f0',
    borderColor: '#666',
  },
  correctOption: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  selectedOptionText: {
    color: '#666',
  },
  correctOptionText: {
    color: '#4CAF50',
  },
  checkMark: {
    fontSize: 20,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: 'bold',
  },
  skipButton: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationContent: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 24,
    marginHorizontal: 40,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  celebrationText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 8,
  },
  celebrationSubtext: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});
