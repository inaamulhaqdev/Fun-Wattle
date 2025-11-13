import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Text } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { FeedbackIndicator } from "../components/ui/ExerciseFeedback";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '@/config/api';
import { useApp } from '@/context/AppContext';

interface Option {
  id: string;
  text: string;
  image?: string;
  order: number;
}

interface QuestionData {
  id: string;
  image?: string;
  question: string;
  options: Option[];
}

interface ApiQuestion {
  id: string;
  exercise?: string;
  order: number;
  question_type: string; // Changed from exercise_type to question_type
  question_data: any; // Can be string or object
  created_at: string;
}

interface Exercise {
  id: number;
  title: string;
  questions: QuestionData[];
}

//Fetch questions for a specific exercise by ID
const fetchQuestionsByExerciseId = async (exerciseId: string): Promise<Exercise | null> => {
  console.log('=== FETCHING ORDERED DRAG QUESTIONS BY EXERCISE ID ===');
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
    console.log('🚀 DEBUGGING: About to start transformation with updated code');

    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      console.warn('No questions found for exercise:', exerciseId);
      return null;
    }

    // Transform API questions to our QuestionData format
    console.log('🔧 Starting transformation of', questionsData.length, 'questions');
    
    const transformedQuestions: QuestionData[] = questionsData
      .sort((a: ApiQuestion, b: ApiQuestion) => a.order - b.order) // Sort by order
      .map((apiQuestion: ApiQuestion, index: number) => {
        console.log(`🔧 Processing question ${index + 1}:`, apiQuestion);
        try {
          // Handle both string and object cases for question_data
          let questionData;
          if (typeof apiQuestion.question_data === 'string') {
            questionData = JSON.parse(apiQuestion.question_data);
          } else {
            questionData = apiQuestion.question_data;
          }
          console.log(`✅ Question ${index + 1} parsed data:`, questionData);
          console.log(`✅ Using API question ID: ${apiQuestion.id}`);
          console.log(`API question ID: ${apiQuestion.id}`);
          console.log(`Question data ID (if any): ${questionData.id}`);

          const transformedQuestion = {
            id: apiQuestion.id, // Use the actual API question ID
            image: questionData.image || undefined,
            question: questionData.question || 'Question not available',
            options: questionData.options || []
          };
          
          console.log(`✅ Transformed question ${index + 1}:`, transformedQuestion);
          return transformedQuestion;
        } catch (parseError) {
          console.error('❌ Error parsing question_data for question:', apiQuestion.id, parseError);
          const errorQuestion = {
            id: apiQuestion.id, // Use the actual API question ID even in error case
            question: 'Error loading question',
            options: []
          };
          console.log(`❌ Error question ${index + 1}:`, errorQuestion);
          return errorQuestion;
        }
      });

    const exercise: Exercise = {
      id: parseInt(exerciseId) || 1,
      title: 'Ordered Drag Exercise',
      questions: transformedQuestions
    };

    console.log('Transformed exercise:', exercise);
    return exercise;

  } catch (error) {
    console.error('Network error fetching questions:', error);
    return null;
  }
};

// Fallback data for when API fails
const fallbackExercise: Exercise = {
  id: 1,
  title: 'Ordered Drag Exercise',
  questions: [
    {
      id: "fallback-question-1",
      image: "https://cvchwjconynpzhktnuxn.supabase.co/storage/v1/object/public/Images_Units/semantics-ex1-q4.png",
      question: "What is the woman doing?",
      options: [
        {
          id: "A",
          text: "The woman",
          image: "https://cvchwjconynpzhktnuxn.supabase.co/storage/v1/object/public/Images_Units/semantics-ex1-q4-a.png",
          order: 1
        },
        {
          id: "B",
          text: "is baking",
          image: "https://cvchwjconynpzhktnuxn.supabase.co/storage/v1/object/public/Images_Units/semantics-ex1-q4-b.png",
          order: 2
        },
        {
          id: "C",
          text: "a cake",
          image: "https://cvchwjconynpzhktnuxn.supabase.co/storage/v1/object/public/Images_Units/semantics-ex1-q4-c.png",
          order: 3
        }
      ]
    }
  ]
};

