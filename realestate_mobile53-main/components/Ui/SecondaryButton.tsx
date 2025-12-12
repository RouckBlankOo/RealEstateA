import React from "react";
import {
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Image,
  ImageSourcePropType,
} from "react-native";
import { ButtonStyles } from "../styles";
import { Typography } from "../styles/GlobalStyles";

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  icon?: ImageSourcePropType;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  style = {},
  textStyle = {},
  disabled = false,
  icon,
}) => {
  return (
    <TouchableOpacity
      style={[ButtonStyles.secondaryButton, style]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon && (
        <Image
          source={icon}
          style={ButtonStyles.socialIcon}
          resizeMode="contain"
        />
      )}
      <Text
        style={[
          ButtonStyles.secondaryButtonText,
          textStyle,
          { fontFamily: Typography.fontFamily.medium },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default SecondaryButton;
