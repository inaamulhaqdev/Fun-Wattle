import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  TouchableOpacity,
  Image,
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
  const { childId, session } = useApp();
  const params = useLocalSearchParams();
  const exerciseId = params.exerciseId as string;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [showCorrectAnswerModal, setShowCorrectAnswerModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showProgressExitModal, setShowProgressExitModal] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  
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

  // Calculate final accuracy for completion screen
  const finalAccuracy = currentExercise ? (score / 10) / currentExercise.questions.length : 0;

  // Get completion message and styling based on accuracy
  const getCompletionData = () => {
    if (finalAccuracy >= 0.9) {
      return {
        message: "Excellent!",
        backgroundColor: '#4CAF50', // Green
        showTryAgain: false
      };
    } else if (finalAccuracy >= 0.6) {
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
    console.log('=== HANDLE DROP ===');
    console.log('isCorrect:', isCorrect);
    console.log('answered:', answered);
    console.log('question:', question);
    console.log('retryCount:', retryCount);
    
    if (answered) return;
    
    // Safety check for question
    if (!question) {
      console.error('Question is null or undefined');
      return;
    }
    
    const droppedOption = question.options.find(opt => 
      isCorrect ? opt === question.correctAnswer : opt !== question.correctAnswer
    );

    console.log('droppedOption:', droppedOption);
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
      console.log('Wrong answer - checking retry count');
      // Check retry count for wrong answer
      if (retryCount < 2) {
        console.log(`Allowing retry - attempt ${retryCount + 1} of 3`);
        // Show retry modal
        setShowRetryModal(true);
      
      } else {
        console.log('Max retries reached - showing correct answer');
        // Show correct answer modal after 2 failed attempts
        setShowCorrectAnswerModal(true);
        
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < currentExercise.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswered(false);
      setSelectedOption(null);
      setRetryCount(0); // Reset retry count for new question

    } else {
      completeActivity();
    }
  };

  // Submit all exercise data to backend
  const submitExerciseResults = async () => {
    const sessionEndTime = Date.now();
    const totalSessionTime = sessionEndTime - sessionStartTime;

    // Calculate correct answers from score (score is 10 points per correct answer)
    const correctAnswers = score / 10;
    const totalQuestions = currentExercise.questions.length;
    
    const accuracy = Math.max(0, Math.min(1, correctAnswers / totalQuestions));
    const timeSpent = Math.max(0, Math.round(totalSessionTime / 60000));
    
    const exerciseSubmission = {
      accuracy: accuracy,
      time_spent: timeSpent,
    };

    console.log('Submitting exercise results:', exerciseSubmission);
    console.log('Child ID:', childId);
    console.log('Exercise ID:', exerciseId);
    console.log('API URL:', `${API_URL}/api/results/${childId}/exercise/${exerciseId}/`);
    
    // Validate IDs are not null/undefined
    if (!childId || !exerciseId) {
      console.error('Missing required IDs:', { childId, exerciseId });
      throw new Error('Child ID and Exercise ID are required');
    }

    if (!session?.access_token) {
      console.error('Error', 'You must be authorized to perform this action');
      return;
    }

    // Submit to backend
    try {
      const response = await fetch(`${API_URL}/api/results/${childId}/exercise/${exerciseId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(exerciseSubmission)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Failed to submit exercise results: ${response.status} - ${errorText}`);
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
    setShowCompletionScreen(true);
  };

  const handleTryAgain = () => {
    console.log('Try Again pressed');
    setAnswered(false);
    setSelectedOption(null);
    setRetryCount(retryCount + 1);
    setShowRetryModal(false);
  };

  const handleShowCorrectAnswer = () => {
    console.log('Next Question pressed');
    setShowCorrectAnswerModal(false);
    handleNextQuestion();
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    router.back();
  };

  const handleCancelProgressExit = () => {
    console.log('Cancel progress exit pressed');
    setShowProgressExitModal(false);
  };

  const handleConfirmProgressExit = () => {
    console.log('Confirm progress exit pressed');
    setShowProgressExitModal(false);
    router.back();
  };

  const handleTryAgainFromCompletion = () => {
    // Reset the entire exercise
    setCurrentQuestion(0);
    setScore(0);
    setAnswered(false);
    setSelectedOption(null);
    setRetryCount(0);
    setShowCompletionScreen(false);
  };

  const handleContinueFromCompletion = async () => {
    setShowCompletionScreen(false);
    await submitExerciseResults();
  };

  const handleGoBackFromCompletion = () => {
    setShowCompletionScreen(false);
    router.push('/child-dashboard');
  };

  // Show loading state while fetching questions
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Exercise...</Text>
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
            onPress={() => {
              console.log('Back to Dashboard pressed');
              setShowExitModal(true);
            }}
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
          onPress={() => {
            console.log('Main back button pressed');
            setShowProgressExitModal(true);
          }}
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

      {/* Progress Exit Confirmation Modal */}
      {showProgressExitModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Exit Exercise?</Text>
            <Text style={styles.modalText}>
              Your progress will be lost if you exit now. Are you sure you want to leave?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={handleCancelProgressExit}>
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalExitButton} onPress={handleConfirmProgressExit}>
                <Text style={styles.modalExitButtonText}>Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Exit Exercise?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to return to the dashboard?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={handleCancelExit}>
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalExitButton} onPress={handleConfirmExit}>
                <Text style={styles.modalExitButtonText}>Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Retry Modal */}
      {showRetryModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Try Again!</Text>
            <Text style={styles.modalText}>
              That&apos;s not quite right. You have {2 - retryCount} more attempt{2 - retryCount > 1 ? 's' : ''}.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleTryAgain}>
              <Text style={styles.modalButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Correct Answer Modal */}
      {showCorrectAnswerModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Correct Answer</Text>
            <Text style={styles.modalText}>
              The correct answer is &quot;{question?.correctAnswer}&quot;. Let&apos;s move to the next question!
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleShowCorrectAnswer}>
              <Text style={styles.modalButtonText}>Next Question</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Completion Screen */}
      {showCompletionScreen && (
        <View style={[styles.completionOverlay, { backgroundColor: getCompletionData().backgroundColor }]}>
          <View style={styles.completionContent}>
            {/* Mascot Koala */}
            <View style={styles.mascotContainer}>
              <Image 
                source={require('@/assets/images/koala.png')} 
                style={styles.mascotImage}
                resizeMode="contain"
              />
            </View>
            
            {/* Completion Message */}
            <Text style={styles.completionMessage}>{getCompletionData().message}</Text>
            
            {/* Score Display */}
            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreLabel}>Your Score</Text>
              <Text style={styles.scoreFinal}>{score} points</Text>
              <Text style={styles.accuracyText}>
                {Math.round(finalAccuracy * 100)}% accuracy
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.completionButtons}>
              {getCompletionData().showTryAgain ? (
                // Almost There - show Try Again and Go Back
                <>
                  <TouchableOpacity 
                    style={[styles.completionButton, styles.tryAgainButton]} 
                    onPress={handleTryAgainFromCompletion}
                  >
                    <Text style={styles.tryAgainButtonText}>Try Again</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.completionButton, styles.goBackButton]} 
                    onPress={handleGoBackFromCompletion}
                  >
                    <Text style={styles.goBackButtonText}>Go Back</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // Good Work / Excellent - show Continue
                <TouchableOpacity 
                  style={[styles.completionButton, styles.continueButton]} 
                  onPress={handleContinueFromCompletion}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    marginHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalExitButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
  },
  modalExitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Completion Screen Styles
  completionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completionContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  mascotContainer: {
    marginBottom: 20,
  },
  mascotImage: {
    width: 120,
    height: 120,
  },
  completionEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  completionMessage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
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
    marginBottom: 4,
  },
  accuracyText: {
    fontSize: 16,
    color: '#666',
  },
  completionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  completionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tryAgainButton: {
    backgroundColor: '#2196F3',
  },
  tryAgainButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  goBackButton: {
    backgroundColor: '#f0f0f0',
  },
  goBackButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
