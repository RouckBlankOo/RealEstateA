import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Colors, FormStyles } from "../styles";

interface FormSeparatorProps {
  text?: string;
  style?: ViewStyle;
  compact?: boolean;
}

const FormSeparator: React.FC<FormSeparatorProps> = ({
  text = "Or",
  style,
  compact = false,
}) => {
  return (
    <View style={[
      compact ? styles.compactSeparatorContainer : FormStyles.separatorContainer,
      style
    ]}>
      <View style={FormStyles.separatorLine} />
      <Text style={FormStyles.separatorText}>{text}</Text>
      <View style={FormStyles.separatorLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  compactSeparatorContainer: {
    ...FormStyles.separatorContainer,
    color: Colors.primary,
    marginTop: 10,
    marginVertical: 20,
    marginBottom: 20,
  },
});

export default FormSeparator;