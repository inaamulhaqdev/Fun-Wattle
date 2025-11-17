import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { API_URL } from '@/config/api';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

interface Question {
  id: string;
  question: string;
  image?: string;
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
    const url = `${API_URL}/content/${exerciseId}/questions/`;
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
            id: apiQuestion.id,
            question: questionData.question || 'Question not available',
            image: questionData.image, // Include image support
            correctAnswer: correctAnswer,
            options: optionTexts
          };
        } catch (parseError) {
          console.error('Error parsing question_data for question:', apiQuestion.id, parseError);
          return {
            id: apiQuestion.id || `error_${index + 1}`,
            question: 'Error loading question',
            correctAnswer: 'Error',
            options: ['Error', 'Loading', 'Question']
          };
        }
      });

    const exercise: Exercise = {
      id: parseInt(exerciseId) || 1,
      title: 'Multiple Select Exercise',
      questions: transformedQuestions
    };

    console.log('Transformed exercise:', exercise);
    return exercise;

  } catch (error) {
    console.error('Network error fetching questions:', error);
    return null;
  }
};

interface ClickableOptionProps {
  text: string;
  isCorrect: boolean;
  onPress: (isCorrect: boolean) => void;
  disabled: boolean;
  isSelected: boolean;
}

const ClickableOption: React.FC<ClickableOptionProps> = ({
  text,
  isCorrect,
  onPress,
  disabled,
  isSelected
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (!disabled && !isSelected) {
      // Animate press
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        })
      ]).start();

      onPress(isCorrect);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.clickableOption,
          {
            transform: [{ scale: scale }],
          },
          disabled && styles.disabledOption,
          isSelected && styles.selectedOption,
          isCorrect && isSelected && styles.correctOption
        ]}
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
    </TouchableOpacity>
  );
};

