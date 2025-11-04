import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { API_URL } from '@/config/api';


const { width, height } = Dimensions.get('window');

interface Question {
  id: number;
  question: string;
  correctAnswer: string;
  options: string[];
}

interface ApiQuestion {
  id: string;
  exercise: string;
  order: number;
  exercise_type: string;
  question_data: string; // JSON string containing the question data
}

interface Exercise {
  id: number;
  title: string;
  questions: Question[];
}

//Fetch questions for a specific exercise by ID
const fetchQuestionsByExerciseId = async (exerciseId: string): Promise<Exercise | null> => {
  console.log('=== FETCHING QUESTIONS BY EXERCISE ID ===');
  console.log('Exercise ID:', exerciseId);
  console.log('API_URL:', API_URL);
  
  try {
    const url = `${API_URL}/api/questions/${exerciseId}/`;
    console.log('Fetching questions from URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      console.error('Failed to fetch questions:', response.status, response.statusText);
      
      try {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
      } catch (bodyError) {
        console.error('Could not read error response body:', bodyError);
      }
      
      return null;
    }

    const questionsData = await response.json();
    console.log('Questions data received:', questionsData);

    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      console.warn('No questions found for exercise:', exerciseId);
      return null;
    }

    // Transform API questions to our Question format
    const transformedQuestions: Question[] = questionsData
      .sort((a: ApiQuestion, b: ApiQuestion) => a.order - b.order) // Sort by order
      .map((apiQuestion: ApiQuestion, index: number) => {
        try {
          // Handle both string and object cases for question_data
          let questionData;
          if (typeof apiQuestion.question_data === 'string') {
            questionData = JSON.parse(apiQuestion.question_data);
          } else {
            questionData = apiQuestion.question_data;
          }
          console.log(`Question ${index + 1} data:`, questionData);
          
          // Extract options text from the nested structure
          const optionTexts = questionData.options?.map((option: any) => option.text) || [];
          console.log(`Question ${index + 1} option texts:`, optionTexts);
          
          // Find the correct answer from the options
          const correctOption = questionData.options?.find((option: any) => option.correct === true);
          const correctAnswer = correctOption?.text || optionTexts[0] || 'No answer';
          console.log(`Question ${index + 1} correct answer:`, correctAnswer);
          
          return {
            id: index + 1,
            question: questionData.question || 'Question not available',
            correctAnswer: correctAnswer,
            options: optionTexts
          };
        } catch (parseError) {
          console.error('Error parsing question_data for question:', apiQuestion.id, parseError);
          return {
            id: index + 1,
            question: 'Error loading question',
            correctAnswer: 'Error',
            options: ['Error', 'Loading', 'Question']
          };
        }
      });

    const exercise: Exercise = {
      id: parseInt(exerciseId) || 1,
      title: 'Multiple Drag Exercise',
      questions: transformedQuestions
    };

    console.log('Transformed exercise:', exercise);
    return exercise;

  } catch (error) {
    console.error('Network error fetching questions:', error);
    return null;
  }
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

export default function MultipleDragExercise() {
  const router = useRouter();
  const { childId } = useApp();
  const params = useLocalSearchParams();
  const exerciseId = params.exerciseId as string;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [sessionStartTime] = useState(Date.now());

  // Fallback exercise data
  const fallbackExercise: Exercise = useMemo(() => ({
    id: 1,
    title: "Opposite Words (Fallback)",
    questions: [
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
      }
    ]
  }), []);

  // Use dynamic exercise data or fallback to static data
  const currentExercise = exercise || fallbackExercise;
  
  // Safe access to current question
  const question = currentExercise?.questions?.[currentQuestion] || null;

  // Initialize session and handle cleanup
  useEffect(() => {
    const loadExerciseData = async () => {
      console.log('useEffect running - exerciseId:', exerciseId);
      console.log('useEffect running - childId:', childId);
      
      setIsLoading(true);
      
      // Try to fetch questions by exerciseId first
      if (exerciseId) {
        console.log('exerciseId exists, fetching questions by exercise ID:', exerciseId);
        const fetchedExercise = await fetchQuestionsByExerciseId(exerciseId);
        
        if (fetchedExercise) {
          console.log('Successfully loaded exercise data:', fetchedExercise);
          setExercise(fetchedExercise);
          setIsLoading(false);
          return;
        } else {
          console.warn('Failed to load exercise data, trying fallback method');
        }
      }
      
      // Use fallback data if API fetch failed
      console.log('Using fallback exercise data');
      setExercise(fallbackExercise);
      
      setIsLoading(false);
    };

    loadExerciseData();
  }, [childId, exerciseId, fallbackExercise]);
  const handleDrop = (isCorrect: boolean) => {
    if (answered) return;
    
    const droppedOption = question.options.find(opt => 
      isCorrect ? opt === question.correctAnswer : opt !== question.correctAnswer
    );

    setSelectedOption(droppedOption || null);
    setAnswered(true);
    
    if (isCorrect) {
      setScore(score + 10);
      setShowCelebration(true);

      setTimeout(() => {
        setShowCelebration(false);
        handleNextQuestion();
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
            }
          }]
        );
      }, 1000);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < currentExercise.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswered(false);
      setSelectedOption(null);


    } else {
      completeActivity();
    }
  };

  // Submit all exercise data to backend
  const submitExerciseResults = async () => {
    const sessionEndTime = Date.now();
    const totalSessionTime = sessionEndTime - sessionStartTime;

    const exerciseSubmission = {
      score: score,
      totalQuestions: currentExercise.questions.length,
      correctAnswers: score,
      incorrectAnswers: currentExercise.questions.length - score,
      accuracy: Math.round((score / currentExercise.questions.length) * 100),
      sessionTime: totalSessionTime
    };

    // *** Remove this navigation after backend is complete. ***
    // temporary navigation to simulate completion
    router.push({
      pathname: '/child-dashboard',
      params: { completedTaskId: 2 }
    });

    try {
      const response = await fetch(`${API_URL}/api/profile/${childId}/exercise`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
    }
    
  };

  const completeActivity = () => {
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
            handleNextQuestion();
          }
        }
      ]
    );
  };

  // Show loading state while fetching questions
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Exercise...</Text>
          <Text style={styles.loadingSubText}>
            {exerciseId ? `Fetching questions for exercise ${exerciseId}` : 'Preparing questions'}
          </Text>
        </View>
      </View>
    );
  }

  // Show error state if no questions available
  if (!question || !currentExercise?.questions?.length) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No Questions Available</Text>
          <Text style={styles.errorSubText}>
            Unable to load questions for this exercise.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
            Question {currentQuestion + 1} of {currentExercise.questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill, 
                { width: `${((currentQuestion + 1) / currentExercise.questions.length) * 100}%` }
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
        <Text style={styles.questionNumber}>Question {currentQuestion + 1}</Text>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      {/* Drop Zone */}
      <View style={[
        styles.dropZone,
        answered && styles.dropZoneAnswered,
        selectedOption === question.correctAnswer && styles.dropZoneCorrect
      ]}>
        {selectedOption ? (
          <View style={styles.droppedAnswer}>
            <Text style={styles.droppedAnswerText}>{selectedOption}</Text>
            {selectedOption === question.correctAnswer && (
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
        {question.options.map((option, index) => (
          <DraggableOption
            key={`${currentQuestion}-${index}`} // <-- add currentQuestion to key
            text={option}
            isCorrect={option === question.correctAnswer}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
});
