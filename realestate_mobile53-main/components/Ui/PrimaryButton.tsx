import React from "react";
import { Text, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ButtonStyles, Colors } from "../styles";
import { Typography } from "../styles/GlobalStyles";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  style = {},
  textStyle = {},
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        ButtonStyles.primaryButton,
        disabled && ButtonStyles.primaryButtonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <LinearGradient
        colors={
          disabled
            ? [Colors.textLight, Colors.textLight]
            : [Colors.primary, Colors.primaryLight]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={ButtonStyles.primaryButtonGradient}
      >
        <Text
          style={[
            ButtonStyles.primaryButtonText,
            disabled && ButtonStyles.primaryButtonTextDisabled,
            textStyle,
            { fontFamily: Typography.fontFamily.medium },
          ]}
        >
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default PrimaryButton;
