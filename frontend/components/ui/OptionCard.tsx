import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Text, TouchableRipple, Card } from "react-native-paper";

interface OptionCardProps {
  text: string;
  image?: any;
  onPress: () => void;
  disabled?: boolean;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  text,
  image,
  onPress,
  disabled,
}) => {
  return (
    <TouchableRipple onPress={onPress} disabled={disabled} rippleColor="rgba(0,0,0,0.1)">
      <Card style={styles.card}>
        <View style={styles.content}>
          <Image source={image} style={styles.image} />
          <Text style={styles.text}>{text}</Text>
        </View>
      </Card>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 2,
    padding: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
  },
});
