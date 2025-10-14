import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Menu, DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import Filters from "../../components/parent/Filters";

export default function TherapistDashboard() {
  let therapist_user = "Dwight";
  
  const childList = ["Philip", "Kumail", "Linda"];
  const [selected_child, setSelectedChild] = React.useState(childList[0]);
  const [menuVisible, setMenuVisible] = React.useState(false);

   return (
    <PaperProvider theme={DefaultTheme}>
      <SafeAreaView style={styles.container}>
        <Text variant='titleLarge' style={styles.title}>Good evening, {therapist_user}!</Text>

        <View style={styles.subtitleRow}>
          <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
              <TouchableOpacity style={styles.childButton} onPress={() => setMenuVisible(true)}>
              <Text style={styles.childText}>{selected_child}</Text>
            </TouchableOpacity>

          }
          style={styles.menuContainer}
        >
          {childList.map((child) => (
            <Menu.Item
              key={child}
              onPress={() => {
                setSelectedChild(child);
                setMenuVisible(false);
              }}
              title={child}
              titleStyle={{ color: "#000000ff", fontWeight: "500" }}
              style={{ backgroundColor: "#f7f7f7", borderRadius: 10}}
            />
          ))} 
        </Menu>

        <Text variant="bodyMedium" style={styles.subtitle}>&apos;s progress this week.</Text>

        </View>
        <Filters />
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#fff7de",
  },
  title: {
    paddingTop: "10%",
    fontWeight: "bold",
    color: "black",
  },
  subtitleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 5,
  },
  childText: {
    fontWeight: "600",
    color: "black",
  },
  childButton: {
    backgroundColor: "#f0e1b8",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  subtitle: {
    fontWeight: "400",
    color: "black",
  }, 
  menuContainer: { 
    backgroundColor: "#fff",
    borderRadius: 12, 
  },  
});