import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ErrorPopupProps {
  message: string;
  visible: boolean;
  onHide?: () => void;
}

export const ErrorPopup: React.FC<ErrorPopupProps> = ({
  message,
  visible,
  onHide,
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onHide && onHide());
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim, onHide]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.popup, { opacity: fadeAnim }]}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle" size={24} color="#FF8C42" />
      </View>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  popup: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    shadowColor: "#FF8C42",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 999,
    borderWidth: 1,
    borderColor: "#FF8C42",
  },
  iconContainer: {
    marginRight: 10,
  },
  message: {
    color: "#FF8C42",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
});
