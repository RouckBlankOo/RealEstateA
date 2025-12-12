import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import { LayoutStyles, Colors } from "../styles";

interface AuthLayoutProps {
  children: React.ReactNode;
  compact?: boolean;
  style?: ViewStyle;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  compact = false,
  style,
}) => {
  return (
    <KeyboardAvoidingView
      style={LayoutStyles.keyboardAvoidingView}
      behavior={Platform.OS === "android" ? "height" : "padding"}
      keyboardVerticalOffset={Platform.OS === "android" ? 0 : 40}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[
          LayoutStyles.screenContainer,
          compact && styles.compactScreen,
          style
        ]}>
          {children}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  compactScreen: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
});

export default AuthLayout;