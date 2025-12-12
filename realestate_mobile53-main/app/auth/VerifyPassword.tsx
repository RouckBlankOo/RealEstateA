import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
} from "react-native";

export default function VerifyCode() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef<(TextInput | null)[]>([]);

  // Handle code input change
  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    // Submit if last digit entered
    if (index === 5 && text) {
      Keyboard.dismiss();
    }
  };

  // Handle backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const verifyCode = async () => {
    setIsLoading(true);
    const fullCode = code.join("");

    try {
      // Validate code length
      if (fullCode.length !== 6) {
        throw new Error("Please enter the full 6-digit code");
      }

      // Here you would call your verification API
      // const isValid = await verifyResetCode(params.destination, fullCode);
      // Mock verification for demonstration:
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // On successful verification
      router.push({
        pathname: "./ResetPassword",
        params: {
          verified: "true",
          destination: params.destination,
          tempToken: "mock-token-123", // Replace with actual token from API
        },
      });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      // Here you would call your resend API
      // await resendVerificationCode(params.destination);
      setCountdown(60);
      Alert.alert("Code Sent", "A new verification code has been sent");
    } catch (error) {
      Alert.alert("Error", "Failed to resend code");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verification</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to {params.destination}
      </Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref: TextInput | null) => {
              inputs.current[index] = ref;
            }}
            style={[styles.codeInput, digit && styles.filledInput]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            selectTextOnFocus
            editable={!isLoading}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.disabledButton]}
        onPress={verifyCode}
        disabled={isLoading || code.join("").length !== 6}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Verifying..." : "Verify Code"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={resendCode}
        disabled={countdown > 0}
      >
        <Text
          style={[styles.resendText, countdown > 0 && styles.disabledResend]}
        >
          {countdown > 0
            ? `Resend code in ${countdown}s`
            : "Resend Verification Code"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: "#666",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  codeInput: {
    width: 45,
    height: 60,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  filledInput: {
    borderColor: "#800080",
    backgroundColor: "#f9f0ff",
  },
  button: {
    backgroundColor: "#800080",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  resendButton: {
    alignItems: "center",
  },
  resendText: {
    color: "#800080",
    textDecorationLine: "underline",
  },
  disabledResend: {
    color: "#999",
    textDecorationLine: "none",
  },
});
