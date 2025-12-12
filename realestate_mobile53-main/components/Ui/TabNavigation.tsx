import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Typography, BorderRadius, ButtonStyles } from "../styles";

interface TabOption {
  key: string;
  title: string;
  onPress: () => void;
}

interface TabNavigationProps {
  tabs: TabOption[];
  activeTab: string;
  style?: ViewStyle;
  compact?: boolean;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  style,
  compact = false,
}) => {
  return (
    <View
      style={[
        compact ? styles.compactTabContainer : ButtonStyles.tabContainer,
        style,
      ]}
    >
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            ButtonStyles.tabButton,
            index === 0 ? {} : activeTab === tab.key ? {} : styles.inactiveTab,
          ]}
          onPress={tab.onPress}
        >
          {activeTab === tab.key ? (
            <LinearGradient
              colors={[Colors.primary, Colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={ButtonStyles.activeTabGradient}
            >
              <Text style={ButtonStyles.activeTabText}>{tab.title}</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.inactiveTabText}>{tab.title}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  compactTabContainer: {
    ...ButtonStyles.tabContainer,
    marginBottom: 30,
    gap: 12,
  },
  inactiveTab: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  inactiveTabText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
    textAlign: "center",
    paddingVertical: 12,
  },
});

export default TabNavigation;
