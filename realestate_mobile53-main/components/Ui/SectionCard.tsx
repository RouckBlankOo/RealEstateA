import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Colors, Spacing, BorderRadius, Shadows } from "../styles";

interface SectionCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  padding?: number;
  shadow?: keyof typeof Shadows;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  children,
  style,
  backgroundColor = Colors.background,
  padding = Spacing.xl,
  shadow = "sm",
}) => {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor, padding },
        Shadows[shadow],
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.lg,
  },
});

export default SectionCard;