export const OrderedDragExercise = () => {
  const router = useRouter();
  const { exerciseId, childId: paramChildId } = useLocalSearchParams<{ exerciseId: string, childId: string}>();
  const { childId: contextChildId, session } = useApp();
  
  // Prioritize route parameter (from global childId), then context, then fallback
  const fallbackChildId = "3fa85f64-5717-4562-b3fc-2c963f66afa6"; 
  const childId = paramChildId || contextChildId || fallbackChildId;
  
  console.log('=== EXERCISE PARAMETERS ===');
  console.log('exerciseId:', exerciseId);
  console.log('Context childId:', contextChildId);
  console.log('Param childId:', paramChildId);
  console.log('Using childId:', childId);
  console.log('All search params:', useLocalSearchParams());
  
  // App context would be used here for saving exercise completion if needed
  
  // State management
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [showFeedback, setShowFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionAttempts, setQuestionAttempts] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);

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
          console.log('✅ Successfully loaded exercise data from API:', fetchedExercise);
          console.log('✅ First question ID from API:', fetchedExercise.questions[0]?.id);
          setExercise(fetchedExercise);
          
          // Check for saved progress and restore state
          const savedProgress = loadSavedProgress();
          if (savedProgress) {
            setCurrentQuestion(savedProgress.currentQuestion || 0);
            setScore(savedProgress.score || 0);
            setRetryCount(savedProgress.retryCount || 0);
            setQuestionStartTime(Date.now()); // Reset question timer
            console.log('Progress restored from saved state');
          }
          
          setIsLoading(false);
          return;
        } else {
          console.warn('Failed to load exercise data, using fallback');
        }
      }

      // Use fallback data if API fetch failed
      console.log('⚠️ Using fallback exercise data');
      console.log('⚠️ Fallback first question ID:', fallbackExercise.questions[0]?.id);
      setExercise(fallbackExercise);
      
      // Check for saved progress even with fallback data
      const savedProgress = loadSavedProgress();
      if (savedProgress) {
        setCurrentQuestion(savedProgress.currentQuestion || 0);
        setScore(savedProgress.score || 0);
        setRetryCount(savedProgress.retryCount || 0);
        setQuestionStartTime(Date.now());
        console.log('Progress restored from saved state (fallback)');
      }
      
      setIsLoading(false);
    };

    loadExerciseData();
  }, [childId, exerciseId]); // loadSavedProgress is called inside useEffect so no need to include it

  const currentQuestionData = exercise?.questions[currentQuestion];

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

      // Try different field order and ensure proper types
      const resultData = {
        num_correct: correct ? 1 : 0,
        num_incorrect: correct ? attempts - 1 : attempts,
        time_spent: parseInt(timeSpent.toString()) // Ensure it's an integer
      };

      console.log('Submitting result data:', resultData);
      console.log('XXXXX SESSION DEBUG XXXXX:', session);
      console.log('XXXXX ACCESS TOKEN XXXXX:', session?.access_token);
      console.log('XXXXX STRINGIFIED DATA XXXXX:', JSON.stringify(resultData));

      // Prepare headers - only add Authorization if we have a valid token
      const headers: any = {
        'Content-Type': 'application/json',
      };

      // Temporarily disable Authorization to test if that's the issue
      // if (session?.access_token) {
      //   headers['Authorization'] = `Bearer ${session.access_token}`;
      //   console.log('🔍 Adding Authorization header');
      // } else {
      //   console.log('⚠️ No access token found, sending without Authorization');
      // }
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

  const handleOptionSelect = (option: Option) => {
    console.log('handleOptionSelect called with option:', option);
    console.log('answered state:', answered);
    
    if (answered) return;

    const newSelectedOptions = [...selectedOptions, option];
    setSelectedOptions(newSelectedOptions);

    // Check if we have selected all required options
    // For ordered drag exercises, we always use the number of options as the expected length
    const expectedLength = currentQuestionData?.options?.length || 0;
    
    console.log('Expected length:', expectedLength);
    console.log('New selected options length:', newSelectedOptions.length);
    console.log('Should call checkAnswer?', newSelectedOptions.length === expectedLength);
    
    if (newSelectedOptions.length === expectedLength) {
      console.log('About to call checkAnswer with:', newSelectedOptions);
      checkAnswer(newSelectedOptions);
    }
  };

  const handleOptionDeselect = (optionToRemove: Option) => {
    if (answered) return;
    
    const newSelectedOptions = selectedOptions.filter(opt => opt.id !== optionToRemove.id);
    setSelectedOptions(newSelectedOptions);
  };

  const checkAnswer = async (userSelection: Option[]) => {
    console.log('checkAnswer called with userSelection:', userSelection);
    if (!currentQuestionData) return;

    setAnswered(true);
    
    // Increment attempts for this question
    const currentAttempts = questionAttempts + 1;
    setQuestionAttempts(currentAttempts);
    
    // Check if the order is correct
    const userSequence = userSelection.map(opt => opt.text);
    
    // For ordered drag exercises, always generate correct sequence from options' order property
    const correctSequence = currentQuestionData.options
      .sort((a, b) => a.order - b.order)
      .map(opt => opt.text);
    
    const isCorrect = userSequence.length === correctSequence.length &&
      userSequence.every((text, index) => text === correctSequence[index]);

    if (isCorrect) {
      setShowFeedback("correct");
      setScore(score + 1);
      
      // Calculate time spent on this question
      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
      
      // Submit question result
      console.log('🔍 DEBUG: currentQuestionData:', currentQuestionData);
      console.log('🔍 DEBUG: currentQuestionData.id:', currentQuestionData.id);
      const questionId = currentQuestionData.id; // Already a string now
      console.log('🔍 DEBUG: questionId being submitted:', questionId);
      await submitQuestionResult(questionId, true, timeSpent, currentAttempts);
      
      setTimeout(() => {
        nextQuestion();
      }, 2000);
    } else {
      setShowFeedback("incorrect");
      setRetryCount(retryCount + 1);

      // Check if this was the final incorrect attempt (3 attempts total)
      if (currentAttempts >= 3) {
        // Calculate time spent on this question
        const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

        // Submit question result as incorrect after 3 failed attempts
        console.log('🔍 DEBUG: currentQuestionData (incorrect):', currentQuestionData);
        console.log('🔍 DEBUG: currentQuestionData.id (incorrect):', currentQuestionData.id);
        const questionId = currentQuestionData.id; // Already a string now
        console.log('🔍 DEBUG: questionId being submitted (incorrect):', questionId);
        await submitQuestionResult(questionId, false, timeSpent, currentAttempts);
        
        setTimeout(() => {
          // Move to next question after final incorrect attempt
          nextQuestion();
        }, 2000);
      } else {
        // Allow retry - reset current question for another attempt
        setTimeout(() => {
          resetCurrentQuestion();
        }, 2000);
      }
    }
  };

  const resetCurrentQuestion = () => {
    setSelectedOptions([]);
    setShowFeedback(null);
    setAnswered(false);
    // Don't reset question attempts or start time - keep them for the same question
  };

  const nextQuestion = () => {
    if (currentQuestion < (exercise?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
      resetCurrentQuestion();
      // Reset for new question
      setQuestionAttempts(0);
      setQuestionStartTime(Date.now());
    } else {
      completeExercise();
    }
  };

  const completeExercise = async () => {
    setShowCompletionScreen(true);
    
    // Exercise completion logic can be added here when the context method is available
    if (childId && exerciseId) {
      const sessionEndTime = Date.now();
      const sessionDuration = Math.round((sessionEndTime - sessionStartTime) / 1000); // in seconds
      
      console.log('Exercise completed:', {
        childId: childId,
        exerciseId: exerciseId,
        score: score,
        totalQuestions: exercise?.questions.length || 0,
        sessionDuration: sessionDuration,
        retryCount: retryCount
      });
    }
  };

  // Save progress and exit
  const saveProgressAndExit = async () => {
    if (!childId || !exerciseId) {
      router.back();
      return;
    }

    try {
      // Save current progress to localStorage or backend
      const progressData = {
        exerciseId,
        childId,
        currentQuestion,
        score,
        retryCount,
        sessionStartTime,
        timestamp: Date.now()
      };

      // Save to localStorage for now (could be enhanced to save to backend)
      const storageKey = `exercise_progress_${exerciseId}_${childId}`;
      localStorage.setItem(storageKey, JSON.stringify(progressData));
      
      console.log('Progress saved:', progressData);
      
    } catch (error) {
      console.error('Error saving progress:', error);
    }
    
    router.back();
  };

  const handleExit = () => {
    console.log('Exit button pressed');
    setShowExitModal(true);
  }

  const handleComplete = async () => {
    console.log('Complete button pressed');
    
    try {
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

      // Navigate back to dashboard after successful submission
      router.push({
        pathname: '/child-dashboard',
        params: { completedTaskId: exerciseId }
      });

    } catch (error) {
      console.error('Error submitting exercise:', error);
    }
  };

  if (isLoading) {
    return (
      <PaperProvider>
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading exercise...</Text>
          </View>
        </View>
      </PaperProvider>
    );
  }

  if (!exercise || !currentQuestionData) {
    return (
      <PaperProvider>
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load exercise</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleExit}>
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </PaperProvider>
    );
  }

  if (showCompletionScreen) {
    return (
      <PaperProvider>
        <View style={styles.container}>
          <View style={styles.completionContainer}>
            <Text style={styles.completionTitle}>Exercise Complete!</Text>
            <Text style={styles.completionScore}>
              Score: {score} / {exercise.questions.length}
            </Text>
            <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
              <Text style={styles.completeButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </PaperProvider>
    );
  }

  const availableOptions = currentQuestionData.options.filter(
    option => !selectedOptions.some(selected => selected.id === option.id)
  );

  console.log('🎯 RENDER DEBUG: Current question index:', currentQuestion);
  console.log('🎯 RENDER DEBUG: Exercise:', exercise);  
  console.log('🎯 RENDER DEBUG: currentQuestionData:', currentQuestionData);
  console.log('🎯 RENDER DEBUG: currentQuestionData.id:', currentQuestionData?.id);
  console.log('Available options:', availableOptions);
  console.log('Selected options:', selectedOptions);

  return (
    <PaperProvider>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
            <Text style={styles.exitButtonText}>×</Text>
          </TouchableOpacity>
          <Text style={styles.progress}>
            {currentQuestion + 1} / {exercise.questions.length}
          </Text>
        </View>

        {/* Main Image */}
        {currentQuestionData.image && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: currentQuestionData.image }} 
              style={styles.questionImage}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Question */}
        <Text style={styles.question}>{currentQuestionData.question}</Text>

        {/* Selected Options Area */}
        <View style={styles.selectedArea}>
          <Text style={styles.sectionTitle}>Your Answer:</Text>
          <View style={styles.selectedOptionsContainer}>
            {selectedOptions.map((option, index) => (
              <TouchableOpacity
                key={`selected-${option.id}-${index}`}
                style={styles.selectedOption}
                onPress={() => handleOptionDeselect(option)}
                disabled={answered}
              >
                {option.image && (
                  <Image 
                    source={{ uri: option.image }} 
                    style={styles.optionImage}
                    resizeMode="contain"
                  />
                )}
                <Text style={styles.selectedOptionText}>{option.text}</Text>
                <Text style={styles.orderNumber}>{index + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Available Options */}
        <View style={styles.optionsArea}>
          <Text style={styles.sectionTitle}>Available Options:</Text>
          <View style={styles.optionsContainer}>
            {availableOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                onPress={() => handleOptionSelect(option)}
                disabled={answered}
              >
                {option.image && (
                  <Image 
                    source={{ uri: option.image }} 
                    style={styles.optionImage}
                    resizeMode="contain"
                  />
                )}
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Feedback */}
        {showFeedback && (
          <FeedbackIndicator 
            type={showFeedback} 
          />
        )}

        {/* Exit Modal */}
        {showExitModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Exit Exercise?</Text>
              <Text style={styles.modalText}>
                Your progress will be saved and you can continue where you left off later.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowExitModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveProgressAndExit}
                >
                  <Text style={styles.saveButtonText}>Save & Exit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  progress: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  questionImage: {
    width: 300,
    height: 200,
    borderRadius: 12,
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2c3e50',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#34495e',
  },
  selectedArea: {
    marginBottom: 30,
  },
  selectedOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: 80,
    backgroundColor: '#ecf0f1',
    borderRadius: 12,
    padding: 10,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderStyle: 'dashed',
  },
  selectedOption: {
    backgroundColor: '#3498db',
    padding: 12,
    margin: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  orderNumber: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e74c3c',
    color: 'white',
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
  optionsArea: {
    marginBottom: 30,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  optionCard: {
    backgroundColor: 'white',
    padding: 15,
    margin: 8,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionImage: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 20,
  },
  completionScore: {
    fontSize: 22,
    color: '#2c3e50',
    marginBottom: 30,
  },
  completeButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    margin: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  saveButton: {
    backgroundColor: '#3498db',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderedDragExercise;