import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, Alert } from "react-native";
import { Text, Provider as PaperProvider, ActivityIndicator } from "react-native-paper";
import { OptionCard } from "@/components/ui/OptionCard";
import { FeedbackIndicator } from "@/components/ui/ExerciseFeedback";
import { useRouter, useLocalSearchParams } from "expo-router";
import { API_URL } from "@/config/api";
import { useApp } from '../context/AppContext';

interface Option {
  text: string;
  image?: string;
  option: string;
  correct: boolean;
}

interface Question {
  question: string;
  image?: string;
  options: Option[];
}

interface Exercise {
  title?: string;
  context?: string;
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

    const exerciseData = await response.json();
    console.log('Questions data received:', exerciseData);
    console.log('First question structure:', exerciseData[0]);

    if (!Array.isArray(exerciseData) || exerciseData.length === 0) {
      console.warn('No questions found for exercise:', exerciseId);
      return null;
    }

    // Transform the questions data to match our Exercise interface
    // Each item in exerciseData has a question_data field containing the actual question
    const questionsData = exerciseData.map(item => item.question_data);
    console.log('Transformed questions:', questionsData);

    const exercise: Exercise = {
      title: 'Multiple Select Exercise',
      context: '',
      questions: questionsData
    };

    console.log('Transformed exercise:', exercise);
    return exercise;
    
  } catch (error) {
    console.error('Error fetching questions:', error);
    return null;
  }
}; 

export const MultipleSelect = () => {
  const router = useRouter();
  const { childId, session } = useApp();
  const params = useLocalSearchParams();
  const exerciseId = params.exerciseId as string;
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [currIndex, setCurrIndex] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [score, setScore] = useState(0);
  const [sessionStartTime] = useState(Date.now());

  // Fetch exercise data using the dynamic exerciseId
  useEffect(() => {
    const fetchExercise = async () => {
      try {
        console.log('Fetching exercise with ID:', exerciseId);
        const fetchedExercise = await fetchQuestionsByExerciseId(exerciseId);
        
        if (fetchedExercise) {
          setExercise(fetchedExercise);
          console.log('Exercise loaded successfully:', fetchedExercise);
        } else {
          console.error('Failed to load exercise');
          Alert.alert("Error", "Failed to load exercise questions");
        }
      } catch (error: any) {
        console.error('Error fetching exercise:', error);
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    }; 
    
    if (exerciseId) {
      fetchExercise();
    }
  }, [exerciseId]);

  const currentQuestion = exercise?.questions[currIndex];

  const goToNextQuestion = () => {
    setRetryCount(0); 
    if (exercise && currIndex < exercise.questions.length - 1) {
      setCurrIndex((prev) => prev + 1);
    } else {
      // finish exercise if on last question 
      completeExercise();
    }
  };

  const completeExercise = async () => {
    if (!exercise) {
      console.error('No exercise data available');
      return;
    }
    
    try {
      console.log('Completing exercise with session info:', { childId, session });
      
      const sessionEndTime = Date.now();
      const totalSessionTime = sessionEndTime - sessionStartTime;

      // Calculate correct answers from score (score is 10 points per correct answer)
      const correctAnswers = score / 10;
      const totalQuestions = exercise.questions.length;
      
      const accuracy = Math.max(0, Math.min(1, correctAnswers / totalQuestions));
      const timeSpent = Math.max(0, Math.round(totalSessionTime / 60000));
      
      const exerciseResult = {
        accuracy: accuracy,
        time_spent: timeSpent
      };

      console.log('Submitting exercise result:', exerciseResult);

      const response = await fetch(`${API_URL}/api/results/${childId}/exercise/${exerciseId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(exerciseResult),
      });

      if (response.ok) {
        console.log('Exercise result submitted successfully');
        router.push({
          pathname: '/child-dashboard',
          params: { completedTaskId: exerciseId }
        });
      } else {
        console.error('Failed to submit exercise result:', response.status);
        router.back();
      }
    } catch (error) {
      console.error('Error submitting exercise result:', error);
      router.back();
    }
  }

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback("correct");
      setTimeout(() => {
        setFeedback(null);
        goToNextQuestion();
      }, 1200); 
    } else {
      if (retryCount < 1) {
        // first wrong attempt, retry
        setFeedback("incorrect"); 
        setRetryCount(retryCount + 1); 
        setTimeout(() => setFeedback(null), 1200);
      } else {
        // second wrong attempt, move onto next question (finish if last)
        setFeedback("incorrect"); 
        setTimeout(() => {
          setFeedback(null);
          goToNextQuestion();
        }, 1200); 
      }
    }
  };

 if (loading) {
  return (
    <PaperProvider>
      <View style={styles.container}>
        <ActivityIndicator size="large" color='#FD902B'/>
      </View>
    </PaperProvider>
  )
 }

 if (!exercise || !exercise.questions.length || !currentQuestion) {
  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text>No questions available for this exercise</Text>
      </View>
    </PaperProvider>
  )
 }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.questionText}>
          {currentQuestion.question}
        </Text>

        {currentQuestion.image && (
          <Image
            source={{ uri: currentQuestion.image }}
            style={styles.questionImage}
          />
        )}

        <View style={styles.optionsContainer}>
          {currentQuestion.options?.map((option: Option, index: number) => (
            <OptionCard
              key={`${option.option}-${index}`}
              text={option.text}
              image={option.image ? { uri: option.image } : undefined}
              onPress={() => handleAnswer(option.correct)}
              disabled={!!feedback}
            />
          ))}
        </View>

        {feedback && <FeedbackIndicator type={feedback} />}
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff7de",
    padding: 20,
    justifyContent: "flex-start",
  },
  questionText: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 16,
  },
  questionImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 24,
  },
  optionsContainer: {
    flex: 1,
    gap: 12,
  },
});

export default MultipleSelect;
