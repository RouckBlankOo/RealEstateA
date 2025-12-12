import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  FloatingLabelInput,
  PrimaryButton,
  FormSeparator,
  SecondaryButton,
  TabNavigation,
} from "../../components/Ui";
import { Colors } from "../../components/styles";
import { useAuth } from "../../contexts/AuthContext";
import { useInterest } from "../../contexts/InterestContext";
import i18n, { t } from "../../services/i18n";

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  city: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  city?: string;
}

const BuyerSignUpScreen = () => {
  const router = useRouter();
  const { interest } = useLocalSearchParams<{ interest: string }>();
  const { registerPhone, isLoading, clearError } = useAuth();
  const { setUserPreferences } = useInterest();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("signup");
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    city: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [locale, setLocale] = useState(i18n.locale);

  React.useEffect(() => {
    const checkLocale = setInterval(() => {
      if (i18n.locale !== locale) {
        setLocale(i18n.locale);
      }
    }, 100);
    return () => clearInterval(checkLocale);
  }, [locale]);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t("validation.fullNameRequired");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("validation.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("validation.emailInvalid");
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t("validation.phoneRequired");
    }

    if (!formData.password) {
      newErrors.password = t("validation.passwordRequired");
    } else if (formData.password.length < 6) {
      newErrors.password = t("validation.passwordTooShort");
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("validation.confirmPasswordRequired");
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = t("validation.passwordsNotMatch");
    }

    if (!formData.city.trim()) {
      newErrors.city = t("validation.cityRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (validateForm()) {
      try {
        clearError();
        console.log("🔄 Starting buyer registration...", {
          ...formData,
          password: "[HIDDEN]",
          interest,
        });

        // Save user interest and role using InterestContext
        const userInterest = (interest || "property") as "property" | "cars";
        const userRole = interest === "cars" ? "buyer" : "renter"; // buyer for cars, renter for property
        await setUserPreferences(userInterest, userRole);

        const result = await registerPhone({
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName: formData.fullName,
          userType: "buyer",
          interest: userInterest, // Send interest to backend
        });

        console.log("✅ Registration successful, navigating to OTP...", result);
        router.push({
          pathname: "/auth/OTPVerification",
          params: {
            phoneNumber: formData.phoneNumber,
            userType: "buyer",
          },
        });
      } catch (err: any) {
        console.error("❌ Registration error:", err);
        Alert.alert(
          "Registration Failed",
          err.message || "An error occurred during registration"
        );
      }
    }
  };

  const handleGoogleSignUp = () => {
    console.log("Google Sign Up");
    // Add Google authentication logic here
  };

  const handleAppleSignUp = () => {
    console.log("Apple Sign Up");
    // Add Apple authentication logic here
  };

  const tabOptions = [
    {
      key: "login",
      title: t("authentication.login"),
      onPress: () => {
        setActiveTab("login");
        router.push("/auth/SignIn");
      },
    },
    {
      key: "signup",
      title: t("authentication.signUp"),
      onPress: () => setActiveTab("signup"),
    },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/Auth/Appartment.png")}
            style={styles.apartmentImage}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {t("authentication.buyerSignUpTitle")} -{" "}
          {interest === "cars"
            ? t("authentication.cars")
            : t("authentication.property")}
        </Text>

        {/* Tab Navigation */}
        <TabNavigation tabs={tabOptions} activeTab={activeTab} />

        {/* Form */}
        <View style={styles.formContainer}>
          <FloatingLabelInput
            label={t("authentication.fullName")}
            value={formData.fullName}
            onChangeText={(value) => updateFormData("fullName", value)}
            placeholder={t("authentication.enterFullName")}
            error={errors.fullName}
          />

          <FloatingLabelInput
            label={t("authentication.email")}
            value={formData.email}
            onChangeText={(value) => updateFormData("email", value)}
            placeholder={t("authentication.enterEmail")}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <FloatingLabelInput
            label={t("authentication.phoneNumber")}
            value={formData.phoneNumber}
            onChangeText={(value) => updateFormData("phoneNumber", value)}
            placeholder={t("authentication.enterPhoneNumber")}
            keyboardType="phone-pad"
            error={errors.phoneNumber}
          />

          <FloatingLabelInput
            label={t("authentication.city")}
            value={formData.city}
            onChangeText={(value) => updateFormData("city", value)}
            placeholder={t("authentication.enterCity")}
            error={errors.city}
          />

          <FloatingLabelInput
            label={t("authentication.password")}
            value={formData.password}
            onChangeText={(value) => updateFormData("password", value)}
            placeholder={t("authentication.enterPassword")}
            secureTextEntry
            showPasswordToggle
            passwordVisible={passwordVisible}
            onPasswordToggle={() => setPasswordVisible(!passwordVisible)}
            error={errors.password}
          />

          <FloatingLabelInput
            label={t("authentication.confirmPassword")}
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData("confirmPassword", value)}
            placeholder={t("authentication.confirmYourPassword")}
            secureTextEntry={!passwordVisible}
            error={errors.confirmPassword}
          />

          <PrimaryButton
            title={
              isLoading
                ? t("authentication.creatingAccount")
                : t("authentication.signUp")
            }
            onPress={handleSignUp}
            disabled={isLoading}
            style={styles.signUpButton}
          />

          <FormSeparator />

          <SecondaryButton
            title={t("authentication.google")}
            onPress={handleGoogleSignUp}
            icon={require("../../assets/images/Auth/Google.png")}
            style={styles.socialButton}
          />

          <SecondaryButton
            title={t("authentication.apple")}
            onPress={handleAppleSignUp}
            icon={require("../../assets/images/Auth/Apple_Logo.png")}
            style={styles.socialButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  apartmentImage: {
    width: 250,
    height: 200,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 30,
  },
  formContainer: {
    marginTop: 20,
  },
  signUpButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  socialButton: {
    marginBottom: 10,
    borderRadius: 30,
  },
});

export default BuyerSignUpScreen;
