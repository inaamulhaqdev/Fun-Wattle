import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, Button, Provider as PaperProvider } from "react-native-paper";

const LearningUnitDetails = () => {
    return (
        <PaperProvider>
            <View style={styles.container}>
                <Text variant="headlineMedium">Learning Unit Details</Text>
                <Text variant="bodyMedium">Details about the selected learning unit will be displayed here.</Text>
                <Button mode="contained" onPress={() => console.log("Start Learning Pressed")}>
                    Start Learning
                </Button>
            </View>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
});

export default LearningUnitDetails; 