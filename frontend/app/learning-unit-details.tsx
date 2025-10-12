import React from "react";
import { ScrollView, StyleSheet, Touchable, TouchableOpacity, View } from "react-native";
import { Text, Button, Provider as PaperProvider } from "react-native-paper";
import { ActivityCards } from "@/components/ui/ActivityCards";
import { UnitCard } from "@/components/ui/UnitCard";

const LearningUnitDetails = () => {
    // TODO dummy data for learning unit, to be replaced with real data
    const selectedUnit = [
        {id: 1, title: "M sounds: Mmm-Magic words Articulation", duration: 12, progress: 100, accuracy: 83},
    ];

    const dummyActivityUnits = [
        {id: 1, title: "Sound safari", completed: "3/3", correct: 0, incorrect: 0, accuracy: "83%"},
        {id: 2, title: "Bubble pop", completed: "6/6", correct: 5, incorrect: 1, accuracy: "83%"},
        {id: 3, title: "Say the word", completed: "3/3", correct: 3, incorrect: 0, accuracy: "100%"},
        {id: 4, title: "Mini story time", completed: "6/6", correct: 4, incorrect: 2, accuracy: "90%"},
    ];

    return (
        <PaperProvider>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => { console.log("Unit card clicked.") }}>
                {selectedUnit.map(unit => (
                    <UnitCard
                        key={unit.id}
                        title={unit.title}
                        duration={`${unit.duration} mins`}
                        progress={unit.accuracy / 100}
                        accuracy={`${unit.accuracy}% accuracy`}
                    />
                ))}
                </TouchableOpacity>

            <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: "600" }}>Activities</Text>
            
            <ScrollView style={{ flex: 1}} contentContainerStyle={styles.scrollContainer}>
                {dummyActivityUnits.map(unit => (
                    <ActivityCards
                        key={unit.id}
                        title={unit.title}
                        completed={unit.completed}
                        correct={unit.correct}
                        incorrect={unit.incorrect}
                        accuracy={`${unit.accuracy}`}
                    />
                ))}
            </ScrollView>
            </View>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        padding: 16,
        backgroundColor: "#fff",
    },
    scrollContainer: {
        paddingBottom: 16, 
    },
});

export default LearningUnitDetails; 