export default function MultipleSelectExercise() {
  const router = useRouter();
  const { childId, session } = useApp();
  const params = useLocalSearchParams();
  const exerciseId = params.exerciseId as string;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);
  const [currentQuestionCoins, setCurrentQuestionCoins] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showIncorrectFeedback, setShowIncorrectFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [showCorrectAnswerModal, setShowCorrectAnswerModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showProgressExitModal, setShowProgressExitModal] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [progressRestored, setProgressRestored] = useState(false);

  const [sessionStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Fallback exercise data
  const fallbackExercise: Exercise = useMemo(() => ({
    id: 1,
    title: "Multiple Choice (Fallback)",
    questions: [
      {
        id: "fallback_1",
        question: "What is the opposite of 'hot'?",
        correctAnswer: "cold",
        options: ["warm", "cold", "cool", "fire"]
      },
      {
        id: "fallback_2",
        question: "What is the opposite of 'big'?",
        correctAnswer: "small",
        options: ["huge", "large", "small", "tiny"]
      },
      {
        id: "fallback_3",
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

  // Calculate final accuracy for completion screen
  const finalAccuracy = currentExercise ? (score / 10) / currentExercise.questions.length : 0;

  // Get completion message and styling based on accuracy
  const getCompletionData = () => {
    if (finalAccuracy >= 0.8) {
      return {
        message: "Excellent!",
        backgroundColor: '#4CAF50', // Green
        showTryAgain: false
      };
    } else if (finalAccuracy >= 0.5) {
      return {
        message: "Good Work!",
        backgroundColor: '#4CAF50', // Green
        showTryAgain: false
      };
    } else {
      return {
        message: "Almost There!",
        backgroundColor: '#2196F3', // Blue
        showTryAgain: true
      };
    }
  };

  // Initialize and load exercise data
  useEffect(() => {
    // Load saved progress if available
    const loadSavedProgress = () => {
      if (!childId || !exerciseId) return null;
      
      try {
        const storageKey = `exercise_progress_${exerciseId}_${childId}`;
        const savedData = localStorage.getItem(storageKey);
        
        if (savedData) {
          const progressData = JSON.parse(savedData);
          console.log('Found saved progress:', progressData);
          return progressData;
        }
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
      
      return null;
    };

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
          
          // Check for saved progress and restore state
          const savedProgress = loadSavedProgress();
          if (savedProgress) {
            setCurrentQuestion(savedProgress.currentQuestion || 0);
            setScore(savedProgress.score || 0);
            setRetryCount(savedProgress.retryCount || 0);
            setQuestionStartTime(Date.now()); // Reset question timer
            setProgressRestored(true); // Show progress restored notification
            console.log('Progress restored from saved state');
          }
          
          setIsLoading(false);
          return;
        } else {
          console.warn('Failed to load exercise data, trying fallback method');
        }
      }

      // Use fallback data if API fetch failed
      console.log('Using fallback exercise data');
      setExercise(fallbackExercise);
      
      // Check for saved progress even with fallback data
      const savedProgress = loadSavedProgress();
      if (savedProgress) {
        setCurrentQuestion(savedProgress.currentQuestion || 0);
        setScore(savedProgress.score || 0);
        setRetryCount(savedProgress.retryCount || 0);
        setQuestionStartTime(Date.now());
        setProgressRestored(true); // Show progress restored notification
        console.log('Progress restored from saved state (fallback)');
      }
      
      setIsLoading(false); 
    };

    loadExerciseData();
  }, [childId, exerciseId, fallbackExercise]);

  // Hide progress restored notification after 3 seconds
  useEffect(() => {
    if (progressRestored) {
      const timer = setTimeout(() => {
        setProgressRestored(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [progressRestored]);

  // Update coin balance by adding coins
  const updateCoins = async (coinsToAdd: number) => {
    console.log('=== UPDATE COINS CALLED ===');
    console.log('Coins to add:', coinsToAdd);
    console.log('childId:', childId);
    
    if (!childId) {
      console.log('Missing childId, cannot update coins');
      return;
    }

    try {
      const url = `${API_URL}/profile/${childId}/coins/`;
      console.log('Updating coins at:', url);

      const requestData = {
        amount: coinsToAdd
      };

      console.log('Request data:', requestData);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        console.error('Failed to update coins:', response.status, response.statusText);
        
        try {
          const errorText = await response.text();
          console.error('Error response body:', errorText);
        } catch (bodyError) {
          console.error('Could not read error response body:', bodyError);
        }
      } else {
        const data = await response.json();
        console.log('Coins updated successfully:', data);
      }
    } catch (error) {
      console.error('Error updating coins:', error);
    }
  };

  // Submit question result to backend
  const submitQuestionResult = async (questionId: string, correct: boolean, timeSpent: number, attempts: number) => {
    console.log('=== SUBMIT QUESTION RESULT CALLED ===');
    console.log('Parameters:', { questionId, correct, timeSpent, attempts });
    console.log('childId:', childId);
    
    if (!childId || !questionId) {
      console.log('Missing childId or questionId, returning early');
      return;
    }

    try {
      const url = `${API_URL}/result/${childId}/question/${questionId}/`;
      console.log('Submitting question result to:', url);

      const resultData = {
        num_correct: correct ? 1 : 0,
        num_incorrect: correct ? attempts - 1 : attempts,
        time_spent: parseInt(timeSpent.toString()) // Ensure it's an integer
      };

      console.log('Submitting result data:', resultData);

      const headers: any = {
        'Content-Type': 'application/json',
      };

      console.log('🧪 TESTING: Sending without Authorization header to debug');

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(resultData),
      });

      console.log('Response received:', response);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        console.error('Failed to submit question result:', response.status, response.statusText);
        
        try {
          const errorText = await response.text();
          console.error('Error response body:', errorText);
        } catch (bodyError) {
          console.error('Could not read error response body:', bodyError);
        }
      } else {
        console.log('Question result submitted successfully');
      }
    } catch (error) {
      console.error('Error submitting question result:', error);
    }
  };

  // Save progress and exit
  const saveProgressAndExit = async () => {
    if (!childId || !exerciseId) {
      router.back();
      return;
    }

    try {
      // Save current progress to localStorage
      const progressData = {
        exerciseId,
        childId,
        currentQuestion,
        score,
        retryCount,
        sessionStartTime,
        timestamp: Date.now()
      };

      const storageKey = `exercise_progress_${exerciseId}_${childId}`;
      localStorage.setItem(storageKey, JSON.stringify(progressData));
      
      console.log('Progress saved:', progressData);
      
    } catch (error) {
      console.error('Error saving progress:', error);
    }
    
    router.back();
  };

  // Clear saved progress from localStorage
  const clearSavedProgress = () => {
    if (!childId || !exerciseId) {
      return;
    }

    try {
      const storageKey = `exercise_progress_${exerciseId}_${childId}`;
      localStorage.removeItem(storageKey);
      console.log('Saved progress cleared');
    } catch (error) {
      console.error('Error clearing saved progress:', error);
    }
  };

  const handleOptionPress = (isCorrect: boolean) => {
    if (answered) return;

    const currentTime = Date.now();
    const timeSpent = Math.round((currentTime - questionStartTime) / 1000);
    const attempts = retryCount + 1;

    setAnswered(true);
    setSelectedOption(question?.correctAnswer || '');
    
    // Submit question result
    if (question?.id) {
      submitQuestionResult(question.id, isCorrect, timeSpent, attempts);
    }

    if (isCorrect) {
      setScore(prev => prev + 10);
      
      // Award 10 coins for correct answer
      updateCoins(10);
      setTotalCoinsEarned(prev => prev + 10);
      setCurrentQuestionCoins(10);
      
      setShowCelebration(true);
      
      setTimeout(() => {
        setShowCelebration(false);
        handleNextQuestion();
      }, 2000);
    } else {
      setRetryCount(prev => prev + 1);
      
      if (retryCount >= 1) {
        // After 2 incorrect attempts, show correct answer and move on
        setShowIncorrectFeedback(true);
        setTimeout(() => {
          setShowIncorrectFeedback(false);
          handleNextQuestion();
        }, 2000);
      } else {
        // Allow one retry - show "Not quite, try again!" message
        setShowIncorrectFeedback(true);
        setTimeout(() => {
          setShowIncorrectFeedback(false);
          resetQuestionState();
        }, 1500);
      }
    }
  };

  const resetQuestionState = () => {
    setAnswered(false);
    setSelectedOption(null);
    setQuestionStartTime(Date.now());
  };

  const handleNextQuestion = () => {
    setAnswered(false);
    setSelectedOption(null);
    setRetryCount(0);
    setCurrentQuestionCoins(0);
    setQuestionStartTime(Date.now());

    if (currentQuestion < currentExercise.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Exercise completed
      completeExercise();
    }
  };

  const completeExercise = async () => {
    if (!currentExercise) {
      console.error('No exercise data available');
      return;
    }
    
    // Show completion screen first
    setShowCompletionScreen(true);
    
    try {
      console.log('Complete button pressed');
      
      const response = await fetch(`${API_URL}/result/${childId}/exercise/${exerciseId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to submit exercise results: ${response.status}`);
      }
      const result = await response.json();
      console.log('Exercise submitted successfully:', result);

      // Clear saved progress since exercise is completed
      clearSavedProgress();

      // Navigate back to dashboard after 3 seconds
      setTimeout(() => {
        router.push({
          pathname: '/child-dashboard',
          params: { completedTaskId: exerciseId }
        });
      }, 3000);

    } catch (error) {
      console.error('Error submitting exercise:', error);
    }
  };

  const handleExit = () => {
    console.log('Exit button pressed');
    setShowProgressExitModal(true);
  };

  const handleConfirmProgressExit = async () => {
    console.log('Confirm progress exit pressed');
    setShowProgressExitModal(false);
    await saveProgressAndExit();
  };

  const handleCancelProgressExit = () => {
    console.log('Cancel progress exit pressed');
    setShowProgressExitModal(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading exercise...</Text>
      </View>
    );
  }

  if (!currentExercise || !question) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No exercise data available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Completion Screen
  if (showCompletionScreen) {
    return (
      <View style={styles.completionContainer}>
        <Text style={styles.completionTitle}>🎉 Great Job! 🎉</Text>
        <Text style={styles.completionSubtext}>You completed the exercise!</Text>
        
        <View style={styles.scoreDisplay}>
          <Text style={styles.scoreLabel}>Your Score</Text>
          <Text style={styles.scoreFinal}>{score} points</Text>
        </View>

        <View style={styles.coinRewardContainer}>
          <Text style={styles.coinRewardText}>You earned</Text>
          <View style={styles.coinAmountContainer}>
            <MaterialCommunityIcons name="star-circle" size={40} color="#FFD700" />
            <Text style={styles.coinAmountText}>{totalCoinsEarned} Coins!</Text>
          </View>
        </View>

        <Text style={styles.returningText}>Returning to dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleExit}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentQuestion + 1} / {currentExercise.questions.length}
          </Text>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>
      </View>

      {/* Progress Restored Notification */}
      {progressRestored && (
        <View style={styles.progressRestoredBanner}>
          <Text style={styles.progressRestoredText}>
            ✓ Returning to Question {currentQuestion + 1}
          </Text>
        </View>
      )}

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {question.question}
        </Text>
        
        {question.image && (
          <Image
            source={{ uri: question.image }}
            style={styles.questionImage}
            resizeMode="contain"
          />
        )}
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {question.options.map((option: string, index: number) => (
          <ClickableOption
            key={`${option}-${index}`}
            text={option}
            isCorrect={option === question.correctAnswer}
            onPress={handleOptionPress}
            disabled={answered}
            isSelected={selectedOption === option}
          />
        ))}
      </View>

      {/* Celebration */}
      {showCelebration && (
        <View style={styles.celebrationOverlay}>
          <View style={styles.celebrationContent}>
            <Text style={styles.celebrationText}>🎉 Correct! 🎉</Text>
            <View style={styles.celebrationCoins}>
              <MaterialCommunityIcons name="star-circle" size={32} color="#FFD700" />
              <Text style={styles.celebrationCoinsText}>+{currentQuestionCoins} Coins!</Text>
            </View>
          </View>
        </View>
      )}

      {/* Incorrect Feedback */}
      {showIncorrectFeedback && (
        <View style={styles.incorrectOverlay}>
          <View style={styles.incorrectContent}>
            <Text style={styles.incorrectText}>Not quite, try again!</Text>
            {retryCount >= 1 && (
              <Text style={styles.correctAnswerHint}>
                The correct answer is: {question.correctAnswer}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Progress Exit Modal */}
      {showProgressExitModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Progress?</Text>
            <Text style={styles.modalText}>
              Would you like to save your progress and return later?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleCancelProgressExit}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleConfirmProgressExit}>
                <Text style={styles.modalButtonText}>Save & Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressRestoredBanner: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  progressRestoredText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  questionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  questionImage: {
    width: width * 0.8,
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  optionsContainer: {
    flex: 1,
  },
  clickableOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    marginVertical: 8,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  correctOption: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  disabledOption: {
    opacity: 0.6,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  selectedOptionText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  correctOptionText: {
    color: '#4CAF50',
  },
  checkMark: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
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
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  celebrationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
  },
  celebrationCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  celebrationCoinsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  incorrectOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  incorrectContent: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    maxWidth: '80%',
  },
  incorrectText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
  },
  correctAnswerHint: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    backgroundColor: '#667eea',
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
    padding: 20,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 10,
  },
  completionSubtext: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    width: '100%',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  scoreFinal: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  coinRewardContainer: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  coinRewardText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  coinAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coinAmountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  returningText: {
    fontSize: 16,
    color: '#999',
    marginTop: 20,
    fontStyle: 'italic',
  },
});