import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { ActivityCards } from "@/components/ui/ActivityCards";
import { UnitCard } from "@/components/ui/UnitCard";
import { useLocalSearchParams} from "expo-router";

const LearningUnitDetails = () => {
    const { id } = useLocalSearchParams();

    // TODO dummy data for learning unit, to be replaced with real data
    const units = [
        {key: 1, title: "M sounds: Mmm-Magic words Articulation", duration: 12, progress: 100, accuracy: 83},
        {key: 2, title: "R sound", duration: 10, progress: 50, accuracy: 78},
   ];

    const dummyActivityUnits = [
        {id: 1, title: "Sound safari", completed: "3/3", correct: 0, incorrect: 0, accuracy: "83%"},
        {id: 2, title: "Bubble pop", completed: "6/6", correct: 5, incorrect: 1, accuracy: "83%"},
        {id: 3, title: "Say the word", completed: "3/3", correct: 3, incorrect: 0, accuracy: "100%"},
        {id: 4, title: "Mini story time", completed: "6/6", correct: 4, incorrect: 2, accuracy: "90%"},
    ];

     const selectedUnit = units.find(unit => unit.key.toString() === id);


    return (
        <PaperProvider theme={DefaultTheme}>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => { console.log("Unit card clicked.") }}>
                {selectedUnit ? (
                    <UnitCard
                        title={selectedUnit.title}
                        duration={`${selectedUnit.duration} mins`}
                        progress={selectedUnit.accuracy / 100}
                        accuracy={`${selectedUnit.accuracy}% accuracy`}
                    />
                ) : (
                <Text>Unit not found</Text>
                )}
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
        backgroundColor: "#fff7de",
    },
    scrollContainer: {
        paddingBottom: 16, 
    },
});

export default LearningUnitDetails; 