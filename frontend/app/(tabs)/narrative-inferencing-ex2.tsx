import React, { useState } from "react";
import { View, StyleSheet, Image, ScrollView } from "react-native";
import { Text, Provider as PaperProvider } from "react-native-paper";
import { OptionCard } from "../../components/ui/OptionCard";
import { FeedbackIndicator } from "../../components/ui/ExerciseFeedback";

export const NarrativeInferencingEx2 = () => {
  const questions = [
    {
      id: 1,
      image: require("../../assets/images/narrative-inferencing/ex2/narrative-inferencing-ex2a.png"),
      question: "Boy is on the _______. Weather is _______. I can see that Boy is wearing a _______. Boy will collect the _______ and boy will make a _______.",
      correctSeq: ["beach", "hot", "hat", "sand", "sandcastle"],
      options: [
        {
          id: "A",
          text: "hot",
        },
        {
          id: "B",
          text: "sand",
        },
        {
          id: "C",
          text: "beach",
        },
        {
          id: "D",
          text: "sandcastle",
        },
        {
          id: "E",
          text: "hat",
        },
      ],
    }, 
    {
      id: 2,
      image: require("../../assets/images/narrative-inferencing/ex2/narrative-inferencing-ex2b.png"),
      question: "There are _______ kids. Children are making _______. It is a _______ day. Children are wearing _______ clothes. Children are feeling _______.",
      correctSeq: ["two", "snowman", "snowy", "warm", "happy"],
      options: [
        {
          id: "A",
          text: "snowman",
        },
        {
          id: "B",
          text: "happy",
        },
        {
          id: "C",
          text: "two",
        },
        {
          id: "D",
          text: "warm",
        },
        {
          id: "E",
          text: "snowy",
        },
      ],
    },
     {
      id: 3,
      image: require("../../assets/images/narrative-inferencing/ex2/narrative-inferencing-ex2c.png"),
      question: "This is a _______. There is a _______. Giraffe has _______ neck. There are _______ children in the picture. Children are giving _______ to giraffe. Giraffe is _______ food. All of them are feeling _______.",
      correctSeq: ["zoo", "giraffe", "long", "four", "food", "enjoying", "happy"],
      options: [
        {
          id: "A",
          text: "enjoying",
        },
        {
          id: "B",
          text: "long",
        },
        {
          id: "C",
          text: "zoo",
        },
        {
          id: "D",
          text: "food",
        },
        {
          id: "E",
          text: "giraffe",
        },
        {
          id: "F",
          text: "happy",
        },
        {
          id: "G",
          text: "four",
        },
      ],
    },
    {
      id: 4,
      image: require("../../assets/images/narrative-inferencing/ex2/narrative-inferencing-ex2d.png"),
      question: "This is a _______. There are _______ people in the picture. People are here to eat _______. _______ is the one who serves the food and he is serving food to _______. It seems like they all are _______ their food.",
      correctSeq: ["restaurant", "five", "food", "Waiter", "people", "enjoying"],
      options: [
        {
          id: "A",
          text: "people",
        },
        {
          id: "B",
          text: "food",
        },
        {
          id: "C",
          text: "restaurant",
        },
        {
          id: "D",
          text: "enjoying",
        },
        {
          id: "E",
          text: "five",
        },
        {
          id: "F",
          text: "Waiter",
        },
      ],
    },
  ];

  const [currIndex, setCurrIndex] = useState(0);
  const [selectedSeq, setSelectedSeq] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  
  const currQuestion = questions[currIndex];

  const handleSelect = (text: string) => {
    if (feedback) return;

    const newSeq = [...selectedSeq, text];
    setSelectedSeq(newSeq);

    const correctPrefix = currQuestion.correctSeq.slice(0, newSeq.length);
    const isStillCorrect = newSeq.every((t, i) => t === correctPrefix[i]);

    if (!isStillCorrect) {
        // incorrect
      setFeedback("incorrect");
      setTimeout(() => {
        setFeedback(null);
        setSelectedSeq([]);
      }, 1200);
      return;
      }

    // if all correct 
    if (newSeq.length === currQuestion.correctSeq.length) {     
        setFeedback("correct");
        setTimeout(() => {
            setFeedback(null);
            if (currIndex < questions.length - 1) {
                setCurrIndex((prev) => prev + 1);
                setSelectedSeq([]);
            } else {
                alert("Well done!");
            }
        }, 1200);
    }
};

  return (
    <PaperProvider>
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
            <Text variant="headlineSmall" style={styles.questionText}>
            {currQuestion.question}
            </Text>

            <Image
            source={currQuestion.image}
            style={styles.questionImage}
            />

            <View style={styles.selectedContainer}>
            {selectedSeq.length > 0 ? (
                <Text variant="titleMedium" style={styles.selectedText}> Your answer: {selectedSeq.join(" ")}</Text>
            ) : (
                <Text variant="titleMedium" style={styles.selectedTextOpaque}> Tap the options below to complete the sentence</Text>
            )}
            </View>

            <View style={styles.optionsContainer}>
                    {currQuestion.options.map((option) => (
                        <OptionCard
                        key={option.id}
                        text={option.text}
                        onPress={() => handleSelect(option.text)}
                        disabled={!!feedback}
                        />
                    ))}
                    </View>

            {feedback && <FeedbackIndicator type={feedback} />}
        </View>
      </ScrollView>
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
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
  },
  selectedContainer: {
    marginBottom: 16, 
    alignItems: "center",
  },
  selectedText: {
    fontWeight: "600", 
    color: "#4A4A4A"
  }, 
  selectedTextOpaque: {
    color: "#8A8A8A"
  }, 
  optionsContainer: {
    flex: 1,
    gap: 12,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});

export default NarrativeInferencingEx2;