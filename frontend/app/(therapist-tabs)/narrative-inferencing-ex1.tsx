import React, { useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text, Provider as PaperProvider } from "react-native-paper";
import { OptionCard } from "../../components/ui/OptionCard";
import { FeedbackIndicator } from "../../components/ui/ExerciseFeedback";

export const NarrativeInferencingEx1 = () => {
  const questions = [
    {
      id: 1,
      question: "Why is the boy happy?",
      image: require("../../assets/images/narrative-inferencing/ex1/narrative-inferencing-ex1-q1.png"),
      options: [
        {
          id: "A",
          text: "He likes stories",
          image: require("../../assets/images/narrative-inferencing/ex1/narrative-inferencing-ex1-q1a.png"),
          correct: false,
        },
        {
          id: "B",
          text: "He likes ice cream",
          image: require("../../assets/images/narrative-inferencing/ex1/narrative-inferencing-ex1-q1b.png"),
          correct: true,
        },
        {
          id: "C",
          text: "It is Monday",
          image: require("../../assets/images/narrative-inferencing/ex1/narrative-inferencing-ex1-q1c.png"),
          correct: false,
        },
      ],
    },
    {
      id: 2,
      question: "Why is she using an umbrella?",
      image: require("../../assets/images/narrative-inferencing/ex1/narrative-inferencing-ex1-q2.jpg"),
      options: [
        {
          id: "A",
          text: "It is cold",
          image: require("../../assets/images/narrative-inferencing/ex1/narrative-inferencing-ex1-q2a.png"),
          correct: false,
        },
        {
          id: "B",
          text: "It is raining",
          image: require("../../assets/images/narrative-inferencing/ex1/narrative-inferencing-ex1-q2b.png"),
          correct: true,
        },
        {
          id: "C",
          text: "It is sunny",
          image: require("../../assets/images/narrative-inferencing/ex1/narrative-inferencing-ex1-q2c.png"),
          correct: false,
        },
      ],
    },
    {
      id: 3,
      question: "Why is the girl scared?",
      image: require("../../assets/images/narrative-inferencing/ex1/narrative-inferencing-ex1-q3.png"),
      options: [
        {
          id: "A",
          text: "She is scared of storms",
          image: require("../../assets/images/narrative-inferencing/ex1/narrative-inferencing-ex1-q3a.png"),
          correct: false,
        },
        {
          id: "B",
          text: "She is getting an injection",
          image: require("../../assets/images/narrative-inferencing/ex1/narrative-inferencing-ex1-q3b.png"),
          correct: true,
        },
        {
          id: "C",
          text: "She is scared of spiders",
          image: require("../../assets/images/narrative-inferencing/ex1/narrative-inferencing-ex1-q3c.png"),
          correct: false,
        },
      ],
    },
  ];

  const [currIndex, setCurrIndex] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const currentQuestion = questions[currIndex];

  const handleAnswer = (isCorrect: boolean) => {
    setFeedback(isCorrect ? "correct" : "incorrect");
    setTimeout(() => {
      setFeedback(null);
      if (currIndex < questions.length - 1) {
        setCurrIndex((prev) => prev + 1);
      } else {
        alert("Well done!");
      }
    }, 1200);
  };

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
