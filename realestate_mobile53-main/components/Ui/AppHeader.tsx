import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AppHeaderProps {
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  onTogglePress?: () => void;
  toggleValue?: boolean;
  style?: any;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onMenuPress,
  onNotificationPress,
  onTogglePress,
  toggleValue = true,
  style,
}) => {
  return (
    <View style={[styles.header, style]}>
      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
        <View style={styles.menuIcon}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </View>
      </TouchableOpacity>
      
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={24} color="#333333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onTogglePress}>
          <View style={styles.toggleContainer}>
            <View style={[styles.toggleSwitch, toggleValue && styles.toggleActive]}>
              <View style={[styles.toggleThumb, toggleValue && styles.toggleThumbActive]} />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  menuButton: {
    padding: 10,
  },
  menuIcon: {
    width: 24,
    height: 24,
    justifyContent: "space-between",
  },
  menuLine: {
    width: 24,
    height: 3,
    backgroundColor: "#FF8C42",
    borderRadius: 2,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 15,
  },
  toggleContainer: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleSwitch: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  toggleActive: {
    backgroundColor: "#FF8C42",
    alignItems: "flex-end",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  toggleThumbActive: {
    backgroundColor: "#FFFFFF",
  },
});