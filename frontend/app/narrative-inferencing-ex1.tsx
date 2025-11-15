import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, Alert } from "react-native";
import { Text, Provider as PaperProvider, ActivityIndicator } from "react-native-paper";
import { OptionCard } from "@/components/ui/OptionCard";
import { FeedbackIndicator } from "@/components/ui/ExerciseFeedback";
import { router } from "expo-router";
import { API_URL } from "@/config/api";

export const NarrativeInferencingEx1 = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currIndex, setCurrIndex] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [retryCount, setRetryCount] = useState(0); // adding in "a child can try a question up to two times" functionality

  // Fetch learning unit
  useEffect(() => {
    const fetchExercise = async () => {
      try {
        // COME BACK HERE - NOT SURE IF ENDPOINT IS CORRECT
        const response = await fetch(`${API_URL}/learning-units/narrative-inferencing/ex1/`);
        if (!response.ok) {
          throw new Error(`Failed to fetch exercise (${response.status})`);
        }
        const data = await response.json();
        console.log("Fetched data:", data);

        const formatted = data.map((q: any) => ({
          id: q.id,
          question: q.question_text,
          image: { uri: q.image_url },
          options: q.options.map((opt: any) => ({
            id: opt.id,
            text: opt.text,
            image: { uri: opt.image_url },
            correct: opt.is_correct,
          })),
        }));

        setQuestions(formatted);
      } catch (error:any) {
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExercise();
  }, []);

  const currentQuestion = questions[currIndex] || {};

  const goToNextQuestion = () => {
    setRetryCount(0);
    if (currIndex < questions.length - 1) {
      setCurrIndex((prev) => prev + 1);
    } else {
      // finish exercise if on last question
      Alert.alert("Great job!", "You have finished all the questions!");
      // navigate to exercise 2
      router.push('/ordered_drag_exercise');
    }
  }

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
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
        // second wring attempt, move onto next question (finish if last)
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

 if (!questions.length) {
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

        <Image
          source={currentQuestion.image}
          style={styles.questionImage}
        />

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => (
            <OptionCard
              key={option.id}
              text={option.text}
              image={option.image}
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

export default NarrativeInferencingEx1;
