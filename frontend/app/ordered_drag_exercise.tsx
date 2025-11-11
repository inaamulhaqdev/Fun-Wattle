import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Text } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { FeedbackIndicator } from "../components/ui/ExerciseFeedback";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '@/config/api';

interface Option {
  id: string;
  text: string;
  image?: string;
  order: number;
}

interface QuestionData {
  id: number;
  image?: string;
  question: string;
  correctSeq?: string[];
  options: Option[];
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
  questions: QuestionData[];
}

//Fetch questions for a specific exercise by ID
const fetchQuestionsByExerciseId = async (exerciseId: string): Promise<Exercise | null> => {
  console.log('=== FETCHING ORDERED DRAG QUESTIONS BY EXERCISE ID ===');
  console.log('Exercise ID:', exerciseId);
  console.log('API_URL:', API_URL);

  try {
    const url = `${API_URL}/questions/${exerciseId}/`;
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

    // Transform API questions to our QuestionData format
    const transformedQuestions: QuestionData[] = questionsData
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

          return {
            id: index + 1,
            image: questionData.image || undefined,
            question: questionData.question || 'Question not available',
            correctSeq: questionData.correctSeq || [],
            options: questionData.options || []
          };
        } catch (parseError) {
          console.error('Error parsing question_data for question:', apiQuestion.id, parseError);
          return {
            id: index + 1,
            question: 'Error loading question',
            correctSeq: [],
            options: []
          };
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
      id: 1,
      image: "https://cvchwjconynpzhktnuxn.supabase.co/storage/v1/object/public/Images_Units/semantics-ex1-q4.png",
      question: "What is the woman doing?",
      correctSeq: ["The woman", "is baking", "a cake"],
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
  const { exerciseId, childId } = useLocalSearchParams<{ exerciseId: string; childId: string }>();
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

  // Initialize and load exercise data
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
          console.warn('Failed to load exercise data, using fallback');
        }
      }

      // Use fallback data if API fetch failed
      console.log('Using fallback exercise data');
      setExercise(fallbackExercise);
      setIsLoading(false);
    };

    loadExerciseData();
  }, [childId, exerciseId]);

  const currentQuestionData = exercise?.questions[currentQuestion];

  const handleOptionSelect = (option: Option) => {
    if (answered) return;

    const newSelectedOptions = [...selectedOptions, option];
    setSelectedOptions(newSelectedOptions);

    // Check if we have selected all required options
    const expectedLength = currentQuestionData?.correctSeq?.length || currentQuestionData?.options?.length || 0;
    
    if (newSelectedOptions.length === expectedLength) {
      checkAnswer(newSelectedOptions);
    }
  };

  const handleOptionDeselect = (optionToRemove: Option) => {
    if (answered) return;
    
    const newSelectedOptions = selectedOptions.filter(opt => opt.id !== optionToRemove.id);
    setSelectedOptions(newSelectedOptions);
  };

  const checkAnswer = (userSelection: Option[]) => {
    if (!currentQuestionData) return;

    setAnswered(true);
    
    // Check if the order is correct
    const userSequence = userSelection.map(opt => opt.text);
    const correctSequence = currentQuestionData.correctSeq || [];
    
    const isCorrect = userSequence.length === correctSequence.length &&
      userSequence.every((text, index) => text === correctSequence[index]);

    if (isCorrect) {
      setShowFeedback("correct");
      setScore(score + 1);
      
      setTimeout(() => {
        nextQuestion();
      }, 2000);
    } else {
      setShowFeedback("incorrect");
      setRetryCount(retryCount + 1);
      
      setTimeout(() => {
        resetCurrentQuestion();
      }, 2000);
    }
  };

  const resetCurrentQuestion = () => {
    setSelectedOptions([]);
    setShowFeedback(null);
    setAnswered(false);
  };

  const nextQuestion = () => {
    if (currentQuestion < (exercise?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
      resetCurrentQuestion();
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

  const handleExit = () => {
    router.push({
      pathname: '/child-dashboard',
      params: { completedTaskId: exerciseId }
    });
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
            <TouchableOpacity style={styles.completeButton} onPress={handleExit}>
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
});

export default OrderedDragExercise;