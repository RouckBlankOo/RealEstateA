import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Colors } from "../styles";
import { BackButton } from "./BackButton";

interface HeaderWithBackButtonProps {
  onBackPress?: () => void;
  style?: any;
}

export const HeaderWithBackButton: React.FC<HeaderWithBackButtonProps> = ({
  onBackPress,
  style,
}) => {
  return (
    <View style={[styles.header, style]}>
      <BackButton onPress={onBackPress} color={Colors.textPrimary} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
