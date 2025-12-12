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
  confirmPassword: string; // Add this for validation
  bankAccount: string;
  city: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string; // Add this
  bankAccount?: string;
  city?: string;
}

const SellerSignUpScreen = () => {
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
    bankAccount: "",
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

    if (!formData.bankAccount.trim()) {
      newErrors.bankAccount = t("validation.bankAccountRequired");
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

        // Save user interest and role using InterestContext
        const userInterest = (interest || "property") as "property" | "cars";
        const userRole = "seller"; // Always seller for this signup flow
        await setUserPreferences(userInterest, userRole);

        // Split full name into first and last name
        const nameParts = formData.fullName.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || "";

        const registrationData = {
          phoneNumber: formData.phoneNumber,
          email: formData.email, // Required for email verification since SMS is not available
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName,
          lastName,
          userType: "seller" as const,
          interest: userInterest, // Send interest to backend
        };

        const result = await registerPhone(registrationData);

        if (result.needsVerification) {
          // Show success message and inform user to check email
          Alert.alert(
            "Registration Successful!",
            `A verification link has been sent to ${formData.email}. Please check your email to verify your account.`,
            [
              {
                text: "OK",
                onPress: () => {
                  // Navigate to a verification pending screen or back to login
                  router.push("/auth/SignIn");
                },
              },
            ]
          );
        }
      } catch (err: any) {
        Alert.alert(
          "Registration Failed",
          err.message ||
            "An error occurred during registration. Please try again."
        );
      }
    }
  };

  const handleGoogleSignUp = () => {
    console.log("Google Sign Up for Seller");
  };

  const handleAppleSignUp = () => {
    console.log("Apple Sign Up for Seller");
  };

  const tabOptions = [
    {
      key: "login",
      title: t("authentication.login"),
      onPress: () => router.back(),
    },
    {
      key: "signup",
      title: t("authentication.signUp"),
      onPress: () => setActiveTab("signup"),
    },
  ];

  // Function to render the appropriate image based on interest selection
  const renderInterestImage = () => {
    if (interest === "cars") {
      return (
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/images/Auth/Car.png")}
            style={styles.interestImage}
            resizeMode="contain"
          />
        </View>
      );
    } else if (interest === "property") {
      return (
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/images/Auth/Appartment.png")}
            style={styles.interestImage}
            resizeMode="contain"
          />
        </View>
      );
    }

    // Default fallback
    return (
      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/images/Auth/Car.png")}
          style={styles.interestImage}
          resizeMode="contain"
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Dynamic Image Based on Interest Selection */}
        {renderInterestImage()}

        <Text style={styles.title}>
          {t("authentication.sellerSignUpTitle")}
        </Text>

        <TabNavigation
          tabs={tabOptions}
          activeTab={activeTab}
          compact
          style={styles.tabNavigation}
        />

        <View style={styles.formContainer}>
          <FloatingLabelInput
            label={t("authentication.fullName")}
            value={formData.fullName}
            onChangeText={(value) => updateFormData("fullName", value)}
            placeholder={t("authentication.enterFullName")}
            error={errors.fullName}
            style={styles.inputStyle}
          />

          <FloatingLabelInput
            label={t("authentication.emailAddress")}
            value={formData.email}
            onChangeText={(value) => updateFormData("email", value)}
            placeholder={t("authentication.enterEmail")}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            style={styles.inputStyle}
          />

          <FloatingLabelInput
            label={t("authentication.phoneNumber")}
            value={formData.phoneNumber}
            onChangeText={(value) => updateFormData("phoneNumber", value)}
            placeholder={t("authentication.enterPhoneNumber")}
            keyboardType="phone-pad"
            error={errors.phoneNumber}
            style={styles.inputStyle}
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
            style={styles.inputStyle}
          />

          <FloatingLabelInput
            label={t("authentication.confirmPassword")}
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData("confirmPassword", value)}
            placeholder={t("authentication.confirmYourPassword")}
            secureTextEntry
            error={errors.confirmPassword}
            style={styles.inputStyle}
          />

          <FloatingLabelInput
            label={t("authentication.bankAccount")}
            value={formData.bankAccount}
            onChangeText={(value) => updateFormData("bankAccount", value)}
            placeholder={t("authentication.enterBankAccount")}
            error={errors.bankAccount}
            style={styles.inputStyle}
          />

          <FloatingLabelInput
            label={t("authentication.city")}
            value={formData.city}
            onChangeText={(value) => updateFormData("city", value)}
            placeholder={t("authentication.enterCity")}
            error={errors.city}
            style={styles.inputStyle}
          />
        </View>

        <PrimaryButton
          title={
            isLoading
              ? t("authentication.creatingAccount")
              : t("authentication.createAccount")
          }
          onPress={handleSignUp}
          disabled={isLoading}
          style={styles.createAccountButton}
        />

        <FormSeparator text={t("authentication.or")} style={styles.separator} />

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

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {},
  imageContainer: {
    alignItems: "center",
  },
  carImagePlaceholder: {
    width: 300,
    height: 300,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  carImageText: {
    fontSize: 60,
  },
  carImage: {
    width: 180,
    height: 120,
    marginBottom: 10,
  },
  interestImage: {
    width: 300,
    height: 300,
    marginBottom: -60,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  tabNavigation: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  formContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  inputStyle: {
    marginBottom: 0,
  },
  createAccountButton: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  separator: {
    marginHorizontal: 20,
    marginVertical: 20,
  },
  socialButton: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default SellerSignUpScreen;
