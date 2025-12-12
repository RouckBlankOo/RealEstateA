import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Colors } from "../styles";
import { BackButton } from "./BackButton";

interface ScreenLayoutProps {
  title: string;
  children: React.ReactNode;
  showBackButton?: boolean;
  contentStyle?: ViewStyle;
}

const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  title,
  children,
  showBackButton = true,
  contentStyle,
}) => {
  return (
    <View style={styles.container}>
      {showBackButton && (
        <View style={styles.backButtonContainer}>
          <BackButton color={Colors.textPrimary} />
        </View>
      )}

      <View style={[styles.contentContainer, contentStyle]}>
        <Text style={styles.title}>{title}</Text>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backButtonContainer: {
    marginBottom: 40,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 80,
  },
});

export default ScreenLayout;
