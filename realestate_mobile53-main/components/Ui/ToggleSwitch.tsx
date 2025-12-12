import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface ToggleSwitchProps {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  activeColor?: string;
  inactiveColor?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  value,
  onToggle,
  activeColor = "#FF8C42",
  inactiveColor = "#CCCCCC",
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.switchContainer}
        onPress={() => onToggle(!value)}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.switch,
            { backgroundColor: value ? activeColor : inactiveColor },
          ]}
        >
          <View
            style={[
              styles.thumb,
              {
                transform: [{ translateX: value ? 22 : 2 }],
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    fontFamily: "raleway-500Medium",
    flex: 1,
  },
  switchContainer: {
    padding: 5,
  },
  switch: {
    width: 50,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    position: "relative",
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default ToggleSwitch;
