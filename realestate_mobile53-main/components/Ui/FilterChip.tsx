import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface FilterChipProps {
  title: string;
  isSelected?: boolean;
  onPress?: () => void;
  style?: any;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  title,
  isSelected = false,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.chip, isSelected && styles.chipSelected, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.chipText,
          isSelected && styles.chipTextSelected,
          { fontFamily: "raleway-500Medium" },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginRight: 10,
  },
  chipSelected: {
    backgroundColor: "#FF8C42",
    borderColor: "#FF8C42",
  },
  chipText: {
    fontSize: 14,
    color: "#8A8A8A",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#ffffff",
  },
});
