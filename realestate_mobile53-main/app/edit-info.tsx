import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import i18n from "../services/i18n";

export default function EditInfoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [locale, setLocale] = useState(i18n.locale);

  const [fullName, setFullName] = useState((user as any)?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState((user as any)?.phone || "");
  const [city, setCity] = useState((user as any)?.city || "");

  // Listen for language changes
  React.useEffect(() => {
    const checkLocale = setInterval(() => {
      if (i18n.locale !== locale) {
        setLocale(i18n.locale);
      }
    }, 100);

    return () => clearInterval(checkLocale);
  }, [locale]);

  const handleSave = () => {
    // Implement save logic here
    Alert.alert(t("editInfo.successTitle"), t("editInfo.successMessage"), [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#252B5C" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.title}>{t("editInfo.title")}</Text>

      {/* Profile Photo */}
      <View style={styles.photoSection}>
        <View style={styles.photoContainer}>
          {(user as any)?.avatar ? (
            <Image
              source={{ uri: (user as any).avatar }}
              style={styles.photo}
            />
          ) : (
            <Image
              source={require("../assets/sam b.png")}
              style={styles.photo}
            />
          )}
          <TouchableOpacity style={styles.editPhotoButton}>
            <Image
              source={require("../assets/Icons/Edit.png")}
              style={styles.editIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("editInfo.fullName")}</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder={t("editInfo.fullNamePlaceholder")}
            placeholderTextColor="#A1A5C1"
          />
        </View>

        {/* Email Address */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("editInfo.emailAddress")}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={t("editInfo.emailPlaceholder")}
            placeholderTextColor="#A1A5C1"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Phone Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("editInfo.phoneNumber")}</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder={t("editInfo.phonePlaceholder")}
            placeholderTextColor="#A1A5C1"
            keyboardType="phone-pad"
          />
        </View>

        {/* City */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("editInfo.city")}</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder={t("editInfo.cityPlaceholder")}
            placeholderTextColor="#A1A5C1"
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{t("editInfo.save")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "Raleway-Bold",
    color: "#FF8C42",
    textAlign: "center",
    marginBottom: 30,
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  photoContainer: {
    position: "relative",
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF8C42",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  editIcon: {
    width: 18,
    height: 18,
    tintColor: "#FFFFFF",
  },
  form: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: "Raleway-Medium",
    color: "#FF8C42",
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    backgroundColor: "#F5F4F8",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 14,
    fontFamily: "Raleway-Regular",
    color: "#252B5C",
    borderWidth: 1,
    borderColor: "#F5F4F8",
  },
  saveButton: {
    backgroundColor: "#FF8C42",
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#FF8C42",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: "Raleway-Bold",
    color: "#FFFFFF",
  },
});
