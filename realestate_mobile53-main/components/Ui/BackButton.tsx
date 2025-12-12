import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface BackButtonProps {
  onPress?: () => void;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  style?: ViewStyle;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  color = "#8A8A8A",
  backgroundColor = "transparent",
  borderColor = "#D6D6D6",
  style,
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.backButton,
        { backgroundColor, borderColor, borderWidth: 1.5 },
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="chevron-back" size={24} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
