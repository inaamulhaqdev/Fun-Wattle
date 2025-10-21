import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { ActivityCards } from "@/components/ui/ActivityCards";
import { UnitCard } from "@/components/ui/UnitCard";
import { useLocalSearchParams} from "expo-router";

const LearningUnitDetails = () => {
    const { id } = useLocalSearchParams();

    // Scalable learning units data structure
    const learningUnitsData = {
        1: {
            key: 1,
            title: "M sounds: Mmm-Magic words Articulation",
            duration: 12,
            progress: 100,
            accuracy: 83,
            activities: [
                {id: 1, title: "Sound safari", type: "pronunciation", totalExercises: 3, completed: 3, correct: 2, incorrect: 1, accuracy: 67},
                {id: 2, title: "Bubble pop", type: "pronunciation", totalExercises: 6, completed: 6, correct: 5, incorrect: 1, accuracy: 83},
                {id: 3, title: "Say the word", type: "pronunciation", totalExercises: 3, completed: 3, correct: 3, incorrect: 0, accuracy: 100},
                {id: 4, title: "Mini story time", type: "comprehension", totalExercises: 6, completed: 6, correct: 4, incorrect: 2, accuracy: 67},
            ]
        },
        2: {
            key: 2,
            title: "R sound",
            duration: 10,
            progress: 50,
            accuracy: 78,
            activities: [
                {id: 5, title: "Rolling R's", type: "pronunciation", totalExercises: 4, completed: 2, correct: 1, incorrect: 1, accuracy: 50},
                {id: 6, title: "Rhyme time", type: "pronunciation", totalExercises: 5, completed: 3, correct: 3, incorrect: 0, accuracy: 100},
                {id: 7, title: "Robot words", type: "pronunciation", totalExercises: 6, completed: 0, correct: 0, incorrect: 0, accuracy: 0},
            ]
        },
        3: {
            key: 3,
            title: "Opposite Words",
            duration: 8,
            progress: 0,
            accuracy: 0,
            activities: [
                {id: 8, title: "Find the Opposite", type: "opposites", totalExercises: 5, completed: 0, correct: 0, incorrect: 0, accuracy: 0},
                {id: 9, title: "Opposite Match Game", type: "opposites", totalExercises: 8, completed: 0, correct: 0, incorrect: 0, accuracy: 0},
                {id: 10, title: "Hot or Cold", type: "opposites", totalExercises: 4, completed: 0, correct: 0, incorrect: 0, accuracy: 0},
            ]
        },
        4: {
            key: 4,
            title: "Letter Recognition",
            duration: 15,
            progress: 0,
            accuracy: 0,
            activities: [
                {id: 11, title: "ABC Hunt", type: "letters", totalExercises: 10, completed: 0, correct: 0, incorrect: 0, accuracy: 0},
                {id: 12, title: "Letter Tracing", type: "letters", totalExercises: 12, completed: 0, correct: 0, incorrect: 0, accuracy: 0},
                {id: 13, title: "Match Upper & Lower", type: "letters", totalExercises: 6, completed: 0, correct: 0, incorrect: 0, accuracy: 0},
            ]
        }
    };

    // Extract all units for the unit selector
    const units = Object.values(learningUnitsData);
    
    // Get activities for the selected unit
    const selectedUnitData = learningUnitsData[Number(id) as keyof typeof learningUnitsData];
    const activityUnits = selectedUnitData?.activities || [];

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
                {activityUnits.map(activity => (
                    <ActivityCards
                        key={activity.id}
                        title={activity.title}
                        completed={`${activity.completed}/${activity.totalExercises}`}
                        correct={activity.correct}
                        incorrect={activity.incorrect}
                        accuracy={`${activity.accuracy}%`}
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
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: "#fff7de",
    },
    scrollContainer: {
        paddingBottom: 16, 
    },
});

export default LearningUnitDetails; 