import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Typography } from "../styles";

interface SelectionButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  style?: ViewStyle;
}

const SelectionButton: React.FC<SelectionButtonProps> = ({
  title,
  onPress,
  variant = "secondary",
  style,
}) => {
  if (variant === "primary") {
    return (
      <TouchableOpacity
        style={[styles.buttonContainer, style]}
        onPress={onPress}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.secondaryButton, style]} onPress={onPress}>
      <Text style={styles.secondaryButtonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: "100%",
    marginBottom: 16,
  },
  primaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textWhite,
  },
  secondaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
});

export default SelectionButton;
